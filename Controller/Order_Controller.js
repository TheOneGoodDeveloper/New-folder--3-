import { orderModel } from "../Model/Order_schema.js";
import { cartModel } from "../Model/Cart_schema.js";
import { addressModel } from "../Model/Address_schema.js";
import { vendorModel } from "../Model/Vendor_schema.js";
import { userModel } from "../Model/user_schema.js";
import { productModel } from "../Model/Product_schema.js";
import { invoiceModel } from "../Model/Invoice_schema.js"; // Assuming you have an Address schema
import Razorpay from "razorpay";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// export const createOrder = async (req, res) => {
//   try {
//     const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;
//     console.log(req.body);
//     // Validate request data
//     if (!cartId || !address_id) {
//       return res
//         .status(400)
//         .json({ message: "Cart ID and Address ID are required" });
//     }

//     // Retrieve the cart
//     const cart = await cartModel
//       .findById(cartId)
//       .populate("items.product", "name price");
//     if (!cart || cart.items.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Cart is empty or does not exist" });
//     }
//     // Retrieve the shipping address
//     const shippingAddress = await addressModel.findById(address_id);
//     console.log(shippingAddress);
//     if (!shippingAddress) {
//       return res.status(404).json({ message: "Shipping address not found" });
//     }

//     // Map cart items to order products and calculate total amount
//     const orderProducts = cart.items.map((item) => ({
//       productId: item.product._id,
//       name: item.product.name,
//       quantity: item.quantity,
//       price: item.price,
//       total: item.quantity * item.price,
//     }));
//     const totalAmount = orderProducts.reduce(
//       (sum, item) => sum + item.total,
//       0
//     );
//     console.log(orderProducts);
//     console.log(totalAmount);

//     // Razorpay order creation (if payment method is Razorpay)
//     let razorpayOrderId = null;
//     if (paymentMethod === "Razorpay") {
//       const razorpayOrder = await razorpayInstance.orders.create({
//         amount: totalAmount * 100, // Convert to paisa
//         currency: "INR",
//         receipt: `order_${Date.now()}`,
//       });
//       razorpayOrderId = razorpayOrder.id;
//     }

//     // Prepare order data
//     const orderData = {
//       userId: cart.user,
//       products: orderProducts,
//       shippingAddress: address_id,
//       paymentMethod,
//       razorpayOrderId,
//       totalAmount,
//     };

//     // Save the order to the database
//     const order = await orderModel.create(orderData);

//     // Delete the cart after successful order creation
//     await cartModel.findByIdAndDelete(cartId);

//     return res.status(201).json({
//       message: "Order created successfully",
//       order,
//     });
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({ message: "Failed to create order", error });
//   }
// };

// export const createOrder = async (req, res) => {
//   try {
//     const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;
//     console.log(req.body);

//     if (!cartId || !address_id) {
//       return res
//         .status(400)
//         .json({ message: "Cart ID and Address ID are required" });
//     }

//     // Retrieve the cart
//     const cart = await cartModel
//       .findById(cartId)
//       .populate("items.product", "name price vendor total_stock");
//     if (!cart || cart.items.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Cart is empty or does not exist" });
//     }

//     // Retrieve the shipping address
//     const shippingAddress = await addressModel.findById(address_id);
//     if (!shippingAddress) {
//       return res.status(404).json({ message: "Shipping address not found" });
//     }

//     // Map cart items to order products and calculate total amount
//     const orderProducts = cart.items.map((item) => ({
//       productId: item.product._id,
//       name: item.product.name,
//       vendor_id: item.product.vendor_id, // Fetch vendor ID from the product
//       quantity: item.quantity,
//       price: item.price,
//       total: item.quantity * item.price,
//     }));

//     const totalAmount = orderProducts.reduce(
//       (sum, item) => sum + item.total,
//       0
//     );

//     // Group products by vendor
//     const vendorOrders = {};
//     orderProducts.forEach((product) => {
//       if (!vendorOrders[product.vendor_id]) {
//         vendorOrders[product.vendor_id] = [];
//       }
//       vendorOrders[product.vendor_id].push(product);
//     });

