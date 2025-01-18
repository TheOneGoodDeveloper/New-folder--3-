import express from "express";
import * as Vendor from "../Controller/Vendor_Controller.js";
import * as Product from "../Controller/Product_Controller.js";
import * as Category from "../Controller/Category_Controller.js"


const VendorRoute = express.Router();

VendorRoute.post("/registerVendor", Vendor.registerVendor);

VendorRoute.post("/loginVendor", Vendor.vendorLogin);

VendorRoute.post(
  "/productCreate",
  Vendor.authMiddleware,
  Product.createProduct
);
VendorRoute.post(
  "/updateProduct",
  Vendor.authMiddleware,
  Product.updateProduct
);
VendorRoute.post(
  "/deleteproduct",
  Vendor.authMiddleware,
  Product.deleteProduct
);
VendorRoute.get("/productList", Vendor.authMiddleware,Vendor.getAllProducts);
VendorRoute.post("/getAllCategory", Category.getAllCategories);
VendorRoute.get("/getProductById",Vendor.authMiddleware,Product.getProductById)
VendorRoute.get("/vendor_dashboard",Vendor.authMiddleware,Vendor.vendor_dashboard)
// VendorRoute.get("/productSaleByVendor",Vendor.authMiddleware,Vendor.productSaleByVendor)


export default VendorRoute;