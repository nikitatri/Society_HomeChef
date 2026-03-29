import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
 params: async (req, file) => {
  const isVideo = file.mimetype.startsWith("video");

  return {
    folder: "homechef",
    resource_type: isVideo ? "video" : "image",
  };
}
});

export { cloudinary, storage };