// import { invoiceModel } from "../models/invoiceModel.js";
// import { productModel } from "../models/productModel.js";

// export const createInvoice = async (req, res) => {
//   try {
//     const { user, products, discount, payment_status } = req.body;

//     if (!products || products.length === 0) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Products are required" });
//     }

//     let total_price = 0;
//     let gst_total = 0;

//     for (const item of products) {
//       const product = await productModel.findById(item.product_id);
//       if (!product) {
//         return res.status(404).json({
//           status: false,
//           message: `Product not found: ${item.product_id}`,
//         });
//       }

//       item.price = product.final_price; // Assuming final_price is stored in productModel
//       item.total_price = item.quantity * item.price;
//       item.gst_amount = (item.total_price * item.gst_percentage) / 100;
//       total_price += item.total_price;
//       gst_total += item.gst_amount;
//     }

//     const discountAmount = discount ? (total_price * discount) / 100 : 0;
//     const final_price = total_price - discountAmount + gst_total;

//     const newInvoice = new invoiceModel({
//       invoice_number: `INV-${Date.now()}`,
//       user: user || null,
//       products,
//       total_price,
//       discount,
//       gst_total,
//       final_price,
//       payment_status,
//     });

//     await newInvoice.save();
//     res.status(201).json({
//       status: true,
//       message: "Invoice created successfully",
//       invoice: newInvoice,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const getInvoices = async (req, res) => {
//   try {
//     const invoices = await invoiceModel
//       .find()
//       .populate("user")
//       .populate("products.product_id");
//     res.status(200).json(invoices);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

