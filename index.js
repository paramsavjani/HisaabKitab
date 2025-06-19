import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDB from "./db/index.js";
import { httpServer } from "./app.js";
const PORT = process.env.PORT || 1000;
import { fileURLToPath } from "url";
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
const frontendPath = path.join(__dirname, "build");
httpServer.use(express.static(frontendPath));

httpServer.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

connectDB()
  .then(() => {
    httpServer.listen(PORT,"0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
