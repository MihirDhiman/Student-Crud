import express from "express";
import {
  updateStudentStatus,
  getAllStudents,
  collegeLogin,
  collegeRegister,
} from "../controllers/collegeController.js";
import { verifyToken, verifyCollege } from "../middleware/auth.js";
import { sendStatusEmails } from "../controllers/responseController.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: College
 *     description: College endpoints
 */

/**
 * @swagger
 * /api/college/college-register:
 *   post:
 *     tags: [College]
 *     summary: Register a college
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/College'
 *     responses:
 *       200:
 *         description: College registered
 */
router.post("/college-register", collegeRegister);

/**
 * @swagger
 * /api/college/college-login:
 *   post:
 *     tags: [College]
 *     summary: College login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success, returns JWT
 */
router.post("/college-login", collegeLogin);

/**
 * @swagger
 * /api/college/students:
 *   get:
 *     tags: [College]
 *     summary: Get all students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
router.get("/students", verifyToken, getAllStudents);

/**
 * @swagger
 * /api/college/student:
 *   put:
 *     tags: [College]
 *     summary: Update a student status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentStatusUpdate'
 *     responses:
 *       200:
 *         description: Student status updated
 */
router.put("/student", verifyToken, updateStudentStatus);

/**
 * @swagger
 * /api/college/notify-students:
 *   post:
 *     tags: [College]
 *     summary: Send status emails to students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emails sent
 */
router.post("/notify-students", verifyCollege, sendStatusEmails);

export default router;
