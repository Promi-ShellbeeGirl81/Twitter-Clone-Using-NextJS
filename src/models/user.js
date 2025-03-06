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
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' ,  default: [] }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' ,  default: [] }],
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
