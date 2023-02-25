const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    role: {
      type: Number,
      default: 0,
    },
    posts: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
      ],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

// UserSchema.pre("save", async function (next) {
//   const user = this;

//   if (!user.isModified("password")) {
//     return next();
//   }

//   try {
//     const hash = await bcrypt.hash(user.password, 10);
//     user.password = hash;
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

UserSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Expires in 24 hours
  return token;
};

module.exports = mongoose.model("User", UserSchema);
