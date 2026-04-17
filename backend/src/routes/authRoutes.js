import { Router } from "express";
import { loginUser, registerUser, seedAdminOnce } from "../controllers/authController.js";
import { checkAuth, allowRoles } from "../middleware/auth.js";
import { wrap } from "../utils/wrap.js";

const router = Router();

router.post("/login", wrap(loginUser));
router.post("/seed-admin-once", wrap(seedAdminOnce));
router.post("/register", checkAuth, allowRoles("admin"), wrap(registerUser));

export default router;
