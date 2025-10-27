// import fs from "fs";
// import { PDFExtract } from "pdf.js-extract";
// import { getAllPDFPaths } from "../helper/file.helper.js";
// import { isPDFUsed } from "../validator/pdf.validate.js";
// import { db } from "../db.js";

// const pdfExtract = new PDFExtract();

// export const processAllPDFsLogic = async () => {
//   const pdfFiles = getAllPDFPaths();

//   if (pdfFiles.length === 0) {
//     return {
//       message: "No PDF files found in public folder.",
//       total: 0,
//       processed: 0,
//       skipped: 0,
//     };
//   }

//   let processed = 0;
//   let skipped = 0;

//   for (const file of pdfFiles) {
//     const alreadyUsed = await isPDFUsed(file.name);
//     if (alreadyUsed) {
//       skipped++;
//       continue;
//     }

//     try {
//       const data = await pdfExtract.extract(file.path);
//       const text = data.pages
//         .map((page) => page.content.map((item) => item.str).join(" "))
//         .join("\n");

//       await db.execute(
//         "INSERT INTO pdf_data (file_name, content) VALUES (?, ?)",
//         [file.name, text]
//       );

//       processed++;
//     } catch (parseError) {
//       console.error(
//         `Error processing PDF file ${file.name}:`,
//         parseError.message
//       );
//       skipped++;
//     }
//   }

//   return {
//     message: "PDF processing completed.",
//     total: pdfFiles.length,
//     processed,
//     skipped,
//   };
// };

import { PDFExtract } from "pdf.js-extract";
import { db } from "../db.js";

const pdfExtract = new PDFExtract();

export const extractPDFText = async (filePath) => {
  try {
    const data = await pdfExtract.extract(filePath);
    const text = data.pages
      .map((page) => page.content.map((item) => item.str).join(" "))
      .join("\n");

    return { success: true, text };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const savePDFToDatabase = async (fileName, content) => {
  try {
    await db.execute(
      "INSERT INTO pdf_data (file_name, content) VALUES (?, ?)",
      [fileName, content]
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
