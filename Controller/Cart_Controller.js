import jwt from "jsonwebtoken";
import { cartModel } from "../Model/Cart_schema.js";
import { productModel } from "../Model/Product_schema.js";

export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(200)
      .json({ status: false, message: "Token not provided" });
  } // No token, allow next middleware to handle

  jwt.verify(
    token,
    process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
    (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ status: false, statusCode: 700, message: "Token expired" });
        } else {
          return res
            .status(401)
            .json({ status: false, message: "Invalid token" });
        }
      }

      req.user = decoded; // Set the user info from the token
      next();
    }
  );
};

export const createCart = async (req, res) => {
  const { productId, quantity, size, color } = req.body;

  try {
    // Ensure user is logged in
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ message: "User must be logged in to add items to the cart" });
    }

    // Check if product exists and validate attributes
    const product = await productModel
      .findById(productId)
      .select("MRP variants total_stock is_deleted");
    if (!product || product.is_deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate size and color
    const variant = product.variants.find((v) => v.size === size);
    console.log(variant);
    if (!variant) {
      return res
        .status(400)
        .json({ message: "Invalid size or color selected" });
    }

    // Ensure price exists for the variant
    // if (!variant.price) {
    //   return res
    //     .status(400)
    //     .json({ message: "Price not available for selected variant" });
    // }

    // Check if requested quantity is available
    if (variant.stock < quantity) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available stock" });
    }

    // Find or create the user's cart
    let cart = await cartModel.findOne({ user: req.user.id });
    if (!cart) {
      cart = new cartModel({ user: req.user.id, items: [] });
    }

    // Ensure cart.items is initialized as an array
    if (!Array.isArray(cart.items)) {
      cart.items = [];
    }

    // Check if the product is already in the cart
    const existingProductIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingProductIndex > -1) {
      // Convert quantities to numbers and then add them
      cart.items[existingProductIndex].quantity =
        Number(cart.items[existingProductIndex].quantity) + Number(quantity);
    } else {
      // Add new product to cart with price
      cart.items.push({
        product: productId,
        quantity,
        price: product.MRP, // Store price at the time of adding to cart
        size,
        color,
      });
    }

    // Calculate total price
    cart.total_price = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Save cart
    await cart.save();

    return res
      .status(200)
      .json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCartItem = async (req, res) => {
  const { itemId, quantity } = req.body;

  if (req.session.userId) {
    // User is logged in, update in database
    try {
      const cart = await Cart.findOne({ userId: req.session.userId });
      if (!cart) return res.status(404).send("No cart found");

      const itemIndex = cart.items.findIndex((item) => item.itemId === itemId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.status(200).send("Cart item updated");
      } else {
        res.status(404).send("Item not found in cart");
      }
    } catch (error) {
      res.status(500).send("Error updating cart item");
    }
  } else {
    // User is not logged in, update in session
    const itemIndex = req.session.cart.findIndex(
      (item) => item.itemId === itemId
    );
    if (itemIndex > -1) {
      req.session.cart[itemIndex].quantity = quantity;
      res.status(200).send("Cart item updated in session");
    } else {
      res.status(404).send("Item not found in session cart");
    }
  }
};

export const listCartbyId = async (req, res) => {
  try {
    // Ensure user is logged in
    if (!req.user?.id) {
      return res.status(401).json({
        status: false,
        message: "User must be logged in to view the cart",
      });
    }

    const cart = await cartModel
      .findOne({ user: req.user.id })
      .populate("items.product"); // Adjust the query based on your cart schema

    // Check if the cart exists
    if (!cart) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    // Send the cart details as response
    return res.status(200).json({ status: true, cart });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
