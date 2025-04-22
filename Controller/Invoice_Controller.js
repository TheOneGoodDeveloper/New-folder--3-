import { orderModel } from "../Model/Order_schema.js";
import { productModel } from "../Model/Product_schema.js";
import { invoiceModel } from "../Model/Invoice_schema.js";
import puppeteer from "puppeteer";
import mongoose from "mongoose";
import fs from "fs";
import QRCode from "qrcode";

export const createInvoice = async (req, res) => {
  try {
    console.log("💡 Request received for invoice creation");

    // Extract `parentOrderId`
    const parentOrderId = req.body.parentOrderId;
    console.log("📌 Extracted parentOrderId:", parentOrderId);
    console.log("📌 Type of parentOrderId:", typeof parentOrderId);

    if (typeof parentOrderId !== "string") {
      console.error("❌ Invalid parentOrderId format:", parentOrderId);
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    // Validate `parentOrderId`
    if (!parentOrderId || !mongoose.Types.ObjectId.isValid(parentOrderId)) {
      console.error("❌ Invalid Order ID format:", parentOrderId);
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    // Convert to ObjectId before querying
    const orderId = new mongoose.Types.ObjectId(parentOrderId);
    console.log("🔍 Converted parentOrderId to ObjectId:", orderId);

    // Fetch all orders grouped under the `parentOrderId`
    const orders = await orderModel
      .find({ parentOrderId: orderId })
      .populate("products.productId vendor_id");

    console.log("📝 Fetched Orders:", orders);

    if (!orders.length) {
      console.warn("⚠️ No orders found for parentOrderId:", orderId);
      return res.status(404).json({ message: "No grouped orders found" });
    }

    console.log("✅ Orders found! Processing invoice...");

    // Group products by vendor
    const vendorMap = new Map();

    orders.forEach((order) => {
      order.products.forEach((item) => {
        if (!item.productId || !item.productId.vendor_id) {
          console.warn("⚠️ Product missing vendor details:", item);
          return;
        }

        const vendorId = item.productId.vendor_id.toString();

        if (!vendorMap.has(vendorId)) {
          vendorMap.set(vendorId, {
            vendor_id: vendorId,
            vendor_name: item.productId.vendor_name || "Unknown Vendor",
            products: [],
            vendor_total: 0,
            vendor_gst: 0,
          });
        }

        const vendor = vendorMap.get(vendorId);
        const gstAmount =
          (item.productId.gst_percentage / 100) * item.price * item.quantity;

        vendor.products.push({
          product_id: item.productId._id,
          quantity: item.quantity,
          price: item.price,
          total_price: item.price * item.quantity,
          gst_percentage: item.productId.gst_percentage,
          gst_amount: gstAmount,
        });

        vendor.vendor_total += item.price * item.quantity;
        vendor.vendor_gst += gstAmount;
      });
    });

    console.log(
      "📦 Vendor-wise product mapping completed:",
      Array.from(vendorMap.values())
    );

    // Calculate overall invoice totals
    const total_price = Array.from(vendorMap.values()).reduce(
      (acc, v) => acc + v.vendor_total,
      0
    );
    const gst_total = Array.from(vendorMap.values()).reduce(
      (acc, v) => acc + v.vendor_gst,
      0
    );
    const final_price = total_price + gst_total;

    console.log("💰 Invoice calculations:", {
      total_price,
      gst_total,
      final_price,
    });

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    console.log("📝 Generated Invoice Number:", invoiceNumber);

    // Save invoice in DB
    const invoice = new invoiceModel({
      invoice_number: invoiceNumber,
      user: orders[0].userId, // Using userId from the first order
      store: "online",
      vendors: Array.from(vendorMap.values()),
      total_price,
      gst_total,
      final_price,
      payment_status:orders[0].paymentStatus ? "paid":"pending",
    });

    await invoice.save();
    console.log("✅ Invoice saved successfully:", invoice);

    res.status(201).json({ message: "Invoice created successfully", invoice });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};