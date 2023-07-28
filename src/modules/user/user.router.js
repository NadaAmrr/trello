import * as userController from "./controller/user.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { Router } from "express";
import * as validators from "./validation.js";
import { validation } from "../../middleware/validation.js";
const router = Router();
import { fileValidation, uploadFile } from '../../utils/multer.cloudinary.js' ;
import { auth, userLoggedIn } from "../../middleware/auth.js";

// change password (user must be logged in)
router.patch(
  "/changePassword",
  validation(validators.changePassword),
  auth,
  userLoggedIn,
  asyncHandler(userController.changePassword)
);

// update user (age , firstName , lastName)(user must be logged in)
router.put(
  "/update",
  validation(validators.update),
  auth,
  userLoggedIn,
  asyncHandler(userController.updateUser)
);

// delete user(user must be logged in)
router.delete(
  "/delete",
  validation(validators.id),
  auth,
  userLoggedIn,
  asyncHandler(userController.deleteUser)
);

// soft delete(user must be logged in)
router.patch(
  "/softDelete",
  validation(validators.id),
  auth,
  userLoggedIn,
  asyncHandler(userController.softDelete)
);

// logout
router.patch(
  "/logout",
  validation(validators.id),
  auth,
  userLoggedIn,
  asyncHandler(userController.logout)
);
//profile image
router.patch (
  "/profile/image",
  auth,
  userLoggedIn, 
  uploadFile(fileValidation.image).single('image'),
  asyncHandler(userController.profilePicture)
);
//Delete profile image
router.delete (
  "/profile/image",
  auth,
  userLoggedIn, 
  // uploadFile(fileValidation.image).single('image'),
  asyncHandler(userController.deleteProfilePicture)
);
//cover images
router.patch(
  "/profile/coverImages",
  auth,
  userLoggedIn, 
  uploadFile(fileValidation.image).array('image' , 5),
  asyncHandler(userController.coverImages)
);
// upload attachment to task
router.patch(
  "/profile/attachment",
  auth,
  userLoggedIn, 
  uploadFile('user/attachment' ,[...fileValidation.image,...fileValidation.file]).fields([{ name: 'image', maxCount: 1},{ name: 'pdf', maxCount: 1}]),
  asyncHandler(userController.attachment)
);
export default router;
// let x = [{
//   name:"x"
// },'b','c']
// console.log([...fileValidation.image,...fileValidation.file]);