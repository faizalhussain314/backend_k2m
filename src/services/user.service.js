const httpStatus = require('http-status');
const { Users, Role, Request } = require('../models');
const { User } = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId
const config = require('../config/config');
const { HttpStatusCode } = require('axios');



const getUserId = async (req) => {

  let userId = '';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await verifyTokenAndGetUser(token);
  userId = user.id;
  return userId;
}


const verifyTokenAndGetUser = async (token) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const user = await Users.findById(payload.sub);
    return user;
  } catch (error) {
    return error; // Or throw an error if preferred
  }
};

const getRoleIdsByRoleName = async (roleName) => {
  const roles = await Role.find({ role: roleName });
  return roles.map((role) => role.id);
};




/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (phoneNumber) => {
  return User.findOne({ phoneNumber });
};


/**
 * Get user by email
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @returns {Promise<User>}
 */
const getUserByPhone = async (phoneNumber) => {
  return User.findOne({ "phoneNumber": phoneNumber });
};


/**
 * Get user by email
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @returns {Promise<User>}
 */

/**
 * Get companys
 * @param {string} email - The  to filter users by
 * @returns {Promise<Users>}
 */
const gettUserByEmaiDetails = async (email) => {
  try {
    const results = await User.aggregate([
      {
        $match: {
          email: email
        },
      }
    ]);
    return results;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

/**
 * Get All User
 * @param {ObjectId}
 * @returns {Promise<User>}
 */
const getAllUsers = async (req) => {
  return User.find();
};



const getAllAdmins = async (req, filter, options) => {

  const [superAdminRoleIds, userRoleIds] = await Promise.all([
    getRoleIdsByRoleName("superadmin"),
    getRoleIdsByRoleName("user"),
  ]);

  // Flatten the arrays of role IDs and apply $nin filter
  const excludedRoleIds = [
    ...superAdminRoleIds,
    ...userRoleIds,
  ];
  filter.roleIds = { $nin: excludedRoleIds };
  options.sortBy = options.sortBy || 'createdAt:desc';

  const users = await User.paginate(filter, {
    ...options,
    populate: 'roleIds'
  });

  return users;
};


/**
 * Query for users with pagination
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Max number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getAllUser = async (req, filter, options) => {


  const adminRoleIds = await getRoleIdsByRoleName("User");

  filter.roleIds = { $in: adminRoleIds };
  options.sortBy = options.sortBy || 'createdAt:desc';

  const users = await User.paginate(filter, options);


  return users;
};


/**
 * Get users by RoleId
 * @param {ObjectId[]} roleIds
 * @returns {Promise<User[]>}
 */
const getUserByRoleId = async (roleIds) => {
  return Users.find({roleIds: { $in: roleIds} });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if phoneNumber is being updated
  if (updateBody.phoneNumber) {
    // Find any user with this phone number excluding the current user
    const existingUser = await User.findOne({
      phoneNumber: updateBody.phoneNumber,
      _id: { $ne: userId },  // exclude current user by id
    });

    if (existingUser) {
      throw new ApiError(httpStatus.CONFLICT, 'Phone number already in use by another user');
    }
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    return { status: httpStatus.NOT_FOUND, msg: "User not found" };
  }
//chk whether user is in trip
  const request = await Request.countDocuments({
    userId: new ObjectId(user._id)
  });
  if(request > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "The user has trip history...so you cannot delete this user..." };
  }
  
  await user.deleteOne();
  // return user;
  return { status: HttpStatusCode.Ok, msg: "data Deleted Successfully" };
};



const updatePassword = async (userId, updateBody) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!updateBody.newpassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New password is required');
  }


  user.password =updateBody.newpassword;

  await user.save();

  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getAllAdmins,
  getAllUsers,
  getAllUser,
  getUserById,
  getUserByRoleId,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  gettUserByEmaiDetails,
  getUserByPhone,
  updatePassword,
};
