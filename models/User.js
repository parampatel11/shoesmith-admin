// admin/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String, // this is your GitHub username
  email: { type: String, unique: true },
  image: String,
  emailVerified: Date,
}, { timestamps: true });


export default mongoose.models.User || mongoose.model("User", UserSchema);
