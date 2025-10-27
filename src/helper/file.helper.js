import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicFolderPath = path.resolve(__dirname, "../../public");

export const getAllPDFPaths = () => {
  const files = fs.readdirSync(publicFolderPath);
  return files
    .filter((f) => f.endsWith(".pdf"))
    .map((f) => ({
      name: f,
      path: path.join(publicFolderPath, f),
    }));
};
