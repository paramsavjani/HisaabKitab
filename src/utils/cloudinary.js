import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dso4amwem",
  api_key: "646469518523334",
  api_secret: "QMM2p5l_iORC0xGb82bskUpd6dQ",
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    throw new Error("Please provide a valid file path");
  }
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    console.log("File uploaded successfully");

    return result.url;
  } catch (error) {
    throw new Error(error, "Error uploading file");
  }
};

export { uploadOnCloudinary };
