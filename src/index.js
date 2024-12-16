import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
const PORT = process.env.PORT || 1000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("hiiii")
    console.log(err);
  });
