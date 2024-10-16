import express from "express";
import multer from "multer";
import path from "path";
import * as Admin from "../Controller/Admin_Controller.js";
import * as User from "../Controller/User_Controller.js";
import * as Category from "../Controller/Category_Controller.js";
import * as Product from "../Controller/Product_Controller.js";
import * as Vendor from "../Controller/Vendor_Controller.js";

const AdminRoute = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Assets/Categories/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
};

// Initialize multer with storage and fileFilter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

AdminRoute.post("/login", Admin.adminLogin);
AdminRoute.get("/getAllUsers", Admin.authMiddleware, User.getAllUsers);
AdminRoute.post("/productCreate", Admin.authMiddleware, Product.createProduct);
AdminRoute.post("/updateProduct", Admin.authMiddleware, Product.updateProduct);
AdminRoute.post("/deleteproduct", Admin.authMiddleware, Product.deleteProduct);
AdminRoute.post("/productList", Admin.authMiddleware, Product.getAllProducts);
AdminRoute.post(
  "/categoryCreate",
  upload.single("images"),
  Admin.authMiddleware,
  Category.createCategory
);
AdminRoute.post(
  "/updateCategory",
  upload.single("images"),
  Admin.authMiddleware,
  Category.updateCategory
);
AdminRoute.post(
  "/deleteCategory",
  Admin.authMiddleware,
  Category.deleteCategory
);
AdminRoute.post("/getAllCategory", Category.getAllCategories);
AdminRoute.get("/getUserById", Admin.authMiddleware, User.getUserById);
AdminRoute.post("/getVendorById", Admin.authMiddleware, Vendor.getVendorProfile);
AdminRoute.get("/listVendors", Admin.authMiddleware, Vendor.getAllVendors);

AdminRoute.post("/deleteVendor", Admin.authMiddleware, Vendor.deleteVendor);
AdminRoute.get(
  "/productCountByVendor",
  Admin.authMiddleware,
  Vendor.countProductByVendor
);
AdminRoute.get("/bulkApprove", Admin.authMiddleware, Vendor.bulkApproveVendors);
AdminRoute.post("/approveVendor", Admin.authMiddleware, Vendor.approveVendor);


export default AdminRoute;
