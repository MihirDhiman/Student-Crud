import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { swaggerUi, specs } from "./swagger.js";
import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import collegeRoutes from "./src/routes/collegeRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import pdfRoutes from "./src/routes/pdf.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/college", collegeRoutes);
app.use("/notifications", notificationRoutes);
app.use("/api/pdf", pdfRoutes);

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//for default server host
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// export default app; // for web socket
