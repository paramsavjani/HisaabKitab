import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to DB");
  } catch (error) {
    console.log("Error connecting to DB", error);
    process.exit(1);
  }
};


export default connectDB;