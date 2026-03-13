import express from "express";
import session from "express-session";
import passport from "./config/passport";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes";



dotenv.config();

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRoutes);