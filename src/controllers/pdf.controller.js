// import { processAllPDFsLogic } from "../services/pdf.service.js";

// export const processAllPDFs = async (req, res) => {
//   try {
//     const result = await processAllPDFsLogic();
//     res.json(result);
//   } catch (error) {
//     console.error("Error in PDF controller:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

import { extractPDFText, savePDFToDatabase } from "../services/pdf.service.js";
import { getAllPDFPaths } from "../helper/file.helper.js";
import { isPDFUsed } from "../validator/pdf.validate.js";

export const processAllPDFs = async (req, res) => {
  try {
    const pdfFiles = getAllPDFPaths();

    if (pdfFiles.length === 0) {
      return res.json({
        message: "No PDF files found in public folder.",
        total: 0,
        processed: 0,
        skipped: 0,
      });
    }

    let processed = 0;
    let skipped = 0;

    for (const file of pdfFiles) {
      // Check if PDF is already processed
      const alreadyUsed = await isPDFUsed(file.name);
      if (alreadyUsed) {
        skipped++;
        continue;
      }

      // Extract text from PDF using service
      const extractResult = await extractPDFText(file.path);

      if (!extractResult.success) {
        console.error(
          `Error processing PDF file ${file.name}:`,
          extractResult.error
        );
        skipped++;
        continue;
      }

      // Save to database using service
      const saveResult = await savePDFToDatabase(file.name, extractResult.text);

      if (!saveResult.success) {
        console.error(
          `Error saving PDF ${file.name} to database:`,
          saveResult.error
        );
        skipped++;
        continue;
      }

      processed++;
    }

    res.json({
      message: "PDF processing completed.",
      total: pdfFiles.length,
      processed,
      skipped,
    });
  } catch (error) {
    console.error("Error in PDF controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
