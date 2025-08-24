import express from "express";
import { userRegistrationValidationRules, passwordResetValidation, usertypeValidation } from "../middlewares/validationMiddleware.js"
import { userRegisterPostController, userLoginPostController, verifyUserController, forgotPasswordController, verifyForgotPasswordController , resetPasswordController} from "../controllers/userControllers.js"
const router = express.Router();

/* resend verification, forgot password, logout */

router.post("/register", 
    userRegistrationValidationRules(), 
    userRegisterPostController);

router.post("/login",
    usertypeValidation(),
    userLoginPostController);

router.get("/verify/:verificationcode/:usertype", 
    verifyUserController);

router.post("/forgot-password", 
    forgotPasswordController);

router.get("/verify-forgot-password/:email/:verificationcode/:usertype", 
    verifyForgotPasswordController);

router.post("/reset-password/:verificationcode", 
    passwordResetValidation(), 
    resetPasswordController)

export default router