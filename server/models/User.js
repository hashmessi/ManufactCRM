const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @typedef {Object} UserDocument
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {'admin'|'manager'|'associate'} role
 * @property {number} target - Monthly revenue target in INR
 * @property {mongoose.Types.ObjectId} manager - Reference to managing user
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'manager', 'associate'],
        message: '{VALUE} is not a valid role',
      },
      default: 'associate',
    },
    target: {
      type: Number,
      default: 0,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook — hash password when modified.
 * Mongoose 9: async function, NO next() parameter.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare an entered password with the stored hash.
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
