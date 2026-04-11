import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";
import searchRoutes from "./routes/searchRoutes";
import authRoutes from "./routes/authRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import campaignRoutes from "./routes/campaignRoutes";
import eventRoutes from "./routes/eventRoutes";
import seoRoutes from "./routes/seoRoutes";
import chatRoutes from "./routes/chatRoutes"; 

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/search", searchRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/events", eventRoutes);
app.use("/seo", seoRoutes);
app.use("/chat", chatRoutes); // ✅

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));