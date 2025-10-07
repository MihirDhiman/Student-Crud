import express from "express";
import {
  updateStudentStatus,
  getAllStudents,
  collegeLogin,
  collegeRegister,
} from "../controllers/collegeController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// College login register
router.post("/college-login", collegeLogin);
router.post("/college-register", collegeRegister);

// Student approval routes
router.put("/student/:id/:action", verifyToken, updateStudentStatus);
router.get("/students", verifyToken, getAllStudents);

export default router;