// export const getInvoiceById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const invoice = await invoiceModel
//       .findById(id)
//       .populate("user")
//       .populate("products.product_id");
//     if (!invoice) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Invoice not found" });
//     }
//     res.status(200).json(invoice);
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const updateInvoice = async (req, res) => {
//   try {
//     const { id } = req.body;
//     const updatedInvoice = await invoiceModel.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedInvoice) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Invoice not found" });
//     }
//     res.status(200).json({
//       status: true,
//       message: "Invoice updated successfully",
//       invoice: updatedInvoice,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const deleteInvoice = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedInvoice = await invoiceModel.findByIdAndDelete(id);
//     if (!deletedInvoice) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Invoice not found" });
//     }
//     res
//       .status(200)
//       .json({ status: true, message: "Invoice deleted successfully" });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const getInvoiceByUser = async (req, res) => {
//   const { user_id } = req.body;

//   if (!user_id) {
//     return res
//       .status(400)
//       .json({ success: false, message: "User ID is required" });
//   }

//   try {
//     const invoices = await invoiceModel
//       .find({ user: user_id })
//       .populate("user")
//       .populate("products.product_id");

//     if (invoices.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No invoices found for this user" });
//     }

//     res.status(200).json({ success: true, invoices });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         // success: false,
//         message: "Internal server error",
//         error: error.message,
//       });
//   }
// };

import puppeteer from "puppeteer";
import fs from "fs";
import QRCode from "qrcode";
import { orderModel } from "../Model/Order_schema.js";
import { productModel } from "../Model/Product_schema.js";
import { invoiceModel } from "../Model/Invoice_schema.js";

const BASE_URL = "http://localhost:3000/";

// Generate Invoice URL & Store in DB
const generateInvoiceLink = async (parentOrderId) => {
  try {
    // Fetch orders under parent ID
    const vendorOrders = await orderModel
      .find({ parentOrderId })
      .populate("userId", "name email")
      .populate("products.productId")
      .populate("vendor_id", "name");

    if (!vendorOrders.length) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    // Generate a unique invoice URL
    const invoiceUrl = `${BASE_URL}/invoices/${parentOrderId}`;

    // Generate QR Code from invoice URL
    const qrCodeURL = await QRCode.toDataURL(invoiceUrl);

    // Update all orders under this parent with the invoice link
    await orderModel.updateMany({ parentOrderId }, { $set: { invoiceUrl } });

    // res.json({ success: true, invoiceUrl, qrCodeURL });
    return { success: true, invoiceUrl, qrCodeURL };
  } catch (error) {
    console.error("Error generating invoice link:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Generate Invoice PDF on Demand
// export const generateInvoice = async (req, res) => {
//   try {
//     const { parentOrderId } = req.body;
//     console.log(parentOrderId);
//     const vendorOrders = await orderModel
//       .find({ parentOrderId })
//       .populate("userId", "name email")
//       .populate("products.productId")
//       .populate("vendor_id", "name");
//     console.log(vendorOrders);

//     if (!vendorOrders.length) {
//       return res.status(404).send("Invoice not found");
//     }

//     const order = vendorOrders[0];
//     const user = order.userId;
//     let totalAmount = 0;
//     let taxTotal = 0;
//     let subTotal = 0;

//     // Build product details
//     const productRows = vendorOrders
//       .flatMap((order) =>
//         order.products.map((item) => {
//           const product = item.productId;
//           if (!product) return "";
//           const total = product.final_price * item.quantity;
//           const tax = (total * product.gst_percentage) / 100;
//           subTotal += total;
//           taxTotal += tax;
//           totalAmount += total + tax;

//           return `
//             <tr>
//                 <td>${product.name}</td>
//                 <td>${item.quantity}</td>
//                 <td>₹${product.final_price.toFixed(2)}</td>
//                 <td>₹${total.toFixed(2)}</td>
//             </tr>`;
//         })
//       )
//       .join("");
//     // console.log(productRows);
//     // Generate QR Code (retrieved from DB or regenerated)
//     const qrCodeURL = await generateInvoiceLink(parentOrderId);
//     const invoiceHTML = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Invoice</title>
//         <style>
//             body { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; }
//             .container { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); }
//             .header { text-align: center; font-size: 24px; font-weight: bold; padding-bottom: 10px; border-bottom: 2px solid #ddd; }
//             .logo { width: 150px; margin-bottom: 10px; }
//             .tagline { font-size: 14px; color: #666; }
//             .order-details, .shipping-billing { margin-top: 20px; font-size: 14px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
//             th { background-color: #f8f8f8; }
//             .total { text-align: right; font-weight: bold; font-size: 16px; }
//             .footer { text-align: center; margin-top: 40px; font-size: 12px; color: gray; }
//             .qr-container { text-align: center; margin-top: 20px; }
//             .qr-code { width: 100px; height: 100px; }
//             .highlight { font-weight: bold; color: #ff6600; }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <div class="header">
//                 <img class="logo" src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon Logo">
//                 <div class="tagline">Your Trusted Online Marketplace</div>
//                 <h2>Invoice</h2>
//             </div>
            
//             <div class="order-details">
//                 <p><strong>Order ID:</strong> ${order._id}</p>
//                 <p><strong>Order Date:</strong> ${new Date(
//                   order.createdAt
//                 ).toLocaleDateString()}</p>
//             </div>

//             <div class="shipping-billing">
//                 <p><strong>Customer:</strong> ${user.name}</p>
//                 <p><strong>Email:</strong> ${user.email}</p>
//                 <p><strong>Shipping Address:</strong> ${
//                   order.shippingAddress
//                 }</p>
//                 <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
//                 <p><strong>Payment Status:</strong> <span class="highlight">${
//                   order.paymentStatus
//                 }</span></p>
//             </div>

//             <h3>Items Purchased</h3>
//             <table>
//                 <tr>
//                     <th>Product</th>
//                     <th>Qty</th>
//                     <th>Price</th>
//                     <th>Total</th>
//                 </tr>
//                 ${productRows}
//             </table>

//             <div class="qr-container">
//                 <p>Scan to View Invoice:</p>
//                 <img class="qr-code" src="${qrCodeURL}" alt="QR Code">
//             </div>

//             <div class="footer">
//                 Thank you for shopping with us!
//             </div>
//         </div>
//     </body>
//     </html>`;

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setContent(invoiceHTML, { waitUntil: "load" });

//     const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
//     await browser.close();

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "inline; filename=invoice.pdf",
//     });
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error("Error generating invoice:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };
export const generateInvoice = async (req, res) => {
  try {
    const { parentOrderId } = req.body;

    const vendorOrders = await orderModel
      .find({ parentOrderId })
      .populate("userId", "name email")
      .populate("products.productId")
      .populate("vendor_id", "name");

    if (!vendorOrders.length) {
      return res.status(404).send("Invoice not found");
    }

    const order = vendorOrders[0];
    const user = order.userId;
    let totalAmount = 0;
    let taxTotal = 0;
    let subTotal = 0;

    // Build product details
    const productRows = vendorOrders
      .flatMap((order) =>
        order.products.map((item) => {
          const product = item.productId;
          if (!product) return "";
          const total = product.final_price * item.quantity;
          const tax = (total * product.gst_percentage) / 100;
          subTotal += total;
          taxTotal += tax;
          totalAmount += total + tax;

          return `
            <tr>
                <td>${product.name}</td>
                <td>${item.quantity}</td>
                <td>₹${product.final_price.toFixed(2)}</td>
                <td>₹${total.toFixed(2)}</td>
            </tr>`;
        })
      )
      .join("");

    // Generate QR Code
    const { qrCodeURL } = await generateInvoiceLink(parentOrderId);

    // Invoice HTML
    const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; }
            .container { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; font-size: 24px; font-weight: bold; padding-bottom: 10px; border-bottom: 2px solid #ddd; }
            .logo { width: 150px; margin-bottom: 10px; }
            .tagline { font-size: 14px; color: #666; }
            .order-details, .shipping-billing { margin-top: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f8f8; }
            .total { text-align: right; font-weight: bold; font-size: 16px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: gray; }
            .qr-container { text-align: center; margin-top: 20px; }
            .qr-code { width: 100px; height: 100px; }
            .highlight { font-weight: bold; color: #ff6600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img class="logo" src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon Logo">
                <div class="tagline">Your Trusted Online Marketplace</div>
                <h2>Invoice</h2>
            </div>
            
            <div class="order-details">
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <div class="shipping-billing">
                <p><strong>Customer:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Payment Status:</strong> <span class="highlight">${order.paymentStatus}</span></p>
            </div>

            <h3>Items Purchased</h3>
            <table>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
                ${productRows}
            </table>

            <div class="qr-container">
                <p>Scan to View Invoice:</p>
                <img class="qr-code" src="${qrCodeURL}" alt="QR Code">
            </div>

            <div class="footer">
                Thank you for shopping with us!
            </div>
        </div>
    </body>
    </html>`;

    // Debugging: Save HTML to check if content is correct
    fs.writeFileSync("invoice_debug.html", invoiceHTML);
    console.log("Invoice HTML saved. Open invoice_debug.html to check.");

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(invoiceHTML, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    console.log("PDF Buffer Length:", pdfBuffer.length);
    if (pdfBuffer.length === 0) {
      return res.status(500).send("Failed to generate PDF");
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=invoice.pdf",
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).send("Internal Server Error");
  }
};


export const createInvoice = async (req, res) => {
  try {
    const { parentOrderId, payment_status } = req.body;

    // Fetch all orders with the same parentOrderId
    const orders = await orderModel.find({ parent_order_id: parentOrderId }).populate("products.product_id");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found for this parentOrderId" });
    }

    let combinedProducts = new Map(); // To merge products
    let total_price = 0;
    let gst_total = 0;
    let discount = 0;

    for (const order of orders) {
      discount += order.discount || 0; // Sum up discounts from orders

      order.products.forEach((item) => {
        const productKey = item.product_id.toString(); // Unique key for the product

        if (combinedProducts.has(productKey)) {
          // If product exists, update quantity and amounts
          let existingProduct = combinedProducts.get(productKey);
          existingProduct.quantity += item.quantity;
          existingProduct.total_price += item.total_price;
          existingProduct.gst_amount += item.gst_amount;
        } else {
          // Add new product entry
          combinedProducts.set(productKey, { ...item.toObject() });
        }
      });

      total_price += order.total_price;
      gst_total += order.gst_total;
    }

    const mergedProducts = Array.from(combinedProducts.values());
    const final_price = total_price + gst_total - discount;

    // Generate unique invoice number
    const invoice_number = `INV-${Date.now()}`;

    // Save invoice
    const invoiceData = {
      invoice_number,
      user: orders[0].user, // Assuming all orders belong to the same user
      store: orders[0].store,
      products: mergedProducts,
      total_price,
      discount,
      gst_total,
      final_price,
      payment_status,
    };

    const newInvoice = await invoiceModel.create(invoiceData);

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const generateInvoiceData = async (parentOrderId, payment_status) => {
  const orders = await orderModel.find({ parent_order_id: parentOrderId, payment_status: "paid" })
    .populate("products.product_id");

  if (!orders.length) {
    throw new Error("No paid orders found for this parentOrderId");
  }

  let combinedProducts = new Map(); // To merge products
  let total_price = 0;
  let gst_total = 0;
  let discount = 0;

  for (const order of orders) {
    discount += order.discount || 0; // Sum up discounts from orders

    for (const item of order.products) {
      const productKey = item.product_id.toString(); // Unique key for the product

      if (combinedProducts.has(productKey)) {
        let existingProduct = combinedProducts.get(productKey);
        existingProduct.quantity += item.quantity;
        existingProduct.total_price += item.total_price;
        existingProduct.gst_amount += item.gst_amount;
      } else {
        combinedProducts.set(productKey, { ...item.toObject() });
      }
    }

    total_price += order.total_price;
    gst_total += order.gst_total;
  }

  const mergedProducts = Array.from(combinedProducts.values());
  const final_price = total_price + gst_total - discount;
  const invoice_number = `INV-${Date.now()}`;

  return {
    invoice_number,
    user: orders[0].user, // Assuming all orders belong to the same user
    store: orders[0].store,
    products: mergedProducts,
    total_price,
    discount,
    gst_total,
    final_price,
    payment_status,
    order_ids: orders.map((o) => o._id), // Store processed order IDs for updating
  };
};


export const getInvoiceByNumber = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await invoiceModel.findOne({ invoice_number: invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const invoices = await invoiceModel
      .find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};