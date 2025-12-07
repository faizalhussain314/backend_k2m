const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { required } = require('joi');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,  
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => validator.isMobilePhone(v),
        message: 'Invalid phone number',
      },
    },
    password: {
      type: String,
      private: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      required: true,
    },
    otp: {
      code: { type: String }, // OTP code
      expiresAt: { type: Date }, // OTP expiry time
      sentAt: { type: Date }, // OTP sent time
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    vendorId: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: false,
    },    
      mapUrl: {
      type: String,
      required: false,
    },   
    address: { 
      type: String, 
      required: false 
    },  
    landMark: { 
      type: String, 
      required: false 
    }, 
    latitude: { 
      type: Number, 
      required: false 
    },
    isVeg :{
      type: Boolean,
      default: false,
    },  
    longitude: { 
      type: Number, 
      required: false 
    },
  },
  {
    timestamps: true,
  });

// userSchema.plugin(toJSON);
// userSchema.plugin(paginate);

// Check if phone number is taken
userSchema.statics.isPhoneTaken = async function (phoneNumber, excludeUserId) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};


// /**
//  * Check if password matches the user's password
//  * @param {string} password
//  * @returns {Promise<boolean>}
//  */
// userSchema.methods.isPasswordMatch = async function (password) {
//   const user = this;
//   return bcrypt.compare(password, user.password);
// };

// userSchema.pre('save', async function (next) {
//   const user = this;
//   if (user.isModified('password')) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });

// const User = mongoose.model('User', userSchema);
// module.exports = { User };

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if email is taken
 * @param {string} phoneNumber - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPhoneNoTaken = async function (phoneNumber, excludeUserId) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};


/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = { User };