//     // Razorpay order creation
//     let razorpayOrderId = null;
//     if (paymentMethod === "Razorpay") {
//       const razorpayOrder = await razorpayInstance.orders.create({
//         amount: totalAmount * 100, // Convert to paisa
//         currency: "INR",
//         receipt: `order_${Date.now()}`,
//       });
//       razorpayOrderId = razorpayOrder.id;
//     }
// console.log(vendorOrders);
//     // Save separate orders for each vendor
//     const createdOrders = [];
//     for (const [vendor, products] of Object.entries(vendorOrders)) {
//       const orderData = {
//         userId: cart.user,
//         vendor, // Associate vendor with the order
//         products,
//         shippingAddress: address_id,
//         paymentMethod,
//         razorpayOrderId,
//         totalAmount: products.reduce((sum, item) => sum + item.total, 0),
//       };

//       const order = await orderModel.create(orderData);
//       createdOrders.push(order);

//       // **Update product stock** after order creation
//       for (const product of products) {
//         await productModel.findByIdAndUpdate(
//           product.productId,
//           { $inc: { total_stock: -product.quantity } },
//           { new: true }
//         );
//       }
//     }

//     // Delete the cart after successful order placement
//     await cartModel.findByIdAndDelete(cartId);

//     return res.status(201).json({
//       message: "Orders created successfully",
//       orders: createdOrders,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Failed to create order", error });
//   }
// };
//3 march
// export const createOrder = async (req, res) => {
//   try {
//     const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;

//     if (!cartId || !address_id) {
//       return res
//         .status(400)
//         .json({ message: "Cart ID and Address ID are required" });
//     }

//     // Retrieve the cart
//     const cart = await cartModel
//       .findById(cartId)
//       .populate("items.product", "name price vendor_id total_stock");

//     if (!cart || cart.items.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Cart is empty or does not exist" });
//     }

//     // Retrieve the shipping address
//     const shippingAddress = await addressModel.findById(address_id);
//     if (!shippingAddress) {
//       return res.status(404).json({ message: "Shipping address not found" });
//     }

//     // Map cart items to order products and calculate total amount
//     const orderProducts = cart.items.map((item) => ({
//       productId: item.product._id,
//       name: item.product.name,
//       vendor_id: item.product.vendor_id, // Fetch vendor ID correctly
//       quantity: item.quantity,
//       price: item.price,
//       total: item.quantity * item.price,
//     }));

//     // Calculate total order amount
//     const totalAmount = orderProducts.reduce(
//       (sum, item) => sum + item.total,
//       0
//     );

//     // Group products by vendor
//     const vendorOrders = {};
//     orderProducts.forEach((product) => {
//       if (!vendorOrders[product.vendor_id]) {
//         vendorOrders[product.vendor_id] = [];
//       }
//       vendorOrders[product.vendor_id].push(product);
//     });

//     // Initialize Razorpay order ID
//     let razorpayOrderId = null;
//     if (
//       paymentMethod === "Razorpay" &&
//       typeof razorpayInstance !== "undefined"
//     ) {
//       const razorpayOrder = await razorpayInstance.orders.create({
//         amount: totalAmount * 100, // Razorpay expects amount in paise
//         currency: "INR",
//         receipt: `order_${Date.now()}`,
//         payment_capture: 1,
//       });
//       razorpayOrderId = razorpayOrder.id;
//     }

//     // Create separate orders for each vendor
//     const orders = await Promise.all(
//       Object.keys(vendorOrders).map(async (vendorId) => {
//         return orderModel.create({
//           userId: cart.user,
//           vendor_id: vendorId,
//           products: vendorOrders[vendorId],
//           shippingAddress: address_id,
//           paymentMethod,
//           paymentStatus: paymentMethod === "Razorpay" ? "Pending" : "Completed",
//           razorpayOrderId,
//           totalAmount: vendorOrders[vendorId].reduce(
//             (sum, item) => sum + item.total,
//             0
//           ),
//           orderStatus: "Pending",
//         });
//       })
//     );

//     // Clear cart after order placement
//     await cartModel.findByIdAndDelete(cartId);

