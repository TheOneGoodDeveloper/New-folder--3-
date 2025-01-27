import express from "express";
import * as User from "../Controller/User_Controller.js";
import * as Product from "../Controller/Product_Controller.js";
import * as Cart from "../Controller/Cart_Controller.js";
import * as Category from "../Controller/Category_Controller.js";
import * as Address from "../Controller/Address_Controller.js";
import * as Order from "../Controller/Order_Controller.js";

const UserRoute = express.Router();

UserRoute.post("/login", User.userLogin);
UserRoute.post("/moblieLogin", User.mobileLogin);
UserRoute.post("/verifyOtp", User.verifyOTPAndLogin);
UserRoute.post("/register", User.registerUser);
// UserRoute.get("/getUserById",User.authMiddleware,User.getUserById);
UserRoute.put("/updateUser",User.authMiddleware,User.updateUser)
UserRoute.post("/addAddress",User.authMiddleware,Address.addAddress)
UserRoute.put("/updateAddress",User.authMiddleware,Address.updateAddress);
UserRoute.delete("/deleteAddress",User.authMiddleware,Address.deleteAddress);
UserRoute.get("/getAddressesByUser",User.authMiddleware,Address.getAddressesByUserId);
UserRoute.put("/setDefault",User.authMiddleware,Address.setDefaultAddress);
UserRoute.post("/getUserById",User.authMiddleware,User.getUserById);
UserRoute.post("/createCart",User.authMiddleware, Cart.createCart);
UserRoute.post("/updateCart",Cart.authMiddleware,Cart.updateCartItem)
UserRoute.post("/deleteCart",Cart.authMiddleware,Cart.deleteCartItem)
UserRoute.get("/listCartById",Cart.authMiddleware,Cart.listCartbyId)



UserRoute.post("/productList", Product.getAllProducts);
UserRoute.get("/getAllProducts", Product.getAllProducts);
UserRoute.post("/filterProducts", Product.filterProducts);
UserRoute.get("/getAllCategory", Category.getAllCategories);
UserRoute.get("/productByCategory", Product.productByCategory);
UserRoute.post("/productByPrice",Product.productByPrice)
UserRoute.get("/productByGender",Product.ProductByGender);
UserRoute.get("/getProductById", Product.getProductById);
UserRoute.post("/similarProductsByColor", Product.getColorsForSimilarProducts);
UserRoute.post("/getrecentProducts", Product.getRecentProducts);
UserRoute.post("/createOrder",User.authMiddleware,Order.createOrder);
UserRoute.get("/order/:id", User.authMiddleware, Order.getOrderById);
UserRoute.get("/orders", User.authMiddleware, Order.getAllOrders);
UserRoute.put("/order/:id/status", User.authMiddleware, Order.updateOrderStatus);
UserRoute.delete("/order/:id", User.authMiddleware, Order.deleteOrder);
export default UserRoute;
