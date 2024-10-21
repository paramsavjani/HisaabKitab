import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { faker } from "@faker-js/faker";
import { User } from "./models/User.model.js";

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
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
      // deleteAllUsers();
    });
  })
  .catch((err) => {
    console.log(err);
  });