//     return res.status(201).json({
//       message: "Order placed successfully",
//       orders,
//       razorpayOrderId,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     return res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };
// export const createOrder = async (req, res) => {
//   try {
//     const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;

//     if (!cartId || !address_id) {
//       return res.status(400).json({ message: "Cart ID and Address ID are required" });
//     }

//     // Retrieve the cart
//     const cart = await cartModel.findById(cartId).populate("items.product", "name price vendor_id total_stock");
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty or does not exist" });
//     }

//     // Retrieve the shipping address
//     const shippingAddress = await addressModel.findById(address_id);
//     if (!shippingAddress) {
//       return res.status(404).json({ message: "Shipping address not found" });
//     }

//     // Map cart items to order products
//     const orderProducts = cart.items.map((item) => ({
//       productId: item.product._id,
//       name: item.product.name,
//       vendor_id: item.product.vendor_id, // Ensure vendor ID is fetched correctly
//       quantity: item.quantity,
//       price: item.price,
//       total: item.quantity * item.price,
//       orderStatus: "Pending", // Initialize product-level status
//     }));

//     // Calculate total order amount
//     const totalAmount = orderProducts.reduce((sum, item) => sum + item.total, 0);

//     // Group products by vendor
//     const vendorOrders = {};
//     orderProducts.forEach((product) => {
//       if (!vendorOrders[product.vendor_id]) {
//         vendorOrders[product.vendor_id] = [];
//       }
//       vendorOrders[product.vendor_id].push(product);
//     });

//     // Initialize Razorpay order ID
//     let razorpayOrderId = null;
//     if (paymentMethod === "Razorpay" && typeof razorpayInstance !== "undefined") {
//       const razorpayOrder = await razorpayInstance.orders.create({
//         amount: totalAmount * 100, // Razorpay expects amount in paise
//         currency: "INR",
//         receipt: `order_${Date.now()}`,
//         payment_capture: 1,
//       });
//       razorpayOrderId = razorpayOrder.id;
//     }

//     // Parent Order ID (optional, used for tracking all vendor-wise orders)
//     const parentOrderId = new mongoose.Types.ObjectId();

//     // Create separate orders for each vendor
//     const orders = await Promise.all(
//       Object.keys(vendorOrders).map(async (vendorId) => {
//         return orderModel.create({
//           userId: cart.user,
//           vendor_id: vendorId,
//           parentOrderId, // Link vendor orders to parent order ID
//           products: vendorOrders[vendorId],
//           shippingAddress: address_id,
//           paymentMethod,
//           paymentStatus: paymentMethod === "Razorpay" ? "Pending" : "Completed",
//           razorpayOrderId,
//           totalAmount: vendorOrders[vendorId].reduce((sum, item) => sum + item.total, 0),
//         });
//       })
//     );

//     // Clear cart after order placement
//     await cartModel.findByIdAndDelete(cartId);

//     return res.status(201).json({
//       message: "Order placed successfully",
//       orders,
//       razorpayOrderId,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// export const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: "Payment verification failed" });
//     }

//     // Update the order status in the database
//     await orderModel.findOneAndUpdate(
//       { razorpayOrderId: razorpay_order_id },
//       { paymentStatus: "Completed", razorpayPaymentId: razorpay_payment_id },
//       { new: true }
//     );

