const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name required'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Email required'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,
    password: {
      type: String,
      required: [true, 'password required'],
      minlength: [6, 'password must be at least 6 characters'],
    },
    passwordUpdatedAt: Date,
    passwordResetCode: String,
    passwordResetExpire: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ['user', 'manager', 'admin'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
    },
    // Embedded Collection
    addresses: [
      {
        id: { type: mongoose.Schema.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
    // child reference (one to many)
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

/** Mongoose Middlewares **/
/** 1) return base url + img name **/
// logic
const setImgUrl = (doc) => {
  if (doc.profileImg) {
    const imgUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
    doc.profileImg = imgUrl;
  }
};
// in create case
userSchema.post('save', (doc) => {
  doc.profileImg = setImgUrl(doc);
});
// in the rest cases
userSchema.post('init', (doc) => {
  setImgUrl(doc);
});

/** 2) Hashing Password **/
userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

module.exports = mongoose.model('User', userSchema);
