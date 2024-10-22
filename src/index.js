import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { User } from "./models/User.model.js";
const PORT = process.env.PORT || 5000;

const deleteAllUsers = async () => {
  try {
    console.time("Delete Users Time");
    const result = await User.deleteMany({});
    console.timeEnd("Delete Users Time");
    console.log(`${result.deletedCount} users deleted.`);
  } catch (error) {
    console.error("Error deleting users:", error);
  }
};

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });


  