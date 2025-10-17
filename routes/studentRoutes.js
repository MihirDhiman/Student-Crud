import express from "express";
import { getStatus } from "../controllers/studentController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Student
 *     description: Student endpoints
 */

/**
 * @swagger
 * /api/student/status:
 *   get:
 *     tags: [Student]
 *     summary: Get authenticated student status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student status returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 */
router.get("/status", verifyToken, getStatus);

export default router;
