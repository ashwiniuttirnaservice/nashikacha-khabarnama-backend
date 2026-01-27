const multer = require("multer");
const path = require("path");
const fs = require("fs");

const getFolderPath = (fieldname) => {
  switch (fieldname) {
    case "newsImage":
      return "uploads/News/";

    case "galleryPhoto":
      return "uploads/Gallery/";
    default:
      throw new Error(`Invalid file field: ${fieldname}`);
  }
};

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folder = getFolderPath(file.fieldname);
      ensureDirExists(folder);
      cb(null, folder);
    } catch (err) {
      cb(new Error("Invalid file field: " + file.fieldname));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + uniqueSuffix + ext);
  },
});
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image, document, zip, and Excel files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  fileSize: 1024 * 1024 * 10,
});

module.exports = upload;
