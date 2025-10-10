import express from "express";
import {
  updateStudentStatus,
  getAllStudents,
  collegeLogin,
  collegeRegister,
} from "../controllers/collegeController.js";
import { verifyToken, verifyCollege } from "../middleware/auth.js";
import {sendStatusEmails} from '../controllers/responseController.js'
const router = express.Router();

// College login register
router.post("/college-login", collegeLogin);
router.post("/college-register", collegeRegister);

// Student approval routes
router.put("/student/", verifyToken, updateStudentStatus);
router.get("/students", verifyToken, getAllStudents);

router.post("/notify-students", verifyCollege, sendStatusEmails);

export default router;
