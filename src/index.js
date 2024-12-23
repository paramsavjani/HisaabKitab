import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import connectDB from "./db/index.js";
import { httpServer } from "./app.js";
const PORT = process.env.PORT || 1000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
