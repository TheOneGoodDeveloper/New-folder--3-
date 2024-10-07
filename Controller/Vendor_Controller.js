import { vendorModel } from "../Model/Vendor_schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { productModel } from "../Model/Product_schema.js";

export const authMiddleware = (req, res, next) => {
  const token = req?.headers["authorization"]
    ? req?.headers["authorization"]
    : "";
  if (!token) {
    return res
      .status(200)
      .json({ status: false, message: "Token not provided" });
  }
  // token = token.split(" ")[1];

  jwt.verify(token, "Evvi_Solutions_Private_Limited", (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(200)
          .json({ status: false, statusCode: 700, message: "Token expired" });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "Invalid token" });
      }
    }

    req.user = decoded;
    next();
  });
};
export const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      company_name,
      phone_number,
      password,
      address,
      bank_account,
    } = req.body;

    const existingVendor = await vendorModel.findOne({ email });
    if (existingVendor) {
      return res
        .status(400)
        .json({ message: "Vendor with this email already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const bankDetails = vendorBankDetails(bank_account);
    const newVendor = new Vendor({
      name,
      email,
      company_name,
      phone_number,
      hashed_password,
      address,
      bank_account: bankDetails, // Attach bank details separately
    });
    await newVendor
      .save()
      .then(() => {
        return res.status(201).json({
          status: true,
          message: "Vendor registered successfully Wait for Admin to Verify",
          vendor: {
            id: newVendor._id,
            name: newVendor.name,
            email: newVendor.email,
            company_name: newVendor.company_name,
            phone_number: newVendor.phone_number,
            address: newVendor.address,
            bank_account: newVendor.bank_account,
            status: "active",
          },
        });
      })
      .error((err) => {
        console.log(err);
        return res
          .status(401)
          .json({ status: false, message: "Error In Save Vender Details" });
      });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internel Server error",
      error: error.message,
    });
  }
};

export const vendorLogin = async (req, res) => {
  if (req.user.role === "vendor") {
    try {
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email || !password) {
        return res
          .status(400)
          .json({ status: false, message: "Please enter required fields" });
      }

      // Find the vendor by email
      const existingVendor = await vendorModel.findOne({ email });
      if (!existingVendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      // Check if the password is correct
      const passwordMatch = await bcrypt.compare(
        password,
        existingVendor.hashed_password
      );
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: existingVendor._id,
          email: existingVendor.email,
          role: req.user.role,
        },
        process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
        { expiresIn: "1h" }
      );

      // Update the vendor's status to 'active' if currently 'inactive'
      if (existingVendor.status === "inactive") {
        existingVendor.status = "active";
        await existingVendor.save(); // Save the updated status
      }

      // Respond with the token and vendor details
      return res
        .status(200)
        .header("auth-token", token)
        .json({
          status: true,
          message: "Login successful",
          token,
          vendor: {
            id: existingVendor._id,
            email: existingVendor.email,
            name: existingVendor.name,
            status: existingVendor.status, // Vendor's updated status
          },
        });
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Server error", error: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const getVendorProfile = async (req, res) => {
  if (req.user.role === "vendor") {
    try {
      // Assuming the vendor's ID is stored in `req.user.id` after authentication
      const vendorId = req.user.id;

      // Find the vendor by ID, excluding the password field
      const vendor = await vendorModel
        .findById(vendorId)
        .select("-hashed_password");

      // Check if the vendor exists
      if (!vendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      // Return the vendor profile details
      return res.status(200).json({
        status: true,
        message: "Vendor profile retrieved successfully",
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          company_name: vendor.company_name,
          phone_number: vendor.phone_number,
          address: vendor.address,
          is_approved: vendor.is_approved,
          status: vendor.status,
          bank_account: vendor.bank_account, // Assuming bank details are stored here
        },
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Server error", error: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const getAllVendors = async (req, res) => {
  if (req.user.role === "admin") {
    // Assuming only admins can get all vendors
    try {
      // Fetch all vendors excluding the hashed password field
      const vendors = await vendorModel.find().select("-hashed_password");

      if (!vendors || vendors.length === 0) {
        return res
          .status(404)
          .json({ status: false, message: "No vendors found" });
      }

      // Return the list of vendors
      return res.status(200).json({
        status: true,
        message: "Vendors retrieved successfully",
        vendors: vendors.map((vendor) => ({
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          company_name: vendor.company_name,
          phone_number: vendor.phone_number,
          address: vendor.address,
          is_approved: vendor.is_approved,
          status: vendor.status,
          bank_account: vendor.bank_account, // Bank details can be included if necessary
        })),
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Internal Server error" });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const deleteVendor = async (req, res) => {
  if (req.user.role === "admin") {
    // Assuming only admins can change vendor status
    try {
      const { vendorId } = req.params; // Assuming vendorId is passed as a URL parameter

      // Check if vendor ID is provided
      if (!vendorId) {
        return res
          .status(400)
          .json({ status: false, message: "Vendor ID is required" });
      }

      // Find the vendor and update the status to 'inactive'
      const updatedVendor = await vendorModel
        .findByIdAndUpdate(
          vendorId,
          { status: "inactive" },
          { new: true } // Return the updated vendor
        )
        .select("-hashed_password"); // Exclude hashed_password

      if (!updatedVendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      // Return success response
      return res.status(200).json({
        status: true,
        message: "Vendor status set to inactive",
        vendor: updatedVendor,
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Server error", error: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};
// Example vendorBankDetails function
const vendorBankDetails = (bank_account) => {
  // Destructure properties from the bankAccount object
  const {
    account_holder_name,
    bank_name,
    account_number,
    ifsc_code,
    branch_name,
    account_type,
  } = bank_account;

  // Validate bank account details
  if (
    !account_holder_name ||
    !bank_name ||
    !account_number ||
    !ifsc_code ||
    !branch_name ||
    !account_type
  ) {
    throw new Error("Incomplete bank account details");
  }

  // Format the bank details according to your schema
  return {
    account_holder_name,
    bank_name,
    account_number,
    ifsc_code,
    branch_name,
    account_type,
    createdAt: new Date(), // Add a timestamp if needed
  };
};

export const approveVendor = async (req, res) => {
  if (req.user.role == "admin") {
    try {
      const { vendorId, approve_status } = req.body;

      if (!vendorId) {
        return res
          .status(401)
          .json({ status: false, message: "Vendor ID Required" });
      } else {
        await vendorModel
          .create({
            _id: vendorId,
            is_approved: approve_status,
          })
          .then((approved) => {
            return res
              .status(200)
              .json({ status: true, message: "Vendor Approved Successfully" });
          })
          .err(() => {
            return res.status(404).json({ status: false, message: "" });
          });
      }
    } catch {
      return res
        .status(500)
        .json({ status: false, message: "Internal Server Error" });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const countProductByVendor = async (req, res) => {
  if (req.user.role == "admin") {
    try {
      const { vendorId } = req.body;
      if (!vendorId) {
        return res
          .status(401)
          .json({ status: false, message: "Vendor ID required" });
      }
      await productModel
        .findById({ vendorId: vendorId })
        .then((vendorProductList) => {
          return res
            .status(200)
            .json({
              status: true,
              message: "product count fetched Successfully",
              count: vendorProductList.length
            });
        });
    } catch {
      return res
        .status(404)
        .json({ status: false, message: "no product Found" });
    }
  }
};
