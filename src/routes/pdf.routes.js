import express from "express";
import { processAllPDFs } from "../controllers/pdf.controller.js";

const router = express.Router();

// Route to process all PDFs
router.get("/process-all", processAllPDFs);

export default router;
