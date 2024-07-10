const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
require("dotenv").config();
const OrderNumber = require("./backend/models/OrderNo");

const User = require("./backend/models/User"); // Import User model
const Team = require("./backend/models/Team"); // Import Team model

const port = 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Corrected connection string with the '@' character properly URL-encoded
const mongoURI =
  "mongodb+srv://Dipshika:dnjDdHAD0Hhxj5Zp@cluster0.gojob9v.mongodb.net/ordersDB?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Connection failed", err);
  });

let orderCount = 0;

// Add a new order and update the order number
app.post("/orders", async (req, res) => {
  console.log("adding new order");
  try {
    console.log("Create a new order:", req.body);

    const {
      orderNo,
      orderDate,
      salesAgent,
      customerName,
      bAddress,
      sAddress,
      email,
      phone,
      make,
      model,
      year,
      pReq,
      desc,
      warranty,
      soldP,
      costP,
      shippingFee,
      salestax,
      grossProfit,
      orderStatus,
      vin,
      issueOrder,
      orderHistory,
    } = req.body;

    const newOrder = new Order({
      orderNo,
      orderDate,
      salesAgent,
      customerName,
      bAddress,
      sAddress,
      email,
      phone,
      make,
      model,
      year,
      pReq,
      desc,
      warranty,
      soldP,
      costP,
      shippingFee,
      salestax,
      grossProfit,
      orderStatus,
      vin,
      issueOrder,
      orderHistory,
    });

    // Increment the order count and assign the team
    orderCount += 1;
    console.log("orderCount", orderCount);
    if (orderCount % 2 === 1) {
      newOrder.team = "Mark"; // Assign to Team Mark
      newOrder.teamOrder = "Mark"; // Add teamOrder field
      console.log("Mark's team", newOrder.team);
    } else {
      newOrder.team = "Sussane"; // Assign to Team Sussane
      newOrder.teamOrder = "Sussane"; // Add teamOrder field
      console.log("Sussane's team", newOrder.team);
    }

    // Save the new order to the database
    await newOrder.save();

    // Generate an invoice for the new order
    await generateInvoice(newOrder.orderNo, newOrder);

    res.status(201).json({ newOrder, team: newOrder.team });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});


// Create User Endpoint
app.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, email, team, role, password } = req.body;
    console.log("Received data:", req.body);

    const newUser = new User({
      firstName,
      lastName,
      email,
      team,
      role,
      password,
    });

    const newTeam = new Team({
      team,
      role,
      name: `${firstName} ${lastName}`,
    });

    await newUser.save();
    await newTeam.save();

    res.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

// Fetch all users
app.get("/allUsers", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

// Fetch all teams
app.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find({});
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res
      .status(500)
      .json({ message: "Error fetching teams", error: error.message });
  }
});

// Cancelled Orders Schema
const CancelledOrderSchema = new mongoose.Schema({
  orderNo: Number,
  orderDate: String,
  salesAgent: String,
  customerName: String,
  bAddress: String,
  sAddress: String,
  email: String,
  phone: String,
  make: String,
  model: String,
  year: Number,
  pReq: String,
  desc: String,
  warranty: Number,
  soldP: Number,
  costP: Number,
  shippingFee: Number,
  salestax: Number,
  grossProfit: Number,
  orderStatus: String,
  vin: Number,
  issueOrder: String,
  additionalInfo: Array,
  trackingInfo: String,
  orderHistory: [String],
  isCancelled: { type: Boolean, default: true },
});

const CancelledOrder = mongoose.model("CancelledOrder", CancelledOrderSchema);

const OrderSchema = new mongoose.Schema({
  orderNo: String,
  orderDate: String,
  salesAgent: String,
  customerName: String,
  bAddress: String,
  sAddress: String,
  email: String,
  phone: String,
  make: String,
  model: String,
  year: Number,
  pReq: String,
  desc: String,
  warranty: Number,
  soldP: Number,
  costP: Number,
  shippingFee: Number,
  salestax: Number,
  grossProfit: Number,
  orderStatus: String,
  vin: Number,
  issueOrder: String,
  additionalInfo: Array,
  trackingInfo: String,
  orderHistory: [String],
  notes: String,
  isCancelled: { type: Boolean, default: false },
  teamOrder:String
});

