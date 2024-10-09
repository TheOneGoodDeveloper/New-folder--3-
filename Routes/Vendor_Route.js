import express from "express";
import * as Vendor from "../Controller/Vendor_Controller.js";
import * as Product from "../Controller/Product_Controller.js";

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

// VendorRoute.get("/productSaleByVendor",Vendor.authMiddleware,Vendor.productSaleByVendor)


export default VendorRoute;