//     res.status(200).json({ success: true, message: "Payment verified successfully" });
//   } catch (error) {
//     console.error("Error verifying payment:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const createOrder = async (req, res) => {
  try {
    const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;

    if (!cartId || !address_id) {
      return res
        .status(400)
        .json({ message: "Cart ID and Address ID are required" });
    }

    // 🔹 Fetch cart & address in parallel
    const [cart, shippingAddress] = await Promise.all([
      cartModel
        .findById(cartId)
        .populate("items.product", "name price vendor_id total_stock"),
      addressModel.findById(address_id),
    ]);

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or does not exist" });
    }
    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    // 🔹 Map cart items to order products
    const orderProducts = cart.items.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      vendor_id: item.product.vendor_id,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
      orderStatus: "Pending",
    }));

    // 🔹 Calculate total amount
    const totalAmount = orderProducts.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // 🔹 Group products by vendor
    const vendorOrders = orderProducts.reduce((acc, product) => {
      acc[product.vendor_id] = acc[product.vendor_id] || [];
      acc[product.vendor_id].push(product);
      return acc;
    }, {});

    // 🔹 Razorpay Order Creation (if needed)
    let razorpayOrderId = null;
    if (
      paymentMethod === "Razorpay" &&
      typeof razorpayInstance !== "undefined"
    ) {
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `order_${Date.now()}`,
        payment_capture: 1,
      });
      razorpayOrderId = razorpayOrder.id;
    }

    // 🔹 Parent Order ID
    const parentOrderId = new mongoose.Types.ObjectId();

    // 🔹 Create vendor-wise orders in parallel
    const orders = await Promise.all(
      Object.keys(vendorOrders).map((vendorId) =>
        orderModel.create({
          userId: cart.user,
          vendor_id: vendorId,
          parentOrderId,
          products: vendorOrders[vendorId],
          shippingAddress: address_id,
          paymentMethod,
          paymentStatus: paymentMethod === "Razorpay" ? "Pending" : "Completed",
          razorpayOrderId,
          totalAmount: vendorOrders[vendorId].reduce(
            (sum, item) => sum + item.total,
            0
          ),
        })
      )
    );

    // 🔹 Delete Cart Immediately After Order Placement
    await cartModel.findByIdAndDelete(cartId);

    return res.status(201).json({
      message: "Order placed successfully",
      orders,
      razorpayOrderId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log("Received Payment Verification Request:", req.body);

    // Verify Razorpay Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Generated Signature:", generatedSignature);
    console.log("Received Signature:", razorpay_signature);

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Find the order
    const order = await orderModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order found for update:", order);

    // Update all orders linked to the parent order ID
    await orderModel.updateMany(
      { parentOrderId: order.parentOrderId },
      { paymentStatus: "Completed", razorpayPaymentId: razorpay_payment_id },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // const order = await orderModel.findById(orderId).populate("products.productId")..populate({
    //   path: "products.productId",
    //   populate: {
    //     path: "reviews",
    //     model: "Review",
    //   };
    const order = await orderModel
      .findById(orderId)
      .populate({
        path: "products.productId",
        model: "Product",
      })
      .populate({
        path: "products.productId",
        populate: {
          path: "reviews",
          model: "Review",
        },
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve order", error });
  }
};

// 3. Update an Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update status fields
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    // Save the updated order
    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Order updated successfully",
      updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order", error });
  }
};

// 4. Delete an Order
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete order", error });
  }
};

// 5. Get all Orders for a User
// export const getOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     console.log(userId);
//     const orders = await orderModel
//       .find({ userId })
//       .populate("products.productId");

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }
//     console.log(orders);
//     return res.status(200).json(orders);
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Failed to retrieve orders", error });
//   }
// };
// export const getOrdersByUser = async (req, res) => {
//   try {
//     const userId = req.body.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const orders = await orderModel.find({ userId }).populate("products.productId");
//     console.log(orders);
//     if (!orders.length) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     // Fetch reviews separately for each product
//     const ordersWithReviews = await Promise.all(
//       orders.map(async (order) => {
//         const productsWithReviews = await Promise.all(
//           order.products.map(async (product) => {
//             console.log(product.productId._id)
//             const reviews = await reviewModel.find({ product_id: product.productId._id });
//             return { ...product.toObject(), reviews };
//           })
//         );
//         return { ...order.toObject(), products: productsWithReviews };
//       })
//     );

//     return res.status(200).json(ordersWithReviews);
//   } catch (error) {
//     return res.status(500).json({ message: "Failed to retrieve orders", error });
//   }
// };

// export const getOrdersByUser = async (req, res) => {
//   try {
//     const userId = req.body.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const orders = await orderModel
//       .find({ userId })
//       .populate({
//         path: "products.productId",
//         populate: {
//           path: "reviews",
//           model: "Review",
//         },
//       });

