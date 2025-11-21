import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { createApiKey, isValidApiKey, listApiKeys, deleteApiKey } from "./apiKeys";

const app = express();
app.use(cors());
app.use(express.json());

// Middleware: require API key for everything except /generate-key
app.use((req, res, next) => {
 if (req.path === "/generate-key") return next();

 const key = req.header("x-api-key");
 if (!isValidApiKey(key)) {
   return res.status(401).json({ error: "Invalid or missing API key" });
 }

 next();
});

// Protected route
app.get("/hello", (req, res) => {
 res.json({ message: "Hello from the hashed in-memory API!" });
});

// GET /api/v1/description - returns team description
app.get("/api/v1/description", (req, res) => {
 res.json({ description: "We are top tier team with coding experience of 1 million years in the bag 🚀" });
});

// GET /api/v1/team - returns team information
app.get("/api/v1/team", (req, res) => {
 res.json({
   team: {
     name: "MONA",
     members: ["Andriani", "Danit", "Jan", "Hana"]
   }
 });
});

// GET /api/v1/teamsize - returns team size
app.get("/api/v1/teamsize", (req, res) => {
 res.json({ size: 4 });
});

// GET /api/v1/images - returns team member images as base64
app.get("/api/v1/images", (req, res) => {
 try {
   const imagesDir = path.join(__dirname, "../images");
   const images: Array<{ name: string; data: string }> = [];
   
   const imageFiles = [
     { name: "Andriani", file: "andriani.png" },
     { name: "Danit", file: "danit.jpg" },
     { name: "Jan", file: "jan.jpg" },
     { name: "Hana", file: "hana.jpg" }
   ];
   
   imageFiles.forEach(({ name, file }) => {
     const filePath = path.join(imagesDir, file);
     if (fs.existsSync(filePath)) {
       const imageBuffer = fs.readFileSync(filePath);
       const base64Image = imageBuffer.toString("base64");
       images.push({ name, data: base64Image });
     }
   });
   
   res.json({ images });
 } catch (error) {
   res.status(500).json({ error: "Failed to load images" });
 }
});

// Public endpoint to generate a key
app.post("/generate-key", (req, res) => {
 const { name } = req.body;
 const { key, metadata } = createApiKey(name);
 res.json({ 
   apiKey: key,
   id: metadata.id,
   preview: metadata.preview,
   createdAt: metadata.createdAt,
   name: metadata.name
 });
});

// List all API keys (protected)
app.get("/api-keys", (req, res) => {
 const keys = listApiKeys();
 res.json({ keys });
});

// Delete an API key (protected)
app.delete("/api-keys/:id", (req, res) => {
 const { id } = req.params;
 const success = deleteApiKey(id);
 
 if (success) {
   res.json({ message: "API key deleted successfully" });
 } else {
   res.status(404).json({ error: "API key not found" });
 }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API running on port ${port}`));

