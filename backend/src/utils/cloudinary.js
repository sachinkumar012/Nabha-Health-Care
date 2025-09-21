const cloudinary = require("cloudinary").v2;

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer to cloudinary
const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: "auto",
      folder: "nabha-healthcare",
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// Upload file to cloudinary
const uploadFileToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "nabha-healthcare",
      ...options,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

// Delete file from cloudinary
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

// Generate transformation URL
const getTransformedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

// Get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultTransformations = {
    fetch_format: "auto",
    quality: "auto",
    ...options,
  };

  return cloudinary.url(publicId, defaultTransformations);
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadFileToCloudinary,
  deleteFromCloudinary,
  getTransformedUrl,
  getOptimizedImageUrl,
};
