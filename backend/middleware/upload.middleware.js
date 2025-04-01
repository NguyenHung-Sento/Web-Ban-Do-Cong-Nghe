const multer = require("multer")
const path = require("path")
const cloudinary = require("../config/cloudinary.config")
const { CloudinaryStorage } = require("multer-storage-cloudinary")

// Cấu hình lưu trữ Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || "cellphones_clone",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
})

// Lọc file
const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận file hình ảnh
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Chỉ chấp nhận file hình ảnh!"), false)
  }
  cb(null, true)
}

// Tạo middleware upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
})

module.exports = upload

