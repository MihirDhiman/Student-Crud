import express from "express";
import { getStatus } from "../controllers/studentController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/status", verifyToken, getStatus);

export default router;
