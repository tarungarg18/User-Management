import { Router } from "express";
import { checkAuth, allowRoles } from "../middleware/auth.js";
import {
  createUser,
  deactivateUser,
  getMyProfile,
  getUserById,
  listUsers,
  updateMyProfile,
  updateUser
} from "../controllers/userController.js";
import { wrap } from "../utils/wrap.js";

const router = Router();

router.get("/me", checkAuth, wrap(getMyProfile));
router.patch("/me", checkAuth, wrap(updateMyProfile));

router.get("/", checkAuth, allowRoles("admin", "manager"), wrap(listUsers));
router.post("/", checkAuth, allowRoles("admin"), wrap(createUser));
router.get("/:id", checkAuth, allowRoles("admin", "manager", "user"), wrap(getUserById));
router.patch("/:id", checkAuth, allowRoles("admin", "manager"), wrap(updateUser));
router.delete("/:id", checkAuth, allowRoles("admin"), wrap(deactivateUser));

export default router;
