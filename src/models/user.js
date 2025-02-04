import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    type: String,
    minLength: 6,
  },
  dateOfBirth:{
    type: Date,
  },
  joinedDate:{
    type: Date,
    default: Date.now,
  },
  nickname: {
    type: String,
  },
  profilePic: {
    type: String,
  },
  coverPic: {
    type: String,
  },
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  follower:{
    type: Number,
    default: 0,
  },
  following:{
    type: Number,
    default: 0,
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