const Order = mongoose.model("Order", OrderSchema);

app.get("/orders", async (req, res) => {
  const orders = await Order.find({});
  res.json(orders);
});

app.get("/orders/:orderNo", async (req, res) => {
  const order = await Order.findOne({ orderNo: req.params.orderNo });
  res.json(order);
});

app.put("/orders/:orderNo", async (req, res) => {
  try {
      const order = await Order.findOne({ orderNo: req.params.orderNo });
      if (!order) return res.status(404).send("Order not found");

      const oldStatus = order.orderStatus;
      Object.assign(order, req.body);

      const firstName = req.body.firstName; // Get firstName from the request body

      // Add timestamp to order history only if the status has changed
      if (oldStatus !== order.orderStatus) {
          const timestamp = new Date().toLocaleString();
          order.orderHistory.push(
              `Order status updated to "${order.orderStatus}" by ${firstName} on ${timestamp}`
          );
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
  } catch (err) {
      res.status(400).send(err.message);
  }
});


app.post("/orders/:orderNo/additionalInfo", async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });

    if (!order) return res.status(404).send("Order not found");

    // Count the number of existing yards
    const countYard = order.additionalInfo.length + 1;

    order.additionalInfo.push(req.body);

    // Add timestamp to order history
    const timestamp = new Date();
    order.orderHistory.push(`Yard ${countYard} PO Sent by ${firstName} on ${new Date().toLocaleString()}`);

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.put("/orders/:orderNo/additionalInfo/:yardIndex", async (req, res) => {
  try {
    console.log("Received PUT request:", req.params.orderNo, req.params.yardIndex);
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    const yardIndex = parseInt(req.params.yardIndex, 10) - 1;
    console.log("Order found:", order);
    console.log("Yard index:", yardIndex);

    if (!order) return res.status(404).send("Order not found");

    if (yardIndex >= 0 && yardIndex < order.additionalInfo.length) {
      const yardInfo = order.additionalInfo[yardIndex];
      console.log("Existing yard info:", yardInfo);

      for (const key in req.body) {
        if (req.body.hasOwnProperty(key)) {
          yardInfo[key] = req.body[key];
        }
      }

      // Update the specific index in the additionalInfo array
      order.additionalInfo[yardIndex] = yardInfo;

      // Add timestamp to order history
      const timestamp = new Date().toLocaleString();
      const firstName = req.body.firstName; // Get firstName from the request body
      const status = req.body.status; // Get status from the request body
      order.orderHistory.push(`Yard ${yardIndex + 1} ${status} updated by ${firstName} on ${timestamp}`);

      // Mark the additionalInfo array as modified
      order.markModified("additionalInfo");

      await order.save();
      res.json(order);
    } else {
      res.status(400).json({ message: "Invalid yard index" });
    }
  } catch (error) {
    console.error("Error in PUT request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



// Delete the order and save into cancelled orders
app.delete("/orders/:orderNo", async (req, res) => {
  console.log("inside delete mongo");
  try {
    const orderNo = parseInt(req.params.orderNo, 10);
    if (isNaN(orderNo)) {
      return res.status(400).json({ message: "Invalid order number" });
    }

    const order = await Order.findOne({ orderNo });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const cancelledOrder = new CancelledOrder(order.toObject()); // Create a new CancelledOrder document
    await cancelledOrder.save(); // Save the cancelled order

    await Order.deleteOne({ orderNo });
    res.json({ message: "Order canceled and saved as cancelled" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting order", error: err.message });
  }
});

// Route to fetch all cancelled orders
app.get("/cancelledOrders", async (req, res) => {
  try {
    const cancelledOrders = await CancelledOrder.find({});
    res.json(cancelledOrders);
  } catch (err) {
    console.error("Error fetching cancelled orders:", err);
    res
      .status(500)
      .json({ message: "Error fetching cancelled orders", error: err.message });
  }
});

// Send Invoice Endpoint
app.post("/orders/sendInvoice/:orderNo", async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    console.log("inside send Invoice", order);
    if (!order) return res.status(404).send("Order not found");

    const invoicePath = path.resolve(`./invoices/invoice_${order.orderNo}.pdf`);
    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password",
      },
    });

    const mailOptions = {
      from: "your-email@gmail.com",
      to: order.email,
      subject: "Your Order Invoice",
      text: `Dear ${order.customerName},\n\nPlease find attached the invoice for your order #${order.orderNo}.\n\nThank you for your business!\n\nBest regards,\nYour Company Name`,
      attachments: [
        {
          filename: `invoice_${order.orderNo}.pdf`,
          path: invoicePath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error sending email", error });
      } else {
        console.log("Email sent: " + info.response);
        res.json({ message: "Invoice sent successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Add a new route for fetching yard information
app.get("/yardInfo", async (req, res) => {
  try {
    const orders = await Order.find({});
    // console.log("Fetched yard info:", orders); // Logging fetched orders
    res.json(orders);
  } catch (error) {
    console.error("Error fetching yard info:", error);
    res.status(500).send("Server error");
  }
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "frontend")));

// Routes
app.use("/auth", require("./backend/routes/auth"));
app.use("/orders", require("./backend/routes/orders"));

// Fallback to index.html for any unknown routes (useful for single-page apps)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "orders.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Update password
app.put("/users/:id/password", async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
});

// Function to generate invoice
async function generateInvoice(orderNo, orderData) {
  console.log("inside generate function");
  const existingPdfBytes = fs.readFileSync(path.resolve("./388.pdf"));
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const firstPage = pdfDoc.getPage(0);
  // Part description
  var partDesc =
    "Year: " +
    orderData.year +
    "\n" +
    "Make: " +
    orderData.make +
    "\n" +
    "Model: " +
    orderData.model +
    "\n" +
    "Part required: " +
    orderData.pReq +
    "\n" +
    "Desc: " +
    orderData.desc +
    "\n" +
    "VIN: " +
    orderData.vin +
    "\n" +
    "Warranty: " +
    orderData.warranty;
  console.log("desc", partDesc);

  // Billing address
  var billingaddress =
    orderData.customerName +
    "\n" +
    orderData.bAddress +
    "\n" +
    orderData.email +
    "\n" +
    orderData.phone;

  var shippingaddress =
    orderData.customerName +
    "\n" +
    orderData.sAddress +
    "\n" +
    orderData.email +
    "\n" +
    orderData.phone;
  console.log("billing and shipping", billingaddress, shippingaddress);
  const replacements = [
    {
      text: `50STARS${orderNo.toString().padStart(4, "0")}`,
      x: 450,
      y: 728,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    },
    {
      text: `${new Date().toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      })}`,
      x: 450,
      y: 714,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    },
    {
      text: `${billingaddress}`,
      x: 80,
      y: 650,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    },
    {
      text: `${shippingaddress}`,
      x: 300,
      y: 650,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    },
    {
      text: `${partDesc}`,
      x: 80,
      y: 520,
      size: 13,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    },
    {
      text: `$${orderData.soldP}`,
      x: 473,
      y: 460,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    },
    {
      text: `$${orderData.soldP}`,
      x: 473,
      y: 325,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    },
    {
      text: `$${orderData.soldP}`,
      x: 473,
      y: 284,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
    }, // White color
  ];

  const drawMultilineText = (page, text, x, y, fontSize, font, color) => {
    const lines = text.split("\n");
    lines.forEach((line, idx) => {
      page.drawText(line, {
        x,
        y: y - idx * fontSize * 1.2,
        size: fontSize,
        font,
        color,
      });
    });
  };

  replacements.forEach(({ text, x, y, size, font, color }) => {
    drawMultilineText(firstPage, text, x, y, size, font, color);
  });

  const pdfBytes = await pdfDoc.save();

  // Load the original PDF and remove the first page
  const originalPdfBytes = fs.readFileSync(path.resolve("./388.pdf"));
  const originalPdfDoc = await PDFDocument.load(originalPdfBytes);

  const modifiedPdfDoc = await PDFDocument.create();
  const [invoicePage] = await modifiedPdfDoc.copyPages(pdfDoc, [0]);
  modifiedPdfDoc.addPage(invoicePage);

  const totalPages = originalPdfDoc.getPageCount();
  for (let i = 1; i < totalPages; i++) {
    const [copiedPage] = await modifiedPdfDoc.copyPages(originalPdfDoc, [i]);
    modifiedPdfDoc.addPage(copiedPage);
  }

  const modifiedPdfBytes = await modifiedPdfDoc.save();

  const outputPath = path.resolve(`./invoices/invoice_${orderNo}.pdf`);
  fs.writeFileSync(outputPath, modifiedPdfBytes);

  console.log(`Invoice generated and appended: ${outputPath}`);
}
// to send tracking info email
app.post("/orders/sendTrackingInfo/:orderNo", async (req, res) => {
  console.log("send tracking info");
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    console.log("no", order);
    if (!order) {
      return res.status(400).send("Order not found");
    }

    // Get tracking information from the request body
    const { trackingNo, eta, shipperName, link } = req.body;
    console.log("trackingInfo", trackingNo, eta, shipperName, link);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dipshikapradhan2201@gmail.com",
        pass: "mtjd pttn ldtg jidk",
      },
    });

    const mailOptions = {
      from: "dipshikapradhan2201@gmail.com",
      to: `${order.email}`,
      subject: `TraFwd: Tracking Details / Order No. ${req.params.orderNo}`,
      html: `<p>Hi ${order.customerName},</p>
                  <p>This email is regarding the order you placed with 50 stars auto parts, and we have attached the tracking information in the same email along with a link that will take you directly to the tracking page.</p>
                  <p>If the ETA is not updated in the system, it may take 24 hours to reflect on the tracking website; you may check again if you do not find the ETA.</p>
                  <p>Please call us if you have any questions.</p>
                  <p>${shipperName} - ${trackingNo}</p>
                  <p>ETD - ${eta}</p>
                  <p>Link - <a href="${link}">${link}</a></p>
                  <p><img src="cid:myImg" alt="logo" style="max-width: 100%; height: auto;"></p>
                  <p>Mark Becker<br>Customer Success<br>+1 (469) 899-0684<br>50starsautoparts.com<br>5306 Blaney Way, Dallas, Texas, 75227</p>`,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "logo.png"),
          cid: "myImg",
        },
      ],
    };
    console.log("mail", mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending mail:", error);
        res
          .status(500)
          .json({ message: `Error sending mail: ${error.message}` });
      } else {
        console.log("Email sent successfully:", info.response);
        res.json({ message: `Email sent successfully` });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/ordersteamA", async (req, res) => {
  console.log("Team A orders");
  try {
    const orderA = await Order.find({});
    console.log("Successfully shown", orderA);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/ordersteamB", async (req, res) => {
  console.log("Team B orders");
  try {
    const orderB = await order.find({});
    console.log("Successfully shown", orderB);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to fetch the highest order number
app.get("/orders/highestOrderNo", async (req, res) => {
  console.log("getting latest order");
  try {
    let orderNoDoc = await OrderNumber.findOne();
    if (!orderNoDoc) {
      // Initialize the order number if it doesn't exist
      orderNoDoc = new OrderNo({ latestOrderNo: "50STARS0000" });
      await orderNoDoc.save();
    }
    res.json({ latestOrderNo: orderNoDoc.latestOrderNo });
  } catch (err) {
    console.error("Error fetching highest order number:", err);
    res.status(500).json({
      message: "Error fetching highest order number",
      error: err.message,
    });
  }
});

// Helper function to increment the order number
function incrementOrderNo(orderNo) {
  const prefix = "50STARS";
  const orderNumber = parseInt(orderNo.replace(prefix, ""), 10);
  const nextOrderNumber = orderNumber + 1;
  return `${prefix}${nextOrderNumber.toString().padStart(5, "0")}`;
}

// function to edit the yard details
app.put("/orders/:orderNo/additionalInfo/:yardIndex", async (req, res) => {
  console.log("inside edit yard details");
  const { orderNo, yardIndex } = req.params;
  const updatedYardInfo = req.body;

  try {
    const order = await Order.findOne({ orderNo });
    if (!order) {
      return res.status(404).send("Order not found");
    }

    order.additionalInfo[yardIndex] = updatedYardInfo;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// update notes
app.post("/orders/:orderNo/notes", async (req, res) => {
  try {
    const { orderNo } = req.params;
    const { note } = req.body;

    console.log(`Received request to add note to order ${orderNo}: ${note}`);

    const order = await Order.findOne({ orderNo });
    if (!order) {
      console.log(`Order ${orderNo} not found`);
      return res.status(404).send("Order not found");
    }

    order.notes = note;

    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