//     if (!orders.length) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     // Ensure products without reviews return an empty array
//     const ordersWithReviews = orders.map((order) => {
//       const updatedProducts = order.products.map((product) => {
//         return {
//           ...product.toObject(),
//           productId: {
//             ...product.productId.toObject(),
//             reviews: product.productId.reviews || [], // Ensure reviews are an empty array if undefined
//           },
//         };
//       });

//       return {
//         ...order.toObject(),
//         products: updatedProducts,
//       };
//     });

//     return res.status(200).json(ordersWithReviews);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     return res.status(500).json({ message: "Failed to retrieve orders", error });
//   }
// };
// export const getOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const orders = await orderModel.aggregate([
//       {
//         $match: { userId: new mongoose.Types.ObjectId(userId) }, // Match orders by user ID
//       },
//       {
//         $unwind: "$products", // Flatten products array for aggregation
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "products.productId",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$productDetails",
//           preserveNullAndEmptyArrays: true, // Keep orders even if product details are missing
//         },
//       },
//       {
//         $lookup: {
//           from: "reviews",
//           localField: "products.productId",
//           foreignField: "product_id",
//           as: "reviews",
//         },
//       },
//       {
//         $addFields: {
//           averageRating: { $avg: "$reviews.rating" }, // Calculate the average rating
//           totalReviews: { $size: "$reviews" }, // Count total reviews
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           userId: { $first: "$userId" },
//           status: { $first: "$status" },
//           totalPrice: { $first: "$totalPrice" },
//           createdAt: { $first: "$createdAt" },
//           updatedAt: { $first: "$updatedAt" },
//           products: {
//             $push: {
//               productId: "$products.productId",
//               quantity: "$products.quantity",
//               productDetails: "$productDetails",
//               averageRating: "$averageRating",
//               totalReviews: "$totalReviews",
//             },
//           },
//         },
//       },
//     ]);

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     return res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error retrieving orders:", error);
//     return res.status(500).json({ message: "Failed to retrieve orders", error });
//   }
// };

// export const getOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const orders = await orderModel.aggregate([
//       {
//         $match: { userId: new mongoose.Types.ObjectId(userId) }, // Match orders by user ID
//       },
//       {
//         $unwind: "$products", // Flatten products array for aggregation
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "products.productId",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$productDetails",
//           preserveNullAndEmptyArrays: true, // Keep products even if details are missing
//         },
//       },
//       {
//         $lookup: {
//           from: "reviews",
//           let: { productId: "$products.productId", userId: "$userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$product_id", "$$productId"] }, // Match product
//                     { $eq: ["$user_id", "$$userId"] } // Match the same user
//                   ]
//                 }
//               }
//             },
//             { $project: { rating: 1, comment: 1, _id: 0 } } // Only keep rating and comment
//           ],
//           as: "userReview",
//         },
//       },
//       {
//         $addFields: {
//           userRating: { $arrayElemAt: ["$userReview.rating", 0] }, // Get the user's rating
//           userComment: { $arrayElemAt: ["$userReview.comment", 0] }, // Get the user's comment
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           userId: { $first: "$userId" },
//           status: { $first: "$status" },
//           totalPrice: { $first: "$totalPrice" },
//           createdAt: { $first: "$createdAt" },
//           updatedAt: { $first: "$updatedAt" },
//           products: {
//             $push: {
//               productId: "$products.productId",
//               quantity: "$products.quantity",
//               productDetails: "$productDetails",
//               userRating: "$userRating",
//               userComment: "$userComment",
//             },
//           },
//         },
//       },
//     ]);

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     return res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error retrieving orders:", error);
//     return res.status(500).json({ message: "Failed to retrieve orders", error });
//   }
// };
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const orders = await orderModel.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "reviews",
          let: { productId: "$products.productId", userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$product_id", "$$productId"] },
                    { $eq: ["$user_id", "$$userId"] },
                  ],
                },
              },
            },
            { $project: { rating: 1, comment: 1, _id: 0 } },
          ],
          as: "userReview",
        },
      },
      {
        $addFields: {
          userRating: { $arrayElemAt: ["$userReview.rating", 0] },
          userComment: { $arrayElemAt: ["$userReview.comment", 0] },
        },
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          razorpayOrderId: { $first: "$razorpayOrderId" },
          status: { $first: "$orderStatus" },
          totalPrice: { $first: "$totalAmount" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          products: {
            $push: {
              productId: "$products.productId",
              name: "$products.name",
              quantity: "$products.quantity",
              price: "$products.price",
              total: "$products.total",
              productDetails: "$productDetails",
              userRating: "$userRating",
              userComment: "$userComment",
            },
          },
        },
      },
    ]);

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No delivered orders found for this user" });
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error retrieving orders:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve orders", error });
  }
};

