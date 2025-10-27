import { db } from "../db.js";

export const isPDFUsed = async (fileName) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM pdf_data WHERE file_name = ?",
      [fileName]
    );

    return rows.length > 0;
  } catch (error) {
    console.error("Error checking if PDF is used:", error);
    return false;
  }
};
