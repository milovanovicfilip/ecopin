import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  name: {
    type: String,
    trim: true
  },
  lastname: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    trim: true,
    unique: true
  },
  profilePicture: {
    type: String
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: ["USER"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  refreshToken: {
    type: String,
    select: false
  },
  reports: [{
    type: Schema.Types.ObjectId,
    ref: "reports"
  }],
  rewards: [{
    type: Schema.Types.ObjectId,
    ref: "rewards"
  }]
});

userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch(error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isRole = function(role) {
  return this.role == role;
};

userSchema.methods.addPoints = async function(newpoints) {
  if (newpoints < 0) {
    throw new Error("Cannot add negative points!");
  }

  this.points += newpoints;
  this.updatedAt = Date.now();
  await this.save();
  return this.points;
}

const User = mongoose.model('users', userSchema, 'users');
export default User;