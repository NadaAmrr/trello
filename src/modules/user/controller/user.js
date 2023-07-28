import { asyncHandler } from "../../../utils/errorHandling.js";
import bcrypt from "bcryptjs";
import userModel from "../../../../DB/model/User.model.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import jwt from "jsonwebtoken";
import cloudinary from "../../../utils/cloudinary.js";
// =================Change Password=========================
export const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, cPassword } = req.body;

  const hashPassword = bcrypt.hashSync(newPassword, 8);
  const user = await userModel
    .updateOne({ _id: req.user._id }, { password: hashPassword }, { new: true })
    .select("-password");

  if (!user) {
    return next(new Error("In-valid user id", { cause: 400 }));
  } else {
    return res.status(StatusCodes.OK).json({ message: "done", user });
  }
};
// =================Update User====================
export const updateUser = async (req, res) => {
  const { age, userName, phone, firstName, lastName, gender } = req.body;

  //check gender
  if (gender != undefined) {
    switch (gender) {
      case "male":
      case "female":
        break;
      default:
        res.status(StatusCodes.BAD_REQUEST).json({
          message: `ValidationError: status: ${gender} is not a valid enum value for path gender`,
        });
        break;
    }
  }
  const user = await userModel
    .updateOne(
      { _id: req.user._id },
      { age, userName, phone, firstName, lastName, gender },
      { new: true }
    )
    .select({ userName, firstName, lastName, gender, phone, age });

  if (!user) {
    return next(new Error("In-valid user id", { cause: 400 }));
  } else {
    return res.status(StatusCodes.OK).json({ message: "done", user });
  }
};
// =================Delete User====================
export const deleteUser = async (req, res) => {
  const user = await userModel.deleteOne({ _id: req.user._id });
  if (!user) {
    return next(new Error("In-valid user id", { cause: 400 }));
  } else {
    return res.status(StatusCodes.OK).json({ message: "done", user });
  }
};
// =================soft delete====================
export const softDelete = async (req, res) => {
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { isDeleted: true },
    { new: true }
  );

  if (!user) {
    return next(new Error("In-valid user id", { cause: 400 }));
  } else {
    return res.status(StatusCodes.OK).json({ message: "done", user });
  }
};
// =================Logout=========================
export const logout = async (req, res) => {
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { isLoggedIn: false, isOnline: false },
    { new: true }
  );
  if (!user) {
    return next(new Error("In-valid user id", { cause: 400 }));
  } else {
    return res.status(StatusCodes.OK).json({ message: "done", user });
  }
};
// ==================profile picture===============
export const profilePicture = async (req, res, next) => {
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `trello/user/${req.user._id}/profile` }
  );
  const user = await userModel
    .findByIdAndUpdate(
      req.user._id,
      { profilePicture: { secure_url, public_id } },
      { new: true }
    )
    .select("profilePicture");
  return res.json({ message: "Done", file: req.file, user });
};
// ==================Delete profile picture===============
export const deleteProfilePicture = async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(new Error("In-valid user id", { cause: 400 }));
  }
  const cloud = await cloudinary.uploader.destroy(
    user.profilePicture.public_id
  );

  const deleteProfilePic = userModel.updateOne(
    { _id: req.user._id },
    { $unset: { profilePicture: 1 } }
  );

  if (!deleteProfilePic) {
    return next(new Error("In-valid data", { cause: 400 }));
  }
  return res.json({ message: "Delete Successfully" , cloud});
};
// ==================Cover Images===============
export const coverImages = async (req, res, next) => {
  const coverImages = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `trello/user/${req.user._id}/cover` }
    );

    coverImages.push({ secure_url, public_id });
  }
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { coverImages },
    { new: true }
  );

  return res.json({ message: "Done", user, file: req.files });
};