// 6. Verify Razorpay Payment Signature (for Payment Verification)

export const getAllOrders = async (req, res) => {
  try {
    // Fetch all orders sorted by latest
    const orders = await orderModel
      .find()
      .populate("userId", "name email") // Populate user details
      .populate("products.productId", "name price") // Populate product details
      .populate("vendor_id", "name") // Populate vendor details
      .populate("shippingAddress") // Populate shipping address
      .sort({ createdAt: -1 }); // Latest orders first

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Send orders to admin
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming customer is authenticated

    // Fetch all vendor orders for this user
    const orders = await orderModel
      .find({ userId })
      .populate("products.productId");

    // Group by parentOrderId
    const groupedOrders = {};
    orders.forEach((order) => {
      const key = order.parentOrderId || order._id.toString(); // Use parentOrderId if available
      if (!groupedOrders[key]) {
        groupedOrders[key] = [];
      }
      groupedOrders[key].push(order);
    });

    res.status(200).json({ orders: groupedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getVendorOrders = async (req, res) => {
//   try {
//     const vendorId = req.user.id;

//     const orders = await orderModel.find({ vendor_id: vendorId }).populate("products.productId");

//     res.status(200).json({ orders });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.query.id;

    // Check if the vendor exists
    const vendor = await vendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Fetch orders for the vendor
    const orders = await orderModel
      .find({ vendor_id: vendorId })
      .populate("products.productId", "name price images");

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this vendor." });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const createOfflineOrder = async (req, res) => {
//   try {
//     const { userId, vendor_id, products, shippingAddress, totalAmount } = req.body;

//     if (!userId || !vendor_id || !products || products.length === 0 || !shippingAddress || !totalAmount) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     let updatedProducts = [];
//     let calculatedTotal = 0;

//     for (const item of products) {
//       const { productId, size, quantity, price } = item; // ✅ Extract quantity here!

//       if (!productId || !size || !quantity || !price) {
//         return res.status(400).json({ message: "Product details are incomplete" });
//       }

//       const product = await productModel.findById(productId);

//       if (!product) {
//         return res.status(404).json({ message: `Product not found: ${productId}` });
//       }

//       // Find the correct variant based on size
//       const variant = product.variants.find(v => v.size === size);

//       if (!variant) {
//         return res.status(400).json({ message: `Size ${size} not available for product: ${product.name}` });
//       }

//       if (variant.stock < quantity) {
//         return res.status(400).json({ message: `Insufficient stock for ${product.name}, size ${size}` });
//       }

//       // Deduct stock
//       variant.stock -= quantity;
//       if (variant.stock === 0) {
//         variant.is_out_of_stock = true;
//       }

//       await product.save(); // ✅ Save the updated stock

//       // Calculate total price for this product
//       const totalPrice = quantity * price;
//       calculatedTotal += totalPrice;

//       updatedProducts.push({
//         productId,
//         name: product.name,
//         quantity, // ✅ Now quantity is properly included
//         price,
//         total: totalPrice,
//         orderStatus: "Pending",
//         purchaseType: "offline"
//       });
//     }

//     // Final amount validation
//     if (calculatedTotal !== totalAmount) {
//       return res.status(400).json({ message: "Total amount mismatch!" });
//     }

//     const order = new orderModel({
//       userId,
//       vendor_id,
//       products: updatedProducts,
//       shippingAddress,
//       totalAmount: calculatedTotal,
//       paymentMethod: "Cash on Delivery",
//       paymentStatus: "Completed"
//     });

//     await order.save();

//     return res.status(201).json({ message: "Order placed successfully", order });

//   } catch (error) {
//     console.error("Error creating offline order:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };
const createOfflineUser = async (name, mail, phone_number) => {
  const existingUser = await userModel.findOne({
    phone_number,
    customer_type: "offline",
  });
  if (existingUser) {
    return existingUser._id;
  }
  if (!existingUser) {
    let user = new userModel({
      name,
      phone_number,
      email: mail || name + "@offline.com",
      customer_type: "offline",
    });
    await user.save();
    return user._id; // Return the user ID to be used in the order
  }
};

export const createOfflineOrder = async (req, res) => {
  try {
    const { name, phone_number, products, shippingAddress, paymentMethod } =
      req.body;
    let userId = "";
    if (!userId) {
      userId = await createOfflineUser(name, phone_number);
    }
    const savedAddress = await new addressModel({
      userId,
      ...shippingAddress,
    }).save();
    console.log(savedAddress);
    let vendorOrders = {}; // Group orders by vendor
    let invoiceData = {
      invoice_number: `INV-${Date.now()}`,
      user: userId,
      store: "offline",
      vendors: [],
      total_price: 0,
      gst_total: 0,
      final_price: 0,
      payment_status: "paid",
    };

    for (const item of products) {
      const product = await productModel.findOne({
        _id: item.product_id,
      });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.product_id} not found` });
      }

      // Find the matching variant
      const variant = product.variants.find((v) => v.size === item.size);
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock unavailable for ${product.name}, Size: ${item.size}`,
        });
      }

      const total = product.final_price * item.quantity;
      const gstAmount = (product.gst_percentage / 100) * total;

      // Group by vendor
      if (!vendorOrders[product.vendor_id]) {
        vendorOrders[product.vendor_id] = {
          vendor_id: product.vendor_id,
          products: [],
          totalAmount: 0,
        };
      }

      vendorOrders[product.vendor_id].products.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.final_price,
        total: total,
        orderStatus: "Pending",
        purchaseType: "offline",
      });

      vendorOrders[product.vendor_id].totalAmount += total;

      // Prepare invoice data
      let vendorInvoice = invoiceData.vendors.find(
        (v) => v.vendor_id === product.vendor_id
      );
      if (!vendorInvoice) {
        vendorInvoice = {
          vendor_id: product.vendor_id,
          vendor_name: "Vendor Name", // Fetch dynamically if needed
          products: [],
          vendor_total: 0,
          vendor_gst: 0,
          store: "offline",
        };
        invoiceData.vendors.push(vendorInvoice);
      }

      vendorInvoice.products.push({
        product_id: product._id,
        quantity: item.quantity,
        price: product.final_price,
        total_price: total,
        gst_percentage: product.gst_percentage,
        gst_amount: gstAmount,
      });

      vendorInvoice.vendor_total += total;
      vendorInvoice.vendor_gst += gstAmount;
      invoiceData.total_price += total;
      invoiceData.gst_total += gstAmount;
    }

    invoiceData.final_price = invoiceData.total_price + invoiceData.gst_total;

    // Save Orders
    const createdOrderIds = [];
    for (const vendorId in vendorOrders) {
      const newOrder = await orderModel.create({
        userId,
        vendor_id: vendorId,
        products: vendorOrders[vendorId].products,
        shippingAddress:savedAddress._id,
        paymentMethod,
        totalAmount: vendorOrders[vendorId].totalAmount,
        paymentStatus: paymentMethod === "Cash" ? "Pending" : "Completed",
        invoice_generated: false,
      });
      createdOrderIds.push(newOrder._id);
    }
    const ordersToInvoice = await orderModel.find({
      _id: { $in: createdOrderIds },
      invoice_generated: false,
    });
    // Save Invoice
    // await invoiceModel.create(invoiceData);
    if (ordersToInvoice.length > 0) {
      // Save Invoice
      await invoiceModel.create(invoiceData);

      // Update orders to mark invoice as generated
      await orderModel.updateMany(
        { _id: { $in:createdOrderIds } },
        { $set: { invoice_generated: true, paymentStatus: "Completed" } }
      );
    }
    return res
      .status(201)
      .json({ message: "Order placed successfully", invoiceData });
  } catch (error) {
    console.error("Order placement error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
