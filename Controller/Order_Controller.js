import { orderModel } from "../Model/Order_schema.js";
import { cartModel } from "../Model/Cart_schema.js";
import { addressModel } from "../Model/Address_schema.js"; // Assuming you have an Address schema
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;
    console.log(req.body);
    // Validate request data
    if (!cartId || !address_id) {
      return res
        .status(400)
        .json({ message: "Cart ID and Address ID are required" });
    }

    // Retrieve the cart
    const cart = await cartModel
      .findById(cartId)
      .populate("items.product", "name price");
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or does not exist" });
    }
    // Retrieve the shipping address
    const shippingAddress = await addressModel.findById(address_id);
    console.log(shippingAddress);
    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    // Map cart items to order products and calculate total amount
    const orderProducts = cart.items.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
    }));
    const totalAmount = orderProducts.reduce(
      (sum, item) => sum + item.total,
      0
    );
    console.log(orderProducts);
    console.log(totalAmount);

    // Razorpay order creation (if payment method is Razorpay)
    let razorpayOrderId = null;
    if (paymentMethod === "Razorpay") {
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: totalAmount * 100, // Convert to paisa
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });
      razorpayOrderId = razorpayOrder.id;
    }

    // Prepare order data
    const orderData = {
      userId: cart.user,
      products: orderProducts,
      shippingAddress: address_id,
      paymentMethod,
      razorpayOrderId,
      totalAmount,
    };

    // Save the order to the database
    const order = await orderModel.create(orderData);

    // Delete the cart after successful order creation
    await cartModel.findByIdAndDelete(cartId);

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Failed to create order", error });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);
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
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await orderModel
      .find({ userId })
      .populate("products.productId");
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    return res.status(200).json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve orders", error });
  }
};

// 6. Verify Razorpay Payment Signature (for Payment Verification)
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const expectedSignature = razorpayInstance.utility.verifyPaymentSignature({
      payment_id: razorpayPaymentId,
      order_id: razorpayOrderId,
      signature: razorpaySignature,
    });

    if (expectedSignature) {
      // Mark order as paid
      const order = await orderModel.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: "Completed" },
        { new: true }
      );

      return res.status(200).json({
        message: "Payment verified successfully",
        order,
      });
    } else {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Payment verification failed", error });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // Retrieve all orders from the database
    const orders = await orderModel.find()
      .populate("userId")
      .populate("products.productId"); // Assuming Order has references to 'userId' and 'products.productId'

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Respond with the list of orders
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};
