import * as authController from "./controller/auth.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { Router } from "express";
const router = Router();
import * as validators from "./validation.js";
import { validation } from "../../middleware/validation.js";
import { auth } from "../../middleware/auth.js";

// signUp
router.post(
  "/signup",
  validation(validators.signup),
  asyncHandler(authController.signup)
);
// confirm Email
router.get("/confirmEmail/:token", asyncHandler(authController.confirmEmail));
// New confirm Email
router.get(
  "/newConfirmEmail/:token",
  asyncHandler(authController.newConfirmEmail)
);
// login
router.post(
  "/login",
  validation(validators.login),
  asyncHandler(authController.login)
);
//forget password
router.post(
  "/forgetPassword",
  validation(validators.forgetPassword),
  asyncHandler(authController.forgetPassword)
);
//forget password
router.post(
  "/newPassword/:token",
  validation(validators.newPassword),
  asyncHandler(authController.newPassword)
);
export default router;
