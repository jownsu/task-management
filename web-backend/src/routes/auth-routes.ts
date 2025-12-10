import { Router } from "express";
import {
	googleAuth,
	googleCallback,
	getCurrentUser,
	refreshToken,
	logout,
	logoutAll,
} from "@/controllers/auth-controller";
import { requireAuth } from "@/middleware/auth";

const router = Router();

/* Google OAuth routes */
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

/* Token management */
router.get("/me", requireAuth, getCurrentUser);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);

export default router;
