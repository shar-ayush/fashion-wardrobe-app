import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Print only the cloud name (safe) to help debug invalid cloud_name issues
console.log('Cloudinary configured cloud_name=', process.env.CLOUDINARY_CLOUD_NAME);

export default cloudinary;
