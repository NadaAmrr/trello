import { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    //firstName
    firstName: { type: String },
    //lastName
    lastName: { type: String },
    //username
    userName: { type: String, required: true, unique: true },
    //password
    password: { type: String, required: true },
    //email
    email: { type: String, required: true, unique: true, lowercase: true },
    //age
    age: Number,
    //phone
    phone: { type: String, unique: true },
    //gender
    gender: { type: String, default: "male", enum: ["male", "female"] },
    //isOnline
    isOnline: { type: Boolean, default: false },
    //isLogged
    isLoggedIn: { type: Boolean, default: false },
    //isDeleted
    isDeleted: { type: Boolean, default: false },
    //confirmEmail
    confirmEmail: { type: Boolean, default: false },
    //profile picture
    profilePicture: { secure_url: String, public_id : String},
    //cover images
    coverImages: [{ secure_url: String, public_id : String}],
    //attachment
    attachment:[String]
  },
  { timestamps: true }
);
const userModel = model("User", userSchema);
export default userModel;
