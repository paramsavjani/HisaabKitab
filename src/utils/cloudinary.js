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
    fs.unlinkSync(file.path);
    console.log("File uploaded successfully", result);

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export { uploadOnCloudinary };

uploadOnCloudinary("C:/Users/param/OneDrive/Pictures/linux ss/Screenshot_2024-06-27_10_53_25.png");
