import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes";
import seoRoutes from "./src/routes/seoRoutes";

dotenv.config();
const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "https://project-mca-4th-sem.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/seo", seoRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
