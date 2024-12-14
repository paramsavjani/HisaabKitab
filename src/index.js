import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
const PORT = 1000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    app.get("/", (req, res) => {
      res.send("Hello World");
    });
  })
  .catch((err) => {
    console.log(`Error: ${err}`);
  });
