import { Router } from "express";
import { changeAvatar, changeCoverImage, changePassword, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewars/multer.middleware.js"
import { verifyJWT } from "../middlewars/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1 
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-avatar").post(verifyJWT,upload.single("avatar"),changeAvatar)
router.route("/update-coverImage").post(verifyJWT,upload.single("coverImage"),changeCoverImage)
router.route("/update-password").post(verifyJWT,changePassword)
export default router
