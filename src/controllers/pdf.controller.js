import { processAllPDFsLogic } from "../services/pdf.service.js";

export const processAllPDFs = async (req, res) => {
  try {
    const result = await processAllPDFsLogic();
    res.json(result);
  } catch (error) {
    console.error("Error in PDF controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
