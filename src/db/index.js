import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/khatabook`);
    console.log("Connected to DB");
  } catch (error) {
    console.log("Error connecting to DB", error);
    process.exit(1);
  }
};

export default connectDB;