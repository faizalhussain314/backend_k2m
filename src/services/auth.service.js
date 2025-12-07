const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const  User  = require('../models/user.model');
// const { admin } = require('../config/firebase');  // Adjust path as needed

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Users>}
 */
const loginUserWithEmailAndPassword = async (phoneNumber, password) => {
  const user = await userService.getUserByEmail(phoneNumber);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
  }
  if (!user.password) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User does not have a password set');
  }
   if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect Phone Number or password');
  }

  const userId =  user._id;

  return user
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  // Verify the refresh token
  const refreshTokenDocVerify = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);

  // Fetch the user by ID
  const user = await userService.getUserById(refreshTokenDocVerify.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Find and delete the refresh token document
  const refreshTokenDoc = await Token.findOneAndDelete({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Refresh token not found');
  }

  // Update the user's deviceInfoHash to an empty string
  user.deviceInfoHash = '';
  await user.save();

  return { message: 'Logged out successfully' };
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
// const resetPassword = async (resetPasswordToken, newPassword) => {
//   try {
//     const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
//     const user = await userService.getUserById(resetPasswordTokenDoc.user);
//     if (!user) {
//       throw new Error();
//     }
//     await userService.updateUserById(user.id, { password: newPassword });
//     await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
//   } catch (error) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed'+error);
//   }
// };

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

const getUserWithRoles = async (userId) => {
  const user = await User.findById(userId)
  .populate({
    path: 'roleIds',
    select: 'role' // Include only the 'role' field
  })
  .exec();

  return user;
};






// async function verifyIdToken(idToken) {
//   try {
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     return decodedToken;
//   } catch (error) {
//     throw new Error('Invalid ID token');
//   }
// }

// async function updateUserPassword(uid, newPassword) {
//   try {
//     await admin.auth().updateUser(uid, { password: newPassword });
//     return true;
//   } catch (error) {
//     throw new Error('Failed to update password');
//   }
// }



module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  // resetPassword,
  verifyEmail,
  // verifyIdToken,
  // updateUserPassword,

};
