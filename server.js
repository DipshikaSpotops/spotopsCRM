require("dotenv").config();
const express = require("express");
const json2csv = require("json2csv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");   
const nodemailer = require("nodemailer");
const Stripe = require("stripe");
const stripe = Stripe("sk_test_51QUqUvGYqbfUX6jJzdBh3xVvyR2gu7w6NvhYJRrOAhNWf6rPVwq5eyid2Rced5DQfpwXsk1gLNfEUwd1mFyXmUy700TW9SiMZa");
// const puppeteer = require('puppeteer');
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
const moment = require('moment-timezone');
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const shippingRoutes = require('./backend/routes/shippingRoutes');
const OrderNumber = require("./backend/models/OrderNo");
// console.log(OrderNumber)
// Middleware for compression
const port = 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const User = require("./backend/models/User"); 
const Team = require("./backend/models/Team");
const { url } = require("inspector");
const { getMaxListeners } = require("events");
const { Server } = require("http");
const compression = require('compression');

app.use(compression());
app.use('/api/shipping', shippingRoutes);
app.use(express.static('frontend'));

// s3 bucket for uploading order specific pictures
const s3 = new AWS.S3();
const BUCKET_NAME = "order-specific-pictures";
// Multer configuration for file uploads
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));
const upload = multer({
  storage: multer.memoryStorage(),
});
app.use(cors({
origin: 'https://spotops360.com',
methods: 'GET,POST,PUT,DELETE,OPTIONS',
credentials: true
}));
// to handle unknown paths
app.use(express.static(path.join(__dirname, '../frontend')));
app.use((req, res, next) => {
try {
decodeURIComponent(req.path);
next();
} catch (e) {
console.error('Malformed URI detected:', req.path);
res.status(400).send('Malformed URI');
}
});
app.use(bodyParser.json());

// Corrected connection string with the '@' character properly URL-encoded
const mongoURI =
"mongodb+srv://Dipshika:dnjDdHAD0Hhxj5Zp@cluster0.gojob9v.mongodb.net/ordersDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose
.connect(mongoURI)
.then(() => {
console.log("MongoDB connected =----");
})
.catch((err) => {
console.error("Connection failed", err);
});

const db = mongoose.connection;
console.log("my db",db);
let orderCount = 0;

// Add a new order and update the order number
app.post("/orders", async (req, res) => {
console.log("Adding new order");
var firstName = req.query.firstName;
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
const dallasTime = moment().tz('America/Chicago').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
console.log("dallas time:",dallasTime);
try {
console.log("Create a new order:", req.body);

const {
orderNo,
salesAgent,
customerName,
fName,
lName,
bAddressStreet,
bAddressCity,
bAddressState,
bAddressZip,
bAddressAcountry,
bName,
sAddressStreet,
sAddressCity,
sAddressState,
sAddressZip,
sAddressAcountry,
bAddress,
sAddress,
attention,
email,
phone,
altPhone,
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
spMinusTax,
grossProfit,
businessName,
orderStatus,
vin,
partNo,
last4digits,
notes,
orderHistory,
expediteShipping,
dsCall,
programmingRequired,
programmingCostQuoted
} = req.body;

const newOrder = new Order({
orderNo,
salesAgent,
customerName,
bAddressStreet,
bAddressCity,
bAddressState,
bAddressZip,
bAddressAcountry,
bName,
fName,
lName,
sAddressStreet,
sAddressCity,
sAddressState,
sAddressZip,
sAddressAcountry,
bAddress,
sAddress,
attention,
email,
phone,
altPhone,
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
spMinusTax,
grossProfit,
businessName,
orderStatus,
vin,
partNo,
last4digits,
notes,
orderHistory,
expediteShipping,
dsCall,
programmingRequired,
programmingCostQuoted
});
newOrder.orderDate = moment().tz('America/Chicago').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
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

newOrder.orderHistory.push(
    `Order placed  by ${firstName} on ${formattedDateTime}`
    );
await newOrder.save();

// Generate an invoice for the new order
var orderId = newOrder.orderNo;
// console.log("orderNo", orderId);
// await generateInvoice(orderId, newOrder);

res.status(201).json({ newOrder, team: newOrder.team });
} catch (error) {
if (error.code === 11000) { // Duplicate key error in MongoDB
console.error("Duplicate orderNo:", error.keyValue.orderNo);
return res.status(409).json({ message: "Order No. already exists. Please enter a unique Order No." });
}
console.error("Error in invoice creation:", error);
res.status(500).json({ message: "Error creating order", error: error.message });
}
});
// order-specific images
app.get("/getImages", async (req, res) => {
  const orderNo = req.query.orderNo;
  console.log("orderImage",orderNo);
  if (!orderNo) {
    return res.status(400).send("Order No is required.");
  }

  try {
    const order = await Order.findOne({ orderNo: orderNo });

    if (!order) {
      return res.status(404).send("Order not found.");
    }
console.log("image array",order.images);
    res.status(200).json(order.images);  
  } catch (error) {
    console.error("Error fetching order images:", error);
    res.status(500).send("Error retrieving images.");
  }
});
// Add a new bill and update the bill number
app.post("/bills", async (req, res) => {
console.log("Adding a new bill");
var firstName = req.query.firstName;
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
try {
console.log("Create a new bill:", req.body);
const {
billNo,
billDate,
billAgent,
fName,
lName,
bAddressStreet,
bAddressCity,
bAddressState,
bAddressZip,
bAddressAcountry,
bName,
sAddressStreet,
sAddressCity,
sAddressState,
sAddressZip,
sAddressAcountry,
bAddress,
sAddress,
attention,
email,
phone,
altPhone,
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
spMinusTax,
grossProfit,
businessName,
billStatus,
vin,
partNo,
last4digits,
notes,
expediteShipping,
dsCall,
programmingRequired,
programmingCostQuoted,
qty
} = req.body;

const newBill = new Bill({
billNo,
billDate,
billAgent,
bAddressStreet,
bAddressCity,
bAddressState,
bAddressZip,
bAddressAcountry,
bName,
fName,
lName,
sAddressStreet,
sAddressCity,
sAddressState,
sAddressZip,
sAddressAcountry,
bAddress,
sAddress,
attention,
email,
phone,
altPhone,
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
spMinusTax,
grossProfit,
businessName,
billStatus,
vin,
partNo,
last4digits,
notes,
expediteShipping,
dsCall,
programmingRequired,
programmingCostQuoted,
qty,
});
await newBill.save();
res.status(201).json({ newBill });
} catch (error) {
if (error.code === 11000) { // Duplicate key error in MongoDB
console.error("Duplicate billNo:", error.keyValue.billNo);
return res.status(409).json({ message: "BIll No. already exists. Please enter a unique Bill No." });
}
console.error("Error in invoice creation:", error);
res.status(500).json({ message: "Error creating order", error: error.message });
}
});

// Create User Endpoint
app.post("/users", async (req, res) => {
try {
const { firstName, lastName, email, team, role, password } = req.body;
// console.log("Received data:", req.body);

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
const additionalInfoSchema = new mongoose.Schema({
yardName: String,
agentName: String,
yardRating:String,
phone: String,
altNo: String,
ext: Number,
email: String,
city: String,
state: String,
street: String,
zipcode: String,
expShipDate: String,
address: String,
country:String,
partPrice: Number,
shippingDetails: String,
others: String,
status: String,
paymentStatus: String,
cardChargedDate: String,
refundStatus:String,
refundedAmount: Number,
storeCredit: Number,
storeCreditUsedFor: [
  {
    orderNo: String,  // The order from which the credit is being used
    amount: Number,    // The amount of credit being used
  },
],
refundedDate:String,
collectRefundCheckbox: String,
upsClaimCheckbox: String,
storeCreditCheckbox: String,
refundToCollect: Number,
refundReason: String,
trackingNo: [String],
faxNo: String,
eta: String,
shipperName: String,
trackingLink:String,
escalationCause: String,
escalationProcess: String,
notes: [String],
poSentDate: String,
escalationDate: String,
labelCreationDate: [String],
partShippedDate: String,
poCancelledDate: String,
deliveredDate: String,
escTicked:String,
partDeliveredDate:String,
stockNo: String,
warranty: Number,
// for replacement__part from customer
custReason: String,
customerShippingMethodReplacement: String,
customerShipperReplacement: String,
customerTrackingNumberReplacement: String,
customerETAReplacement: String,
custOwnShipReplacement: String,
inTransitpartCustDate: String,
custreplacementDelivery: String,
repPartCustDeliveredDate: String,
// part from yard
yardShippingStatus: String,
yardShippingMethod: String,
yardShipper: String,
yardTrackingNumber: String,
yardOwnShipping: String,
yardTrackingETA: String,
yardTrackingLink: String,
inTransitpartYardDate: String,
yardDeliveredDate: String,
// yardDeliveryStatus: String,
// return__part from customer
customerShippingMethodReturn: String,
custretPartETA: String,
customerShipperReturn: String,
custOwnShippingReturn: String,
returnTrackingCust: String,
custReturnDelivery: String,
inTransitReturnDate:String,
returnDeliveredDate: String,
// reimburesement part
reimbursementAmount: String,
isReimbursedChecked: String,
custShipToRet: String,
custShipToRep: String,
// for voiding labels
trackingHistory: [String],
etaHistory:  [String],
shipperNameHistory: [String],
trackingLinkHistory: [String],
// saving dates for bol in escalation
escRetTrackingDate: String,
escRepCustTrackingDate: String,
escRepYardTrackingDate: String,
// for voiding labels in esc popup(return)
escReturnTrackingHistory: [String],
escReturnETAHistory: [String],
escReturnShipperNameHistory: [String],
escReturnBOLhistory: [String],
// rep in esc
escRepTrackingHistoryCust: [String],
escRepETAHistoryCust: [String],
escRepShipperNameHistoryCust: [String],
escrepBOLhistoryCust: [String],
escRepTrackingHistoryYard: [String],
escRepETAHistoryYard: [String],
escRepShipperNameHistoryYard: [String],
escrepBOLhistoryYard: [String],
refundReason: String,
},
{strict:false}
);
const Yard = mongoose.model('Yard', additionalInfoSchema);
// Cancelled Orders Schema
const BillSchema = new mongoose.Schema({
billNo: String,
billDate: String,
billAgent: String,
fName: String,
lName: String,
bAddressStreet: String,
bAddressCity: String,
bAddressState: String,
bAddressZip: String,
bAddressAcountry: String,
sAddressStreet: String,
sAddressCity: String,
sAddressState: String,
sAddressZip: String,
sAddressAcountry: String,
bName: String,
businessName: String,
email: String,
phone: String,
altPhone: String,
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
billStatus: String,
vin: String,
partNo: String,
last4digits: String,
trackingInfo: String,
notes: [String],
isCancelled: { type: Boolean, default: false },
actualGP:Number,
dsCall: String,
programmingRequired: String,
programmingCostQuoted: String,
expediteShipping: String,
qty: Number,
});

const Bill = mongoose.model("Bill", BillSchema);
const taskSchema = new mongoose.Schema({
  orderNo: { type: String, required: true },
  tasks: [
    {
      taskName: { type: String, required: true },
      assignedTo: { type: String, required: true },
      assignedBy: { type: String, required: true },
      taskCreatedDate: { type: String, required: true },
      deadline: { type: String, required: true },
      taskDescription: { type: String, required: true },
      taskStatus: { type: String, required: true },
      taskCompletionTime: { type: String },
      warningCounts: { type: Number, default: 0 },
      alertCounts: { type: Number, default: 0 },
      incompleteCountAfterDeadline: { type: Number, default: 0 },
      completeCountBeforeDeadline: { type: Number, default: 0 },
      processingCountAfterDeadline: { type: Number, default: 0 },
    },
  ],
  previousTaskCount: { type: Number, default: 0 },
});

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: String },
  readBy: [{ type: String }], // Array of user IDs who have read the notification,
});

const RecentNotification = mongoose.model('RecentNotification', notificationSchema);


const TaskGroup = mongoose.model("TaskGroup", taskSchema);
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});
// partName schema
const partSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
      unique: true,
      trim: true
  }
});
const Part = mongoose.model("PartName", partSchema);
const OrderSchema = new mongoose.Schema({
orderNo: { type: String, unique: true },
orderDate: { type: Date, required: true },
fName: String,
lName: String,
salesAgent: String,
customerName: String,
customerApprovedDate: String,
bAddressStreet: String,
bAddressCity: String,
bAddressState: String,
bAddressZip: String,
bAddressAcountry: String,
bName: String,
sAddressStreet: String,
sAddressCity: String,
sAddressState: String,
sAddressZip: String,
sAddressAcountry: String,
bAddress: String,
sAddress: String,
attention: String,
email: String,
phone: String,
altPhone: String,
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
spMinusTax: String,
grossProfit: Number,
businessName:String,
orderStatus: String,
vin: String,
partNo: String,
last4digits: String,
additionalInfo: [additionalInfoSchema],
trackingInfo: String,
orderHistory: [String],
notes: [String],
isCancelled: { type: Boolean, default: false },
teamOrder:String,
actualGP:Number,
supportNotes:[String],
disputedDate: Date ,  
disputeReason: String,
custRefAmount: String,
custRefundDate: Date,
custRefundedAmount: Number,
cancelledDate: Date,
mainOrderDeliveredDate: String,
cancelledRefAmount: Number,
cancellationReason:String,
expediteShipping: String, 
dsCall: String,
programmingRequired: String,
programmingCostQuoted: String,
images: [imageSchema],
});

const Order = mongoose.model("Order", OrderSchema);
const LockedAgentSchema = new mongoose.Schema({
  salesAgent: { type: String, required: true },
  lockedActualGp: { type: Number, required: true }
});

const MonthlyLockedGPSchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  lockedAgents: [LockedAgentSchema],
  updatedAt: { type: Date, default: Date.now }
});

const MonthlyLockedGP = mongoose.model('MonthlyLockedGP', MonthlyLockedGPSchema);
app.get("/orders", async (req, res) => {
const orders = await Order.find({});
console.log("Fetching all orders");
res.json(orders);
});
app.post('/lockedGP', async (req, res) => {
  console.log("//lockedGP");
  try {
    const { salesAgent, month, year, lockedActualGp } = req.body;
    console.log(salesAgent, month, year, lockedActualGp);
    if (!salesAgent || !month || !year || lockedActualGp == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doc = await MonthlyLockedGP.findOne({ month, year });

    if (doc) {
      const existingAgent = doc.lockedAgents.find(agent => agent.salesAgent === salesAgent);

      if (existingAgent) {
        existingAgent.lockedActualGp = lockedActualGp;
      } else {
        doc.lockedAgents.push({ salesAgent, lockedActualGp });
      }

      doc.updatedAt = new Date();
      await doc.save();
      res.json({ message: 'Locked GP updated', data: doc });
    } else {
      const newDoc = new MonthlyLockedGP({
        month,
        year,
        lockedAgents: [{ salesAgent, lockedActualGp }]
      });
      await newDoc.save();
      res.json({ message: 'Locked GP saved for new month', data: newDoc });
    }

  } catch (err) {
    console.error('Error saving locked GP:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/getLockedGP', async (req, res) => {
  console.log("//getLockedGP");
  const { month, year } = req.query;
  console.log(month, year);
  try {
    const doc = await MonthlyLockedGP.findOne({ month, year });

    if (!doc || !doc.lockedAgents) {
      return res.status(200).json([]); 
    }

    return res.json(doc.lockedAgents); 
  } catch (error) {
    console.error("Error fetching locked GP:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// Search Orders API
app.get("/searchOrders", async (req, res) => {
  console.log("SearchPrdfer")
  try {
    const query = req.query.query || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
console.log("query",query,page,limit);
    // MongoDB $or clause to search across multiple fields
    const searchCriteria = query
      ? {
          $or: [
            { orderNo: { $regex: query, $options: "i" } },
            { fName: { $regex: query, $options: "i" } },
            { lName: { $regex: query, $options: "i" } },
            { salesAgent: { $regex: query, $options: "i" } },
            { customerName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { phone: { $regex: query, $options: "i" } },
            { make: { $regex: query, $options: "i" } },
            { model: { $regex: query, $options: "i" } },
            { bAddressStreet: { $regex: query, $options: "i" } },
            { sAddressStreet: { $regex: query, $options: "i" } },
            { "additionalInfo.yardName": { $regex: query, $options: "i" } }, // Searching inside additionalInfo array
            { orderStatus: { $regex: query, $options: "i" } },
            { trackingInfo: { $regex: query, $options: "i" } },
            { notes: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Query the database with search criteria, pagination, and sorting
    const orders = await Order.find(searchCriteria)
      .skip(skip)
      .limit(limit)
      .sort({ orderDate: -1 }); // Sort by order date in descending order

    // Get the total count for pagination
    const totalOrders = await Order.countDocuments(searchCriteria);

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).send("An error occurred while searching orders.");
  }
});
// Save a new part
app.get("/getParts", async (req, res) => {
  console.log("getting new parts");
  try {
      const parts = await Part.find().sort({ name: 1 }); 
      console.log("parts",parts)
      res.json(parts);
  } catch (error) {
      res.status(500).json({ error: "Server error while fetching parts" });
  }
});
// orders per page fpr server side pagination
app.get('/ordersPerPage', async (req, res) => {
  console.log("ordersPerPage")
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const searchTerm = req.query.searchTerm?.toLowerCase() || '';

    const query = {};

    if (searchTerm) {
      query.$or = [
        { orderNo: { $regex: searchTerm, $options: "i" } },
        { customerName: { $regex: searchTerm, $options: "i" } },
        { salesAgent: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { make: { $regex: searchTerm, $options: "i" } },
        { model: { $regex: searchTerm, $options: "i" } },
        { additionalInfo: { $elemMatch: { yardName: { $regex: searchTerm, $options: "i" } } } },
        { additionalInfo: { $elemMatch: { trackingNo: { $regex: searchTerm, $options: "i" } } } }
      ];      
    }

    const totalCount = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ orderDate: -1 }); 

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ orders, totalPages });
  } catch (err) {
    console.error("Error fetching paginated orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function getDateRange({ start, end, month, year }) {
  const tz = "America/Chicago";

  if (start && end) {
    const startDate = moment.tz(start, tz).startOf("day").utc().toDate();
    const endDate = moment.tz(end, tz).endOf("day").utc().toDate();
    return { startDate, endDate };
  } 
  
  else if (month && year) {
    // Normalize month input (e.g., "Jul" or "07")
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    let paddedMonth;
    if (month.length === 3 && monthMap[month]) {
      paddedMonth = monthMap[month];
    } else if (!isNaN(month)) {
      paddedMonth = month.padStart(2, "0");
    } else {
      throw new Error("Invalid month format");
    }

    const startDate = moment.tz(`${year}-${paddedMonth}-01`, tz).startOf("month").utc().toDate();
    const endDate = moment.tz(`${year}-${paddedMonth}-01`, tz).endOf("month").utc().toDate();

    return { startDate, endDate };
  } 
  
  else {
    throw new Error("Provide either start/end or month/year");
  }
}
// for only placed orders
app.get('/orders/placed', async (req, res) => {
  try {
    const { month, year, start, end } = req.query;
    let filter = { orderStatus: "Placed" };
    console.log("Incoming Query Params:", { month, year, start, end });
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setDate(endDate.getDate() + 1); 

      console.log("Parsed Start Date (ISO):", startDate.toISOString());
      console.log("Parsed End Date (+1 day, ISO):", endDate.toISOString());

      filter.orderDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Fallback to month/year logic
    else if (month && year) {
      const monthMap = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };
      let paddedMonth;
      // Handle both 'Jul' and '07' gracefully
      if (month.length === 3 && monthMap[month]) {
        paddedMonth = monthMap[month]; 
      } else if (!isNaN(month)) {
        paddedMonth = month.padStart(2, '0'); 
      } else {
        return res.status(400).json({ message: "Invalid month format" });
      }
      console.log("month",paddedMonth);
      const startDate = new Date(`${year}-${paddedMonth}-01T00:00:00-06:00`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      console.log("Parsed Start Date (Month-based):", startDate.toISOString());
      console.log("Parsed End Date (Month-based):", endDate.toISOString());

      filter.orderDate = {
        $gte: startDate,
        $lt: endDate
      };
    }
    else {
      console.warn("⚠️ Invalid query: must provide either month/year or start/end");
      return res.status(400).json({ message: "Provide either month/year or start/end" });
    }

    console.log("MongoDB Filter:", JSON.stringify(filter, null, 2));

    const orders = await Order.find(filter);
    console.log(`Orders fetched: ${orders.length}`);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching placed orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// for only store credits
app.get('/orders/storeCredits', async (req, res) => {
  try {
console.log("store credits");
const orders = await Order.find({
  "additionalInfo.storeCredit": { $exists: true, $gt: 0 } // Checks if storeCredit is greater than 0
});


    res.json(orders);
  } catch (error) {
    console.error("Error fetching placed orders for specified month and year:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
// Endpoint to update store credit for a specific order
app.patch('/orders/:orderNo/storeCredits', async (req, res) => {
  const { orderNo } = req.params;
  const { usageType, amountUsed } = req.body;
console.log("orderNo for which storeCredit value should be updated",orderNo,"orderNoUsedFor",req.body.orderNoUsedFor);
  try {
    // Find the order and update the store credit and add to storeCreditUsedFor
    const updatedOrder = await Order.findOneAndUpdate(
      { "additionalInfo.storeCredit": { $gt: 0 }, "orderNo": orderNo },  // Find the order where storeCredit > 0
      {
        $push: {  // Push to storeCreditUsedFor
          "additionalInfo.$.storeCreditUsedFor": {
            orderNo: req.body.orderNoUsedFor,  // This is the orderNo from which the credit is being used
            amount: amountUsed,
          },
        },
        $inc: {  // Decrement the store credit by the used amount
          "additionalInfo.$.storeCredit": -amountUsed,
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found or no store credit left!" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating store credit:", error);
    res.status(500).json({ message: "Error updating store credit", error });
  }
});

// for customerApproved
app.get("/orders/customerApproved", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
      orderStatus: "Customer approved"
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching customerApproved orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// for yardProcessing
app.get("/orders/yardProcessing", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
      orderStatus: "Yard Processing"
    }).sort({ orderDate: 1 });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching yardProcessing orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// for in Transit
app.get("/orders/inTransit", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
      orderStatus: "In Transit"
    }).sort({ orderDate: 1 });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching inTransit orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// for fulfilled
app.get("/orders/fulfilled", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
      orderStatus: "Order Fulfilled"
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching fulfilled orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// for orders which were in escalation atleast once
app.get("/orders/escalated", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
      additionalInfo: { $elemMatch: { escTicked: "Yes" } }
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching escalated orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// for ongoing escalation with escTicked(yes) and orderStatus to be either in Customer Aproved,Yard Processing,In Transit or Escalation
app.get("/orders/ongoing-escalations", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    const validStatuses = ["Customer approved", "Yard Processing", "In Transit", "Escalation"];
    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
      orderStatus: { $in: validStatuses },
      additionalInfo: { $elemMatch: { escTicked: "Yes" } }
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching ongoing escalations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// for salespersonWise data
app.get("/orders/salesPersonWise", async (req, res) => {
  try {
    const { start, end, month, year, firstName: salesAgent } = req.query;
    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const query = {
      orderDate: { $gte: startDate, $lt: endDate },
      salesAgent,
    };

    const orders = await Order.find(query).lean();
    console.log("salesperson orders",orders);
    const totalCount = orders.length;

    res.json({
      totalCount,
      orders,
    });
  } catch (error) {
    console.error("Error fetching salesPersonOrders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
app.get("/orders/monthly", async (req, res) => {
  try {
    const { start, end, month, year, page = 1, limit = 25, filterBy, salesAgent } = req.query;
    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const query = {
      orderDate: { $gte: startDate, $lt: endDate },
    };

    if (filterBy === "collectRefund") {
      query["additionalInfo.collectRefundCheckbox"] = "Ticked";
    }

    if (salesAgent) {
      query.salesAgent = salesAgent;
    }

    const totalCount = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      orders,
    });
  } catch (err) {
    console.error("Error fetching monthly orders:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});
// for cancelled
app.get("/orders/cancelled", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    console.log("Cancelled orders query:", { start, end, month, year });

    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lt: endDate
      },
      orderStatus: "Order Cancelled",
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching cancelled orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
app.get("/orders/cancelled-by-date", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    console.log("Incoming Query Params (cancelled):", { start, end, month, year });

    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      cancelledDate: {
        $gte: startDate,
        $lt: endDate
      }
    });

    console.log(`Cancelled orders fetched: ${orders.length}`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching cancelled-by-date orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
app.get("/orders/refunded-by-date", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    console.log("Incoming Query Params (refunded):", { start, end, month, year });

    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      custRefundDate: {
        $gte: startDate,
        $lt: endDate
      }
    });

    console.log(`Refunded orders fetched: ${orders.length}`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching refunded-by-date orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/orders/disputes-by-date", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    console.log("Incoming Query Params (disputes):", { start, end, month, year });

    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      disputedDate: {
        $gte: startDate,
        $lt: endDate
      }
    });

    console.log(`Disputed orders fetched: ${orders.length}`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching disputed-by-date orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/migrate-dates", async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { cancelledDate: { $type: "string" } },
        { custRefundDate: { $type: "string" } }
      ]
    });

    let updatedCount = 0;

    for (const order of orders) {
      let updated = false;

      // Clean and convert
      if (typeof order.cancelledDate === "string") {
        const date = new Date(order.cancelledDate.replace(/(\d+)(st|nd|rd|th)/, "$1"));
        if (!isNaN(date)) {
          order.cancelledDate = date;
          updated = true;
        }
      }

      if (typeof order.custRefundDate === "string") {
        const date = new Date(order.custRefundDate.replace(/(\d+)(st|nd|rd|th)/, "$1"));
        if (!isNaN(date)) {
          order.custRefundDate = date;
          updated = true;
        }
      }

      if (updated) {
        await order.save();
        updatedCount++;
      }
    }

    res.send(`✅ Migration complete. Updated ${updatedCount} orders.`);
  } catch (error) {
    console.error("Migration failed:", error);
    res.status(500).send("❌ Migration failed.");
  }
});

// for disputes
app.get("/orders/disputes", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    console.log("Dispute orders query:", { start, end, month, year });

    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lt: endDate
      },
      orderStatus: "Dispute",
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching disputed orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// for refunded
app.get("/orders/refunded", async (req, res) => {
  try {
    const { start, end, month, year } = req.query;
    console.log("Refunded orders query:", { start, end, month, year });

    const { startDate, endDate } = getDateRange({ start, end, month, year });

    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lt: endDate
      },
      orderStatus: "Refunded",
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching refunded orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// monthly orders

// db.orders.createIndex({ cancelledDate: 1 })
// db.orders.createIndex({ custRefundDate: 1 })

// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', async function () {
//   console.log('Connected to MongoDB');
// try {
//    db.collection('orders').createIndex({ orderDate: 1 });
//   console.log('Index created successfully');
// } catch (error) {
//   console.error('Error creating index:', error);
// } finally {
//   mongoose.connection.close();  
// }
// });




app.get("/orders/:orderNo", async (req, res) => {
const order = await Order.findOne({ orderNo: req.params.orderNo });
res.json(order);
});
app.get("/bills/:billNo", async (req, res) => {
try {
console.log("billNo:", req.params.billNo);
const bill = await Bill.findOne({ billNo: req.params.billNo });
if (bill) {
res.json(bill); 
} else {
res.status(404).json({ error: "Bill not found" }); 
}
} catch (error) {
console.error("Error fetching bill:", error);
res.status(500).json({ error: "Internal Server Error" }); 
}
});
app.get("/fetchTasks", async (req, res) => {
  const orderNo  = req.query.orderNo;
  // console.log("taskGroup:", orderNo);
  try {
    const taskGroup = await TaskGroup.findOne({ orderNo });
    if (!taskGroup) {
      return res.status(404).json({ message: 'No tasks found for the given orderNo.' });
    }
    res.status(200).json(taskGroup.tasks);
  } catch (error) {
    console.error('Error fetching tasks by orderNo:', error);
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});
// updating taskStatus and assignTo status
app.put('/updateTaskStatus', async (req, res) => {
  const { orderNo, index, taskStatus } = req.body;
// console.log("updateTaskStatus",orderNo,index,taskStatus)
  try {
    const taskGroup = await TaskGroup.findOne({ orderNo });
    if (!taskGroup) {
      return res.status(404).json({ message: "Order not found." });
    }

    taskGroup.tasks[index].taskStatus = taskStatus;
    await taskGroup.save();
    res.status(200).json({ message: "Task status updated successfully." });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Failed to update task status." });
  }
});
app.put('/updateTaskAssignedTo', async (req, res) => {
  const { orderNo, index, assignedTo } = req.body;
  // console.log("updateTaskAssignedTo",orderNo,index,assignedTo)
  try {
    const taskGroup = await TaskGroup.findOne({ orderNo });
    if (!taskGroup) {
      return res.status(404).json({ message: "Order not found." });
    }

    taskGroup.tasks[index].assignedTo = assignedTo;
    await taskGroup.save();
    res.status(200).json({ message: "Task assignedTo updated successfully." });
  } catch (error) {
    console.error("Error updating assignedTo:", error);
    res.status(500).json({ message: "Failed to update assignedTo." });
  }
});
// total tasks for the current user for the current month
app.get('/totalTasks', async (req, res) => {
  try {
    const { firstName } = req.query; 
    if (!firstName) {
      return res.status(400).json({ error: 'First name is required' });
    }
    const currentDate = moment.tz('America/Chicago'); 
    const currentMonth = currentDate.month(); 
    const currentYear = currentDate.year(); 
    let totalTasks = 0;
    const taskGroups = await TaskGroup.find();
    // console.log("taskGroups",taskGroups,firstName);
    taskGroups.forEach((group) => {
      group.tasks.forEach((task) => {
        const cleanedDateString = task.taskCreatedDate.replace(/(\d+)(st|nd|rd|th)/, '$1');
        const taskCreatedDate = moment.tz(cleanedDateString, 'D MMM, YYYY HH:mm', 'America/Chicago');      
        if (
          task.assignedTo === firstName &&
          taskCreatedDate.isValid() && 
          taskCreatedDate.month() === currentMonth &&
          taskCreatedDate.year() === currentYear
        ) {
          totalTasks++;
          // console.log("totalTasks",totalTasks);
        }
      });
    });

    res.status(200).json({ totalTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// all tasks fetch which are not yet Completed
app.get("/alltasks", async (req, res) => {
  console.log("fetching tasks which are not yet completed");
  try {
    const taskGroups = await TaskGroup.find();
    const filteredTaskGroups = taskGroups.map((group) => ({
      orderNo: group.orderNo,
      tasks: group.tasks.filter((task) => task.status !== "Completed"),
    })).filter(group => group.tasks.length > 0); 
    // console.log("filteredTaskGroups",filteredTaskGroups);
    res.status(200).json(filteredTaskGroups);
  } catch (error) {
    console.error("Error fetching task groups:", error);
    res.status(500).json({ error: "Failed to fetch task groups" });
  }
});
// // checking taskGroup collection to change the taskStatus once in every minute
async function updateTaskStatuses() {
  try {
    const currentDallasTime = moment.tz("America/Chicago").format("YYYY-MM-DDTHH:mm:ss");
    // console.log("Current Dallas Time:", currentDallasTime);

    const taskGroups = await TaskGroup.find({
      "tasks.deadline": { $exists: true },
    });

    const processedTasks = new Set(); // Track processed tasks
    let notifications = [];

    // Helper function to format taskCreatedDate
    const formatTaskCreatedDate = (taskCreatedDate) => {
      return taskCreatedDate
        .replace(/(\d+)(st|nd|rd|th)/, '$1') // Remove ordinal suffix
        .replace(/Jan/, '01') // Replace month names with numbers
        .replace(/Feb/, '02')
        .replace(/Mar/, '03')
        .replace(/Apr/, '04')
        .replace(/May/, '05')
        .replace(/Jun/, '06')
        .replace(/Jul/, '07')
        .replace(/Aug/, '08')
        .replace(/Sep/, '09')
        .replace(/Oct/, '10')
        .replace(/Nov/, '11')
        .replace(/Dec/, '12');
    };

    for (const taskGroup of taskGroups) {
      let isUpdated = false;
      const currentTaskCount = taskGroup.tasks.length;
      // console.log("Current Task Count:", currentTaskCount, "Task Group:", taskGroup);

      // Handle newly added tasks
      if (currentTaskCount > (taskGroup.previousTaskCount || 0)) {
        const newTasks = taskGroup.tasks.slice(taskGroup.previousTaskCount || 0);
        newTasks.forEach((task) => {
          if (!processedTasks.has(task._id.toString())) { // Check if task is already processed
            notifications.push({
              taskId: task._id,
              message: `New Task added: ${taskGroup.orderNo} - \n${task.taskDescription}\nAssigned to: ${task.assignedTo}\n${currentDallasTime}`,
            });
            processedTasks.add(task._id.toString()); // Mark task as processed
          }
        });
        taskGroup.previousTaskCount = currentTaskCount;
        isUpdated = true;
      }

      // Process each task in the group
      taskGroup.tasks.forEach((task) => {
        if (processedTasks.has(task._id.toString())) {
          return; // Skip already processed tasks
        }

        const formattedTaskCreatedDate = formatTaskCreatedDate(task.taskCreatedDate);
        const createdTime = moment.tz(formattedTaskCreatedDate, "DD MM, YYYY HH:mm", "America/Chicago");
        const taskDeadline = moment.tz(task.deadline, "YYYY-MM-DDTHH:mm", "America/Chicago");
        const formattedDeadline = taskDeadline.format("YYYY-MM-DDTHH:mm:ss");
        // console.log("Task Status:", task.taskStatus);
        // console.log("Task Deadline:", formattedDeadline, "current", currentDallasTime);

        // Handle completed tasks
        if (task.taskStatus === "Completed" && !task.taskCompletionTime) {
          task.taskCompletionTime = currentDallasTime;
          isUpdated = true;

          if (!processedTasks.has(task._id.toString())) { // Check if task is already processed
            notifications.push({
              taskId: task._id,
              message: `Task Completed: ${taskGroup.orderNo} - \n${task.taskDescription}\nAssigned to: ${task.assignedTo}\n${currentDallasTime}`,
            });
            processedTasks.add(task._id.toString()); // Mark task as processed
          }

          if (moment(currentDallasTime).isBefore(formattedDeadline)) {
            task.completeCountBeforeDeadline = (task.completeCountBeforeDeadline || 0) + 1;
          }
        }

        // Handle "New task added" -> "Processing" after 5 minutes
        if (task.taskStatus === "New task added") {
          if (moment(currentDallasTime).diff(createdTime.format("YYYY-MM-DDTHH:mm:ss"), "minutes") >= 5) {
            task.taskStatus = "Processing";
            isUpdated = true;

            if (!processedTasks.has(task._id.toString())) { // Check if task is already processed
              notifications.push({
                taskId: task._id,
                message: `Task status changed to Processing: ${taskGroup.orderNo} - \n${task.taskDescription}\nAssigned to: ${task.assignedTo}`,
              });
              processedTasks.add(task._id.toString()); // Mark task as processed
            }
          }
        }

        // Handle tasks that are not completed
        if (task.taskStatus !== "Completed" && formattedDeadline) {
          const date1 = new Date(currentDallasTime);
          const date2 = new Date(formattedDeadline);
          const differenceInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
          const diffInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

          console.log("diffInMinutes", diffInMinutes);

          if (task.taskStatus === "Processing") {
            if (diffInMinutes <= 120 && diffInMinutes > 0 && task.taskStatus !== "Alert") {
              task.taskStatus = "Alert";
              isUpdated = true;
              if (!processedTasks.has(task._id.toString())) {
                notifications.push({
                  taskId: task._id,
                  message: `Alert (Deadline Approaching): ${taskGroup.orderNo} - \n${task.taskDescription}\nAssigned to: ${task.assignedTo}\n${currentDallasTime}`,
                });
                processedTasks.add(task._id.toString());
                task.alertCounts = (task.alertCounts || 0) + 1;
              }
            }
          } else if (task.taskStatus === "Alert") {
            if (diffInMinutes >= 0 && task.taskStatus !== "Warning") {
              task.taskStatus = "Warning";
              isUpdated = true;
              if (!processedTasks.has(task._id.toString())) {
                notifications.push({
                  taskId: task._id,
                  message: `Warning (Deadline Exceeded): ${taskGroup.orderNo} - \n${task.taskDescription}\nAssigned to: ${task.assignedTo}\n${currentDallasTime}`,
                });
                processedTasks.add(task._id.toString());
                task.warningCounts = (task.warningCounts || 0) + 1;
              }
            }
          } else if (task.taskStatus === "Warning") {
            task.taskStatus = "Incomplete";
            isUpdated = true;
            task.warningCounts = (task.warningCounts || 0) + 1;

            if (!processedTasks.has(task._id.toString())) {
              notifications.push({
                taskId: task._id,
                message: `Task marked as Incomplete (Missed Deadline): ${taskGroup.orderNo} - \n${task.taskDescription}\nAssigned to: ${task.assignedTo}\n${currentDallasTime}`,
              });
              processedTasks.add(task._id.toString());
            }
          } else if (task.taskStatus === "Incomplete") {
            task.incompleteCountAfterDeadline = (task.incompleteCountAfterDeadline || 0) + 1;
          }
        }
      });

      // Save the task group if updates were made
      if (isUpdated) {
        await taskGroup.save();
      }
    }

    // Create notifications for unique tasks
    for (const notification of notifications) {
      // console.log("Recent Notification:", notification);
      await RecentNotification.create({ message: notification.message });
    }

    console.log("Notifications on updateTaskStatuses:", notifications);
    return notifications;
  } catch (error) {
    console.error("Error updating task statuses:", error);
  }
}
console.log("Setting up interval...");
const interval = setInterval(async () => {
  console.log("Interval triggered. Running updateTaskStatuses...");
  try {
    await updateTaskStatuses();
    console.log("interval ran.");
  } catch (error) {
    console.error("Error updating task statuses:", error);
  }
}, 5 * 60 * 1000);
console.log("Interval set up successfully."); // 5 minutes in milliseconds
// app.get("/notifications", async (req, res) => {
//   console.log("notifications")
//   try {
// const notifications = await updateTaskStatuses(); 
//     console.log("notis",notifications);
//     res.json({ success: true, notifications });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ success: false, error: "Failed to fetch notifications." });
//   }
// });

app.get("/tasks-summary", async (req, res) => {
  try {
    const { firstName } = req.query;
    const taskGroups = await TaskGroup.find({
      "tasks.assignedTo": firstName,
    });
    const summary = {
      completedOnTime: [],
      alert: [],
      completedLate: [],
      warning: [],
      notCompleted: [],
      incomplete: [],
      processingPastDeadline: [],
    };

    taskGroups.forEach((taskGroup) => {
      taskGroup.tasks.forEach((task) => {
        const deadline = moment.tz(task.deadline, "America/Chicago").toDate();
        const completionTime = task.taskCompletionTime
          ? moment.tz(task.taskCompletionTime, "America/Chicago").toDate()
          : null;

        if (task.assignedTo === firstName) {
          if (task.taskStatus === "Completed" && completionTime) {
            if (completionTime <= deadline) {
              summary.completedOnTime.push(task);
            } else {
              summary.completedLate.push(task);
            }
          } else if (task.taskStatus === "Alert") {
            summary.alert.push(task);
          } else if (task.taskStatus === "Warning") {
            summary.warning.push(task);
          } else if (task.taskStatus === "Incomplete") {
            summary.incomplete.push(task);
          } else if (task.taskStatus === "Processing" && moment().isAfter(deadline)) {
            summary.processingPastDeadline.push(task);
          } else {
            summary.notCompleted.push(task);
          }
        }
      });
    });

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching task summary:", error);
    res.status(500).json({ error: "Failed to fetch task summary" });
  }
});

// API to fetch recent notifications
app.get("/notifications", async (req, res) => {
  // console.log("notifications")
const notifications = await updateTaskStatuses(); 
    // console.log("notis",notifications);
  const userId  = req.query.userId;
  // console.log("userrrr",userId);
  try {
    const notificationss = await RecentNotification.find({})
    // Marking notifications as unread for this user if they are not in the readBy array
    const userSpecificNotifications = notificationss.map((notification) => ({
      ...notification._doc,
      isRead: notification.readBy.includes(userId),
    }));
    // console.log("userSpecificNotifications",userSpecificNotifications);
    res.status(200).json(userSpecificNotifications);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching notifications' });
  }
});
app.post('/mark-notifications-read', async (req, res) => {
  const userId  = req.query.firstName;
  // console.log("to see readBy",userId);
  try {
    await RecentNotification.updateMany(
      { readBy: { $ne: userId } }, 
      { $addToSet: { readBy: userId } } 
    );

    res.status(200).send({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).send({ error: 'Error marking notifications as read' });
  }
});
app.get('/unread-notifications-count', async (req, res) => {
  const { firstName, role } = req.query;

  try {
    let query = { readBy: { $ne: firstName } }; // Notifications not read by the user

    if (role !== 'Admin') {
      // For non-Admin, filter notifications that include the user's firstName in the message
      query.message = { $regex: firstName, $options: 'i' }; // Case-insensitive search
    }

    const unreadCount = await RecentNotification.countDocuments(query);
    res.status(200).json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    res.status(500).send({ error: 'Error fetching unread notifications count' });
  }
});

// changing order status
app.put("/orders/:orderNo", async (req, res) => {
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;

try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
if (!order) return res.status(404).send("Order not found");

const oldStatus = order.orderStatus;

// Preserve existing customerApprovedDate if not provided
if (req.body.customerApprovedDate) {
order.customerApprovedDate = req.body.customerApprovedDate;
}
// Update only the fields provided in the request
for (let key in req.body) {
if (key !== 'customerApprovedDate') {
order[key] = req.body[key];
}
}
1 
const firstName = req.query.firstName;
console.log("Logged in user:", firstName);

// Add timestamp to order history only if the status has changed
if (oldStatus !== order.orderStatus) {
order.orderHistory.push(
`Order status updated to ${order.orderStatus} by ${firstName} on ${formattedDateTime}`
);
}

const updatedOrder = await order.save();
res.json(updatedOrder);
} catch (err) {
res.status(400).send(err.message);
}
});

// changing the orderStatus and yrdStatus when reimbursement amount is added
app.put("/orderAndYardStatus/:orderNo", async (req, res) => {
const { orderStatus, yardStatus, yardIndex } = req.body;
const firstName = req.query.firstName;
console.log("changing order and yardStatus",orderStatus,yardStatus,yardIndex + 1,firstName);
// Get the current date and time in US Central Time
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
if (!order) return res.status(404).send("Order not found");
const oldStatus = order.orderStatus;
const oldYardStatus = order.additionalInfo[yardIndex + 1].status;
console.log("oldYarsStatus",oldYardStatus)
// Update the order status and yard status
order.orderStatus = orderStatus;
order.additionalInfo[yardIndex + 1].status = yardStatus;

// Add the change to the order history if the status has changed
if (oldStatus !== orderStatus || oldYardStatus !== yardStatus) {
order.orderHistory.push(
`Order status updated to ${orderStatus}, Yard status updated to ${yardStatus} by ${firstName} on ${formattedDateTime}`
);
}

// Save the updated order
const updatedOrder = await order.save();
res.json(updatedOrder);
} catch (err) {
res.status(400).send(err.message);
}
});

app.put("/cancelledOrders/:orderNo", async (req, res) => {
console.log("Updating the order status for cancelled orders:", req.params.orderNo);

const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;

try {
const order = await CancelledOrder.findOne({ orderNo: req.params.orderNo });
if (!order) {
console.log("Cancelled order not found");
return res.status(404).send("Order not found");
}

const oldStatus = order.orderStatus;
console.log("Old status:", oldStatus);

// Preserve customerApprovedDate if not provided
if (req.body.customerApprovedDate) {
order.customerApprovedDate = req.body.customerApprovedDate;
}

// Update fields provided in the request
for (let key in req.body) {
if (key !== 'customerApprovedDate') {
order[key] = req.body[key];
}
}

const firstName = req.query.firstName;
console.log("Logged in user:", firstName);

// Add history entry if the status has changed
if (oldStatus !== order.orderStatus) {
const historyEntry = `Order status updated to ${order.orderStatus} by ${firstName} on ${formattedDateTime}`;
order.orderHistory.push(historyEntry);
console.log("Added to history:", historyEntry);
}

const updatedOrder = await order.save();
console.log("Order successfully updated:", updatedOrder);
res.json(updatedOrder);
} catch (err) {
console.error("Error updating order:", err);
res.status(400).send(err.message);
}
});


// changing order status till here
app.post('/orders/:orderNo/additionalInfo', async (req, res) => {
console.log("additionalInfo");
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:,mnbjklkjhbv', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
const firstName = req.query.firstname;
console.log("fName",firstName);
if (!order) return res.status(404).send('Order not found');

// Count the number of existing yards
const countYard = order.additionalInfo.length + 1;
console.log(countYard,"countyard")
console.log("body",req.body);


order.additionalInfo.push(req.body);
console.log("additional updated",order)
var pp = order.additionalInfo[countYard -1 ].partPrice;
var yardname = order.additionalInfo[countYard - 1].yardName;
var shipping = order.additionalInfo[countYard - 1].shippingDetails;
var others = order.additionalInfo[countYard - 1].others;

console.log("yard details",pp,yardname,shipping,others);
// Add timestamp to order history
const timestamp = new Date().toLocaleString();
order.orderHistory.push(`Yard ${countYard} Located Yard Name: ${yardname} PP: ${pp} Shipping: ${shipping} Others: ${others}   by ${firstName} on ${formattedDateTime}`);

await order.save();

res.json(order);
} catch (error) {
res.status(500).json({ message: 'Server error', error });
}
});
// for adding escalation status to orderHistory
app.post('/orders/:orderNo/additionalInfo', async (req, res) => {
console.log("additionalInfo");
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:,mnbjklkjhbv', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
const firstName = req.query.firstname;
console.log("fName",firstName);
if (!order) return res.status(404).send('Order not found');

// Count the number of existing yards
const countYard = order.additionalInfo.length + 1;
console.log(countYard,"countyard")
console.log("body",req.body);


order.additionalInfo.push(req.body);
console.log("additional updated",order)
var pp = order.additionalInfo[countYard -1 ].partPrice;
var yardname = order.additionalInfo[countYard - 1].yardName;
var shipping = order.additionalInfo[countYard - 1].shippingDetails;
var others = order.additionalInfo[countYard - 1].others;

console.log("yard details",pp,yardname,shipping,others);
// Add timestamp to order history
const timestamp = new Date().toLocaleString();
order.orderHistory.push(`Yard ${countYard} Located Yard Name: ${yardname} PP: ${pp} Shipping: ${shipping} Others: ${others}   by ${firstName} on ${formattedDateTime}`);

await order.save();

res.json(order);
} catch (error) {
res.status(500).json({ message: 'Server error', error });
}
});

//for updating yardStatus and all
app.put("/orders/:orderNo/additionalInfo/:yardIndex", async (req, res) => {
console.log("Updating yard statuses and dates");
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDateTime = `${day} ${month}, ${year} ${hours}:${minutes}`;
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
const yardIndex = parseInt(req.params.yardIndex, 10) - 1;
if (!order) return res.status(404).send("Order not found");
if (yardIndex >= 0 && yardIndex < order.additionalInfo.length) {
const yardInfo = order.additionalInfo[yardIndex];
const { updatedYardData, orderStatus ,mainOrderDeliveredDate} = req.body;
console.log("updatedYardData",updatedYardData);
Object.assign(yardInfo, updatedYardData);
order.additionalInfo[yardIndex] = yardInfo;
order.orderStatus = orderStatus;
order.mainOrderDeliveredDate = mainOrderDeliveredDate;
const firstName = req.query.firstName;
const status = updatedYardData.status || ""; 
const paymentStatus = req.body.paymentStatus || "";
const refundStatus = req.body.refundStatus || "";
order.orderHistory.push(`Yard ${yardIndex + 1} ${status || paymentStatus || refundStatus} updated by ${firstName} on ${formattedDateTime}`);
order.markModified("additionalInfo");
order.markModified("orderStatus");
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
// edit yard details
app.put("/orders/:orderNo/editYardDetails/:yardIndex", async (req, res) => {
    console.log("Updating editAdditionalInfo");
    const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
    const date = new Date(centralTime);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedDateTime = `${day} ${month}, ${year} ${hours}:${minutes}`;
  
    // Normalize function to convert values to string for comparison
    const normalizeValue = (value) => {
      if (typeof value === 'number') {
        return value.toString();
      } else if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      } else {
        return value || ''; // For null, undefined, or empty values
      }
    };
  
    try {
      const order = await Order.findOne({ orderNo: req.params.orderNo });
      const yardIndex = parseInt(req.params.yardIndex, 10) - 1;
  
      if (!order) return res.status(404).send("Order not found");
  
      if (yardIndex >= 0 && yardIndex < order.additionalInfo.length) {
        const yardInfo = order.additionalInfo[yardIndex];
        const updatedYardData = req.body; // Using req.body directly
  
        // To log which fields were updated
        let updateMessage = ``;
        const changes = [];
  
        // Loop through each field in updatedYardData and compare with the original yardInfo
        for (const key in updatedYardData) {
          if (updatedYardData.hasOwnProperty(key)) {
            const oldValue = normalizeValue(yardInfo[key]);
            const newValue = normalizeValue(updatedYardData[key]);
  
            // Only log the field if it has changed and is not empty (undefined or null)
            if (oldValue !== newValue) {
              if (oldValue === '' && newValue !== '') {
                // Case where old value was empty (undefined or null) and new value is set
                changes.push(`${key}: (was not set) -> ${newValue}`);
              } else if (newValue === '' && oldValue !== '') {
                // Case where old value was set and new value is removed
                changes.push(`${key}: ${oldValue} -> (removed)`);
              } else {
                // General case where both values are set
                changes.push(`${key}: ${oldValue} -> ${newValue}`);
              }
            }
          }
        }
  
        // Only add to history if there were changes
        if (changes.length > 0) {
          updateMessage = `Yard ${yardIndex + 1} ${changes} updated by ${req.query.firstName} on ${formattedDateTime}`;
        } else {
          updateMessage += "No changes made.";
        }
  
        // Push the changes to the order history
        order.orderHistory.push(updateMessage);
  
        // Update yard info with the new data
        Object.assign(yardInfo, updatedYardData);
        order.additionalInfo[yardIndex] = yardInfo;
  
        const firstName = req.query.firstName;
        order.markModified("additionalInfo");
  
        await order.save(); // Save changes to the database
        res.json(order);
  
      } else {
        res.status(400).json({ message: "Invalid yard index" });
      }
    } catch (error) {
      console.error("Error in PUT request:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });    
  
// to update card charged
app.put("/orders/:orderNo/additionalInfo/:yardIndex/paymentStatus", async (req, res) => {
console.log("Updating payment status for yard");
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:,mnbjklkjhbv', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
const yardIndex = parseInt(req.params.yardIndex, 10) - 1;

if (!order) return res.status(404).send("Order not found");
if (yardIndex < 0 || yardIndex >= order.additionalInfo.length) {
return res.status(400).json({ message: "Invalid yard index" });
}
const { paymentStatus, cardChargedDate } = req.body;
const firstName = req.query.firstName || "Unknown User";

order.additionalInfo[yardIndex].paymentStatus = paymentStatus;
order.additionalInfo[yardIndex].cardChargedDate = cardChargedDate;
order.orderHistory.push(
`Yard ${yardIndex + 1} payment status updated to ${paymentStatus} by ${firstName} on ${formattedDateTime}`
);

order.markModified("additionalInfo");
await order.save();

res.json(order);
} catch (error) {
console.error("Error updating payment status:", error);
res.status(500).json({ message: "Server error", error });
}
});
// to update update refunds
app.use(express.json());

app.put("/orders/:orderNo/additionalInfo/:yardIndex/refundStatus", async (req, res) => {
  try {
    const ts = require('moment-timezone')().tz('America/Chicago').format('D MMM, YYYY HH:mm');
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) return res.status(404).send("Order not found");

    // If client is 0-based, remove the -1
    const yardIndex = parseInt(req.params.yardIndex, 10) - 1;
    if (yardIndex < 0 || yardIndex >= order.additionalInfo.length) {
      return res.status(400).json({ message: "Invalid yard index" });
    }

    const {
      refundStatus,
      refundedAmount,
      storeCredit,
      refundedDate,
      collectRefundCheckbox,
      upsClaimCheckbox,
      storeCreditCheckbox,
      refundToCollect,
      refundReason
    } = req.body;

    const firstName = req.query.firstName || "Unknown User";
    const yardInfo = order.additionalInfo[yardIndex]; // define before logs

    // Normalize (optional but safer)
    const toNum = v => (v === '' || v == null ? null : Number(v));
    yardInfo.refundStatus          = refundStatus || "";
    yardInfo.refundedAmount        = toNum(refundedAmount);
    yardInfo.storeCredit           = storeCredit == null ? null : toNum(storeCredit);
    yardInfo.refundedDate          = refundedDate || "";
    yardInfo.collectRefundCheckbox = collectRefundCheckbox || "";
    yardInfo.upsClaimCheckbox      = upsClaimCheckbox || "";
    yardInfo.storeCreditCheckbox   = storeCreditCheckbox || "";
    yardInfo.refundToCollect       = refundToCollect || "";
    yardInfo.refundReason          = refundReason || "";

    if (refundToCollect || collectRefundCheckbox === "Ticked") {
      order.orderHistory.push(
        `Yard ${yardIndex + 1} refund status updated to ${refundStatus || "Collect Refund"} by ${firstName} on ${ts}`
      );
    } else {
      order.orderHistory.push(
        `Yard ${yardIndex + 1} removed from Collect Refund by ${firstName} on ${ts}`
      );
    }
  console.log("collectRefundCheckbox",collectRefundCheckbox,"upsClaimCheckbox",upsClaimCheckbox,"storeCreditCheckbox",storeCreditCheckbox)
    if (upsClaimCheckbox === "Ticked") {
      order.orderHistory.push(`Yard ${yardIndex + 1} added for UPS claims by ${firstName} on ${ts}`);
    } else {
      order.orderHistory.push(`Yard ${yardIndex + 1} removed from UPS Claims by ${firstName} on ${ts}`);
    }
    if (storeCreditCheckbox === "Ticked") {
      order.orderHistory.push(`Yard ${yardIndex + 1} added to Store credits by ${firstName} on ${ts}`);
    } else {
      order.orderHistory.push(`Yard ${yardIndex + 1} removed from Store Credits by ${firstName} on ${ts}`);
    }
    order.markModified("additionalInfo");
    await order.save();
    res.json(order);
  } catch (err) {
    console.error("Error updating refund status:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// to update escalation in order history
app.put("/orders/:orderNo/escalation", async (req, res) => {
    const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
    console.log('US Central Time:', centralTime);
    const date = new Date(centralTime);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${day} ${month}, ${year}`;
    const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
  
    const excludedFields = [
      'escRepCustTrackingDate',
      'escRepYardTrackingDate',
      'escRetTrackingDate',
      'yardIndex',
      'orderNo',
      'firstName',
      'custShipToRep',
      'custShipToRet',
      'isReimbursedChecked'
    ];
  
    try {
      const updateData = req.body;
      console.log("updatedData", updateData);
      const orderNo = updateData.orderNo;
      const order = await Order.findOne({ orderNo });
  
      if (!order) {
        console.log("Order not found with orderNo:", orderNo); // Debug log
        return res.status(404).send("Order not found");
      }
  
      const yardIndex = updateData.yardIndex;
      const actualYardIndex = yardIndex - 1;
  
      if (actualYardIndex >= 0 && actualYardIndex < order.additionalInfo.length) {
        const yardInfo = order.additionalInfo[actualYardIndex];
        console.log("Existing yard info:", yardInfo, "updatedData", updateData);
  
        let changes = [];
        const normalizeValue = (value) => {
          if (value === null || value === undefined) return ''; 
          if (typeof value === 'boolean') return value ? 'true' : 'false';
          if (typeof value === 'number') return value.toString();
          return value.toString() || '';
        };
  
        for (const key in updateData) {
          if (updateData.hasOwnProperty(key) && !excludedFields.includes(key)) {
            const oldValue = normalizeValue(yardInfo[key]);
            const newValue = normalizeValue(updateData[key]);
  
            if (oldValue !== newValue) {
              if (oldValue === '' && newValue !== '') {
                changes.push(`${key}: (was not set) -> ${newValue}`);
              } else if (newValue === '' && oldValue !== '') {
                changes.push(`${key}: ${oldValue} -> (removed)`);
              } else {
                changes.push(`${key}: ${oldValue} -> ${newValue}`);
              }
            }
          }
        }
  
        console.log("changes array:", changes);
  
        if (changes.length > 0) {
          const firstName = req.query.firstName;
          const escProcess = updateData.escalationProcess || "";
 
          order.orderHistory.push(
            `Escalation Process for Yard ${actualYardIndex + 1}: Process- ${changes.join(', ')} updated by ${firstName} on ${formattedDateTime}`
          );
  
          console.log("orderHistory after push:", order.orderHistory);
          Object.assign(yardInfo, updateData);
          order.additionalInfo[actualYardIndex] = yardInfo;
          order.markModified("additionalInfo");
          if(updateData.yardShippingStatus == "Delivered"){
            order.orderStatus = "Order Fulfilled"
          }
          await order.save(); 
          console.log("Order saved successfully:", order);
          res.json(order);
        } else {
          res.status(400).json({ message: "No changes detected" });
        }
      } else {
        res.status(400).json({ message: "Invalid yard index" });
      }
    } catch (error) {
      console.error("Error in PUT request:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });
  

// escalation in order history ends here
app.put("/cancelledOrders/:orderNo/additionalInfo/:yardIndex", async (req, res) => {
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:,mnbjklkjhbv', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
try {
// console.log("Received PUT request:", req.params.orderNo, req.params.yardIndex);
const order = await CancelledOrder.findOne({ orderNo: req.params.orderNo });
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
const firstName = req.query.firstName; // Get firstName from the request body
const status = req.body.status; // Get status from the request body
const paymentStatus = req.body.paymentStatus;
const refundStatus = req.body.refundStatus;
order.orderHistory.push(`Yard ${yardIndex + 1} ${status || paymentStatus || refundStatus} updated by ${firstName} on ${formattedDateTime}`);

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
//for esiting yard sttus and all till here

app.put("/orders/:orderNo/cancel", async (req, res) => {
console.log("Received request to cancel order:", req.params);

const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
const firstName = req.body.firstName;

try {
const orderNo = req.params.orderNo;
console.log("Order No to cancel:", orderNo);

const order = await Order.findOne({ orderNo });
console.log("Order found:", order);

if (!order) {
console.log("Order not found with orderNo:", orderNo);
return res.status(404).json({ message: "Order not found" });
}

// Update the order status and history
order.orderStatus = "Order Cancelled";
order.orderHistory.push(
`Order cancelled by ${firstName} on ${formattedDateTime}`
);

// Save the updated order
await order.save();
console.log("Order status updated");

res.json({ message: "Order cancelled successfully" });

} catch (err) {
console.error("Error updating order:", err);
res.status(500).json({ message: "Error updating order", error: err.message });
}
});
// cancel shipment
app.put("/orders/:orderNo/cancelShipment", async (req, res) => {
  console.log("Received request to cancel shipment:", req.params);
  const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
  console.log('US Central Time:', centralTime);
  const date = new Date(centralTime);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const formattedDate = `${day} ${month}, ${year}`;
  const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
  const firstName = req.body.firstName;
  const trNo = req.body.trackingNo;
  const additionalInfo = req.body.additionalInfo;
  const yardIndex = req.body.yardIndex;
  console.log("body",firstName,trNo,additionalInfo,"yardIndex",yardIndex);
  try {
  const orderNo = req.params.orderNo;
  console.log("Order No to cancel shipment:", orderNo);
  const order = await Order.findOne({ orderNo });
  console.log("Order found:", order);
  if (!order) {
  console.log("Order not found with orderNo:", orderNo);
  return res.status(404).json({ message: "Order not found" });
  }
  order.orderStatus = "Yard Processing";
  order.additionalInfo[yardIndex - 1].trackingNo[0] =  " ";
  order.additionalInfo[yardIndex - 1].status =  "Yard PO Sent";
  order.additionalInfo[yardIndex - 1].partShippedDate =  " ";
  order.orderHistory.push(
  `Shipment cancelled: TR: ${trNo} by ${firstName} on ${formattedDateTime}`
  );
  
  // Save the updated order
  await order.save();
  console.log("Order status updated");
  
  res.json({ message: "Order cancelled successfully" });
  
  } catch (err) {
  console.error("Error updating order:", err);
  res.status(500).json({ message: "Error updating order", error: err.message });
  }
  });

// app.delete("/orders/:orderNo", async (req, res) => {
// console.log("Received request to delete order:", req.params);
// const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
// console.log('US Central Time:', centralTime);
// const date = new Date(centralTime);
// const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// const day = date.getDate();
// const month = months[date.getMonth()];
// const year = date.getFullYear();
// const hours = date.getHours().toString().padStart(2, '0');
// const minutes = date.getMinutes().toString().padStart(2, '0');
// const formattedDate = `${day} ${month}, ${year}`;
// const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
// const firstName = req.query.firstName;
// try {
// const orderNo = req.params.orderNo;
// console.log("Order No to delete:", orderNo);

// const order = await Order.findOne({ orderNo });
// console.log("Order found:", order);

// if (!order) {
// console.log("Order not found with orderNo:", orderNo);
// return res.status(404).json({ message: "Order not found" });
// }
// console.log("Order data:", order);
// const cancelledOrder = new CancelledOrder(order.toObject()); 
// console.log("Cancelled Order to save:", cancelledOrder);
// // Save the cancelled order
// cancelledOrder.orderStatus = "Order Cancelled";
// cancelledOrder.orderHistory.push(
//     `Order cancelled by ${firstName} on ${formattedDateTime}`
//     );
// await cancelledOrder.save(); 
// console.log("Cancelled order saved");
// // Delete the original order
// await Order.deleteOne({ orderNo });
// console.log("Order deleted");
// res.json({ message: "Order canceled and saved as cancelled" });

// } catch (err) {
// console.error("Error deleting order:", err);
// res.status(500).json({ message: "Error deleting order", error: err.message });
// }
// });


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
// Endpoint to get a specific cancelled order by orderNo
app.get('/cancelledOrders/:orderNo', async (req, res) => {
console.log("get a specific cancelled order");
try {
const orderNo = req.params.orderNo;
console.log("oNo",orderNo);
const cancelledOrder = await CancelledOrder.findOne({ orderNo });
// console.log("cOrder",cancelledOrder);
if (!cancelledOrder) {
return res.status(404).json({ message: "Cancelled order not found" });
}

res.json(cancelledOrder);
} catch (error) {
console.error("Error fetching cancelled order:", error);
res.status(500).json({ message: "Error fetching cancelled order", error: error.message });
}
});

// Send Invoice Endpoint
app.post("/orders/sendInvoice/:orderNo", async (req, res) => {
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
console.log("inside send Invoice", order);
if (!order) return res.status(404).send("Order not found");
// invoice path
const invoicePath = path.resolve(`./invoices/invoice_${order.orderNo}.pdf`);
console.log("invoicePath",invoicePath);
// const invoicePath = path.resolve(`./`)
if (!fs.existsSync(invoicePath)) {
return res.status(404).json({ message: "Invoice not found" });
}
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
// to: order.email,
to: "dipsikha.spotopsdigital@gmail.com",
subject: "Your Order Invoice",
text: `Dear ${customerName},\n\nPlease find attached the invoice for your order #${order.orderNo}.\n\nThank you for your business!\n\nBest regards,\nYour Company Name`,
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

app.get("/yardInfoMonthly", async (req, res) => {
try {
const month = req.query.month;
const year = req.query.year;
if (!month || !year) {
return res.status(400).json({ message: "Month and year are required" });
}
const monthYearPattern = new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s${month},\\s${year}\\b`, 'i');
const orders = await Order.find({
orderDate: {
$regex: monthYearPattern,
},
});
const filteredOrders = orders.filter(order =>
order.additionalInfo.some(info => info.paymentStatus === "Card charged")
);
console.log("card charged orders",filteredOrders)
res.json(filteredOrders);
} catch (error) {
console.error("Error fetching orders for specified month and year:", error);
res.status(500).json({ message: "Server error", error });
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
console.log(`Server is running on ${port} Dip's new server`);
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
// async function generateInvoice(orderNo, orderData) {
// console.log("inside generate function");
// const existingPdfBytes = fs.readFileSync(path.resolve("./388.pdf"));
// const pdfDoc = await PDFDocument.load(existingPdfBytes);

// const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
// const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

// const firstPage = pdfDoc.getPage(0);
// // Part description
// var partDesc =
// "Year: " +
// orderData.year +
// "\n" +
// "Make: " +
// orderData.make +
// "\n" +
// "Model: " +
// orderData.model +
// "\n" +
// "Part required: " +
// orderData.pReq +
// "\n" +
// "Desc: " +
// orderData.desc +
// "\n" +
// "VIN: " +
// orderData.vin +
// "\n" +
// "Warranty: " +
// orderData.warranty;
// console.log("desc", partDesc);

// // Billing address
// var billingaddress =
// orderData.customerName +
// "\n" +
// orderData.bAddress +
// "\n" +
// orderData.email +
// "\n" +
// orderData.phone;

// var shippingaddress =
// orderData.customerName +
// "\n" +
// orderData.sAddress +
// "\n" +
// orderData.email +
// "\n" +
// orderData.phone;
// console.log("billing and shipping", billingaddress, shippingaddress);
// const replacements = [
// {
// // text: `50STARS${orderNo.toString().padStart(4, "0")}`,
// text:`${orderNo}`,
// x: 450,
// y: 728,
// size: 11,
// font: helveticaFont,
// color: rgb(0, 0, 0),
// },
// {
// text: `${new Date().toLocaleString("en-US", {
// month: "long",
// day: "2-digit",
// year: "numeric",
// })}`,
// x: 450,
// y: 714,
// size: 11,
// font: helveticaFont,
// color: rgb(0, 0, 0),
// },
// {
// text: `${billingaddress}`,
// x: 80,
// y: 650,
// size: 11,
// font: helveticaBoldFont,
// color: rgb(0, 0, 0),
// },
// {
// text: `${shippingaddress}`,
// x: 300,
// y: 650,
// size: 11,
// font: helveticaBoldFont,
// color: rgb(0, 0, 0),
// },
// {
// text: `${partDesc}`,
// x: 80,
// y: 520,
// size: 13,
// font: helveticaBoldFont,
// color: rgb(0, 0, 0),
// },
// {
// text: `$${orderData.soldP}`,
// x: 473,
// y: 460,
// size: 11,
// font: helveticaBoldFont,
// color: rgb(0, 0, 0),
// },
// {
// text: `$${orderData.soldP}`,
// x: 473,
// y: 325,
// size: 11,
// font: helveticaBoldFont,
// color: rgb(0, 0, 0),
// },
// {
// text: `$${orderData.soldP}`,
// x: 473,
// y: 284,
// size: 11,
// font: helveticaBoldFont,
// color: rgb(1, 1, 1),
// }, // White color
// ];

// const drawMultilineText = (page, text, x, y, fontSize, font, color) => {
// const lines = text.split("\n");
// lines.forEach((line, idx) => {
// page.drawText(line, {
// x,
// y: y - idx * fontSize * 1.2,
// size: fontSize,
// font,
// color,
// });
// });
// };

// replacements.forEach(({ text, x, y, size, font, color }) => {
// drawMultilineText(firstPage, text, x, y, size, font, color);
// });

// const pdfBytes = await pdfDoc.save();

// // Load the original PDF and remove the first page
// const originalPdfBytes = fs.readFileSync(path.resolve("./388.pdf"));
// const originalPdfDoc = await PDFDocument.load(originalPdfBytes);

// const modifiedPdfDoc = await PDFDocument.create();
// const [invoicePage] = await modifiedPdfDoc.copyPages(pdfDoc, [0]);
// modifiedPdfDoc.addPage(invoicePage);

// const totalPages = originalPdfDoc.getPageCount();
// for (let i = 1; i < totalPages; i++) {
// const [copiedPage] = await modifiedPdfDoc.copyPages(originalPdfDoc, [i]);
// modifiedPdfDoc.addPage(copiedPage);
// }

// const modifiedPdfBytes = await modifiedPdfDoc.save();

// const outputPath = path.resolve(`./invoices/invoice_${orderNo}.pdf`);
// fs.writeFileSync(outputPath, modifiedPdfBytes);

// console.log(`Invoice generated and appended: ${outputPath}`);
// }
// to send tracking info email
app.post("/orders/sendTrackingInfo/:orderNo", async (req, res) => {
console.log("send tracking info");
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
console.log("no", order);
if (!order) {
return res.status(400).send("Order not found");
}
const { trackingNo, eta, shipperName, link } = req.body;
console.log("trackingInfo", trackingNo, eta, shipperName, link);
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
to: `${order.email}`,
// to:`dipsikha.spotopsdigital@gmail.com`,
bcc:`dipsikha.spotopsdigital@gmail.com`,
subject: `Tracking Details / Order No. ${req.params.orderNo}`,
html: `<p>Hi ${customerName},</p>
<p>This email is regarding the order you placed with <b>50 Stars Auto Parts</b>, and we have attached the tracking information in the same email along with a link that will take you directly to the tracking page.</p>
<p>If the ETA is not updated in the system, it may take 24 hours to reflect on the tracking website, you may check again if you do not find the ETA.</p>
<p>Please call us if you have any questions.</p>
<p>${shipperName} - ${trackingNo}</p>
<p>ETA(YYYY-MM-DD) - ${eta}</p>
<p>Link - <a href="${link}">${link}</a></p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [{
filename: 'logo.png',
path: 'https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png',
cid: 'logo' 
}]
};

console.log("mail", mailOptions);
transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
res.status(500).json({ message: `Error sending mail: ${error.message}` });
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
// to send delivery email
app.post("/orders/sendDeliveryEmail/:orderNo", async (req, res) => {
console.log("send delivery email");
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
if (!order) {
return res.status(400).send("Order not found");
}
const { trackingNo, shipperName, firstName ,link, yardIndex} = req.body;
console.log("trackingInfo", trackingNo, shipperName, firstName,link,"yardIndex",yardIndex);
var cxTrackingNo = order.additionalInfo[yardIndex - 1].trackingNo;
var trackingLink = order.additionalInfo[yardIndex - 1].trackingLink;
var cxshipperName = order.additionalInfo[yardIndex - 1].shipperName;

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
to: `${order.email}`,
// to:`dipsikha.spotopsdigital@gmail.com`,
bcc:`dipsikha.spotopsdigital@gmail.com`,
subject: `Thank You for Your Order(${req.params.orderNo}) – Delivery Confirmation`,
html: `<p>Hi ${customerName},</p>
<p>We’re excited to let you know that your order has been successfully delivered today!</p>
<p>Thank you so much for choosing 50 Stars Auto Parts. We truly appreciate your trust in us and are grateful for the opportunity to serve you</p>
<p>Here’s a quick summary of your order:<br>
Order Number: ${req.params.orderNo}<br>
Tracking No: ${cxTrackingNo}<br>
Tracking Link: ${cxshipperName || ""} -  ${trackingLink || ""}</p>
<p>If there’s anything you need, or if you have any questions about your order, feel free to reach out, we’re always happy to help.</p>
<p>Thanks once again for shopping with us. We look forward to helping you with your auto parts needs in the future!</p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>${firstName}<br>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [{
filename: 'logo.png',
path: 'https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png',
cid: 'logo' 
}]
};

console.log("mail", mailOptions);
transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
res.status(500).json({ message: `Error sending mail: ${error.message}` });
} else {
console.log(" Delivery Email sent successfully:", info.response);
res.json({ message: `Email sent successfully` });
}
});
} catch (error) {
console.error("Server error:", error);
res.status(500).json({ message: "Server error", error });
}
});
// to send notification on csv downloads on a particular page
app.post("/orders/sendDownloadedNotification", async (req, res) => {
  console.log("send tracking info");
  try {
  const { path,firstName } = req.body;
  console.log("path", path);
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
  user: "service@50starsautoparts.com",
  pass: "hweg vrnk qyxx gktv",
  },
  });
  const mailOptions = {
  from: "service@50starsautoparts.com",
  // to: `${order.email}`,
  to:`spotops.digital@gmail.com`,
  bcc:`dipsikha.spotopsdigital@gmail.com`,
  subject: `Notification On Downloads`,
  html: `<p>Hi Charlie/Shankar/Vinutha,</p>
  <p>This email is to inform you that a csv file has been downloaded from the ${path} page.</p>
  <p>Have a check on the details below:</p>
  <p>Page Name: ${path}</p>
  <p>Downloaded By: ${firstName}</p>
  <p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
  <p>CRM<br>50 STARS AUTO PARTS<br></p>`,
  attachments: [{
  filename: 'logo.png',
  path: 'https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png',
  cid: 'logo' 
  }]
  };
  
  console.log("mail", mailOptions);
  transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
  console.error("Error sending mail:", error);
  res.status(500).json({ message: `Error sending mail: ${error.message}` });
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

// to send rma(refund) email for customer shipping
app.post("/orders/sendReturnEmailCustomerShipping/:orderNo", async (req, res) => {
var yardIndex = req.query.yardIndex;
var retAddress = req.query.retAddress;
let label;
if (parseInt(yardIndex) === 1) {
  label = "the package";
} else {
  label = `part ${yardIndex}`;
}
if (retAddress && typeof retAddress === 'string') {
var [firstPart = '', remainingPart = ''] = retAddress.split(/,(.+)/);
firstPart = firstPart.trim(); 
remainingPart = remainingPart.trim();
console.log("First Part:", firstPart,"yardIndex",yardIndex);
console.log("Remaining Part:", remainingPart);
} else {
console.error("Invalid retAddress: Ensure it's a non-empty string.");
}
// console.log("First part:", firstPart);
// console.log("Remaining part:", remainingPart);
//   console.log("send rma(return) info",formattedAddress);
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
console.log("no", order,"yardIndex",yardIndex);
if (!order) {
return res.status(400).send("Order not found");
}
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
to: `${order.email}`,
bcc:`dipsikha.spotopsdigital@gmail.com,service@50starsautoparts.com`,
// to: 'dipsikha.spotopsdigital@gmail.com',
subject: `Return Process for Order No. ${req.params.orderNo}`,
html: `<p>Dear ${customerName},</p>
<p>We understand that sometimes products may not meet your expectations or requirements, and we want to ensure that you have a smooth and hassle-free return process.</p>
<p>To facilitate the return of merchandise, please follow these steps:<br></p>
<p>Package the item(s) securely to prevent damage during transit.<br></p>

<p>Ship ${label} that you received to the following address:<br></p>
<p><b>${firstPart}<br></b>
<b>${remainingPart}</b></p>
</p>
<p>Once we receive the returned merchandise, our team will inspect it to ensure it meets our return policy criteria. Upon approval, we will process your refund or exchange according to your preference.</p>
<p>If you have any questions or need further assistance with the return process, please feel free to reach out.</p>
<p>Thank you for your cooperation and understanding. We value your business and hope to have the opportunity to serve you again in the future.</p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [{
filename: 'logo.png',
path: 'https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png',
cid: 'logo' 
}]
};

console.log("mail", mailOptions);
transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
res.status(500).json({ message: `Error sending mail: ${error.message}` });
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
// to send rma(replacement) email for customer shipping
app.post("/orders/sendReplaceEmailCustomerShipping/:orderNo", async (req, res) => {
var yardIndex = req.query.yardIndex;
var retAddressReplacement = req.query.retAddressReplacement;
var [firstPart, remainingPart] = retAddressReplacement.split(/,(.+)/);
firstPart = firstPart.trim() || " "; 
remainingPart = remainingPart.trim() || " ";
console.log("send rma(return) info");
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
console.log("no", order,"yardIndex",yardIndex);
if (!order) {
return res.status(400).send("Order not found");
}
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
to: `${order.email}`,
bcc:`dipsikha.spotopsdigital@gmail.com,service@50starsautoparts.com`,
// to: 'dipsikha.spotopsdigital@gmail.com',
subject: `Return Required for Replacement of ABS Module Order / Order No. ${req.params.orderNo}`,
html: `<p>Dear ${customerName},</p>
<p>We are sorry to hear that there was an issue with the ABS module you received. We are happy to offer a replacement to ensure you receive a fully functional part.</p>
<p>Please return the part to the following address:</p>
<p>${firstPart}<br>
${remainingPart}</p>
<p>Please note that the shipping costs for the return is your responsibility. Once we receive the part, we will process and ship out the replacement within 1-3 business days. We will also notify you with tracking information once the replacement part is on its way.</p>
<p>If you have any questions about the process or need further assistance, please feel free to contact us.</p>
<p>Thank you for giving us an opportunity to make this right.</p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [{
filename: 'logo.png',
path: 'https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png',
cid: 'logo' 
}]
};
console.log("mail", mailOptions);
transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
res.status(500).json({ message: `Error sending mail: ${error.message}` });
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
app.post("/orders/sendReimburseEmail/:orderNo", async (req, res) => {
var yardIndex = req.query.yardIndex;
var reimburesementValue = req.query.reimburesementValue;
console.log("send rma(return) info");
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
console.log("no", order,"yardIndex",yardIndex);
if (!order) {
return res.status(400).send("Order not found");
}
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
to: `${order.email}`,
bcc:`dipsikha.spotopsdigital@gmail.com,service@50starsautoparts.com`,
// to: 'dipsikha.spotopsdigital@gmail.com',
subject: `Goodwill Reimbursement Confirmation || Order No. ${req.params.orderNo}`,
html: `<p>Dear ${customerName},</p>
<p>We are sorry to hear that the ABS module did not meet your expectations, and we are committed to providing a satisfactory resolution.</p>
<p>As discussed, we’re glad to hear that you’ve resolved the issue! We are reimbursing you $${reimburesementValue} as a goodwill gesture, and we hope this reflects our commitment to supporting our customers. Once the refund is processed, we will share the refund receipt with you.</p>
<p>It’s been a pleasure interacting with you, and we look forward to assisting you with more orders in the future.</p>
<p>Thank you again, and please don’t hesitate to reach out anytime.</p>
<p>If you have any questions or need further assistance, please feel free to reach out.</p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [{
filename: 'logo.png',
path: 'https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png',
cid: 'logo' 
}]
};

console.log("mail", mailOptions);
transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
res.status(500).json({ message: `Error sending mail: ${error.message}` });
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
// to send email for return when shipping methos is own shipping or yard shipping
app.post("/orders/sendReturnEmailOwn_Yard/:orderNo", upload.single("pdfFile"), async (req, res) => {
let yardIndex = req.query.yardIndex;
if (parseInt(yardIndex) === 1) {
  label = "the part";
} else {
  label = `the part ${yardIndex}`;
}
const retAddress = req.query.retAddress;
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
if (!order) return res.status(400).send("Order not found");

const pdfFile = req.file; // Get the uploaded PDF file
if (!pdfFile) return res.status(400).send("No PDF file uploaded");

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
// to: "service@50starsautoparts.com,dipsikha.spotopsdigital@gmail.com",
to: `${order.email}`,
bcc:`dipsikha.spotopsdigital@gmail.com,service@50starsautoparts.com`,
subject:`Return Process For Order No. ${req.params.orderNo}`,
html: `<p>Dear ${customerName},</p>
<p>We understand that sometimes products may not meet your expectations or requirements, and we want to ensure that you have a smooth and hassle-free return process.</p>
<p>To facilitate the return of merchandise, please follow these steps:</p>
<p>Pack ${label} that you received securely to prevent damage during transit.</p>
<p>Please ship the package using the shipping label below to ensure its safe arrival.</p>
<p>Once we receive the returned merchandise, our team will inspect it to ensure it meets our return policy criteria. Upon approval, we will process your refund or exchange according to your preference.</p>
<p>If you have any questions or need further assistance with the return process, please feel free to reach out</p>
<p>Thank you for your cooperation and understanding. We value your business and hope to have the opportunity to serve you again in the future.</p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [
{
filename: pdfFile.originalname,
content: pdfFile.buffer,
},
{
filename: "logo.png",
path: "https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png",
cid: "logo",
},
],
};

transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
return res.status(500).json({ message: `Error sending mail: ${error.message}` });
}
console.log("Email sent successfully:", info.response);
res.json({ message: "Email sent successfully" });
});
} catch (error) {
console.error("Server error:", error);
res.status(500).json({ message: "Server error", error });
}
});
// to send email for replacement when shipping methos is own shipping or yard shipping

app.post("/orders/sendReplaceEmailOwn_Yard/:orderNo", upload.single("pdfFile"), async (req, res) => {
const yardIndex = req.query.yardIndex;
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
if (!order) return res.status(400).send("Order not found");

const pdfFile = req.file; // Get the uploaded PDF file
if (!pdfFile) return res.status(400).send("No PDF file uploaded");

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
// to: "dipsikha.spotopsdigital@gmail.com,service@50starsautoparts.com",
to: `${order.email}`,
bcc:`dipsikha.spotopsdigital@gmail.com,service@50starsautoparts.com`,
subject: `Return Process for Replacement of ABS Module / Order No. ${req.params.orderNo}`,
html: `
<p>Dear ${customerName},</p>
<p>We apologize for any issues with the ABS module you received, and we are committed to providing a replacement that meets your expectations.</p>
<p>To return the part, please use the prepaid shipping label attached to this email. Once we receive the part, we will process your replacement and ship it out within 1-3 business days. You will receive tracking information once the replacement is on its way.</p>
<p>If you need assistance or have any questions, please feel free to reach out.</p>
<p>Thank you for allowing us the opportunity to make this right for you.</p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [
{
filename: pdfFile.originalname,
content: pdfFile.buffer,
},
{
filename: "logo.png",
path: "https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png",
cid: "logo",
},
],
};

transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
return res.status(500).json({ message: `Error sending mail: ${error.message}` });
}
console.log("Email sent successfully:", info.response);
res.json({ message: "Email sent successfully" });
});
} catch (error) {
console.error("Server error:", error);
res.status(500).json({ message: "Server error", error });
}
});

// Function to generate PDF using puppeteer
// async function generatePDF(url, outputPath) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });
//   await page.pdf({ path: outputPath, format: 'A4' });
//   await browser.close();
// }
//  to send refundEmail to the customer
app.post("/orders/sendRefundEmail/:orderNo", upload.single("pdfFile"), async (req, res) => {
const yardIndex = req.query.yardIndex;
const refundedAmount = req.query.refundedAmount;

if (!refundedAmount) {
return res.status(400).json({ message: "Refunded amount is missing." });
}

try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
if (!order) return res.status(400).json({ message: "Order not found" });

const pdfFile = req.file; 
if (!pdfFile) return res.status(400).json({ message: "No PDF file uploaded" });

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
// to: "dipsikha.spotopsdigital@gmail.com",
to: `${order.email}`,
bcc:`service@50starsautoparts.com,dipsikha.spotopsdigital@gmail.com`,
subject: `Refund Processed for Your Order ${req.params.orderNo} with 50 Stars Auto Parts`,
html: `<p>Dear ${customerName},</p>
<p>We are reaching out to confirm that your refund of $${refundedAmount} for the order #${req.params.orderNo} has been succcessfully processed. Attached to this email, you will find a copy of the refund receipt for your record.</p>
<p>Please allow 3-5 business days for the refund to reflect on your source account, as processing time may vary based on the financial institution. If you have any questions or need further assistane,feel free to contact us. </p>
<p>Thank you for choosing 50 Stars Auto Parts. We hope to have the opportunity to serve you again in the future.</p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [
{
filename: pdfFile.originalname,
content: pdfFile.buffer,
},
{
filename: "logo.png",
path: "https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png",
cid: "logo",
},
],
};

transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
return res.status(500).json({ message: `Error sending mail: ${error.message}` });
}
console.log("Email sent successfully:", info.response);
res.json({ message: "Email sent successfully" });
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
const orderB = await Order.find({});
console.log("Successfully shown", orderB);
} catch (err) {
res.status(500).json({ message: "Internal Server Error" });
}
});

app.get('/daily', async (req, res) => {
console.log("Fetching daily orders for Dallas timezone");
const orders = await Order.find({});
console.log("orderDates",orders)
});



// function to edit the yard details
// app.put("/orders/:orderNo/additionalInfo/:yardIndex", async (req, res) => {
//   console.log("inside edit yard details");
//   const { orderNo, yardIndex } = req.params;
//   const updatedYardInfo = req.body;

//   try {
//     const order = await Order.findOne({ orderNo });
//     if (!order) {
//       return res.status(404).send("Order not found");
//     }

//     order.additionalInfo[yardIndex] = updatedYardInfo;
//     await order.save();
//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });


//notes section
// app.get('/orders/:orderNo/notes/:yardIndex', async (req, res) => {
//   console.log("Received request for notes with params:", req.params); // Log the request parameters
//   try {
//     const { orderNo, yardIndex } = req.params;
//     const order = await Order.findOne({ orderNo });
//     if (!order) {
//       return res.status(404).send('Order not found');
//     }
//     var yIndex = parseInt(yardIndex, 10);
//     console.log("yIndex",yIndex);
//     const notes = order.additionalInfo[yardIndex]?.notes || [];
//     console.log("get notes",notes);
//     res.json({ notes });
//   } catch (error) {
//     console.error('Error fetching notes:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// });
// Update notes in additionalInfo of a specific yardIndex
app.post('/orders/:orderNo/notes/:yardIndex', async (req, res) => {
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:,mnbjklkjhbv', centralTime);
console.log('Received request to add note');
try {
const { orderNo, yardIndex } = req.params;
const { note, author, timestamp } = req.body;
const yardIndexInt = parseInt(yardIndex, 10); // Convert to integer

console.log(`Received request to add note to order ${orderNo}, yardIndex ${yardIndexInt}: ${note}`);

const order = await Order.findOne({ orderNo });
if (!order) {
console.log(`Order ${orderNo} not found`);
return res.status(404).send('Order not found');
}

if (!order.additionalInfo || !order.additionalInfo[yardIndexInt]) {
console.log(`YardIndex ${yardIndexInt} not found in order ${orderNo}`);
return res.status(404).send('YardIndex not found');
}

if (!order.additionalInfo[yardIndexInt].notes) {
console.log("Initializing notes array");
order.additionalInfo[yardIndexInt].notes = [];
}

// Create the new note object
const newNote = {
note: note,
author: author,
timestamp: timestamp
};
var nNote = `${author},${timestamp} : ${note}`
console.log("mNote",nNote);
// Add the new note to the notes array
order.additionalInfo[yardIndexInt].notes.push(nNote);

console.log("Order before save:", JSON.stringify(order, null, 2));

await order.save();

console.log("Order after save:", JSON.stringify(order, null, 2));
res.json(order.additionalInfo[yardIndexInt].notes);
} catch (error) {
console.error('Error updating notes:', error);
res.status(500).json({ message: 'Server error', error });
}
});

// Update support notes
app.put('/orders/:orderNo/supportNotes', async (req, res) => {
const { orderNo } = req.params;
const { note, author, timestamp } = req.body;
var supportNote = `${author},${timestamp} : ${note}` 
try {
const order = await Order.findOne({ orderNo });

if (order) {

order.supportNotes.push(supportNote);
await order.save();
res.status(200).json({ message: 'Support comments updated successfully.' });
} else {
res.status(404).json({ message: 'Order not found.' });
}
} catch (error) {
res.status(500).json({ message: 'Failed to update support comments.', error });
}
});
app.put('/cancelledOrders/:orderNo/supportNotes', async (req, res) => {
console.log("pushing support notes for cancelled orders");    
const { orderNo } = req.params;
console.log("Updating support notes for cancelled order:", orderNo);
const { note, author, timestamp } = req.body;
var supportNote = `${author}, ${timestamp} : ${note}`;
try {
const cOrder = await CancelledOrder.findOne({ orderNo });
console.log("cOrder",cOrder);
if (cOrder) {
if (!cOrder.supportNotes) {
cOrder.supportNotes = [];
}
cOrder.supportNotes.push(supportNote);
await cOrder.save();
res.status(200).json({ message: 'Support comments updated successfully.' });
} else {
res.status(404).json({ message: 'Cancelled order not found.' });
}
} catch (error) {
console.error("Error updating support notes:", error);
res.status(500).json({ message: 'Failed to update support comments.', error });
}
});
//notes section till here


// update notes and append notes

// Update order status and append notes specifically for Customer Approved
app.put('/orders/:orderNo/notes', async (req, res) => {
console.log("put note/update notes")
var body = req.body;
console.log("body",body);
const { orderNo } = body.orderNo;
const { notes } = body.notes;
const { orderStatus } = body.status;
try {
const order = await Order.findOneAndUpdate(
{ orderNo: orderNo },
{ $set: { orderStatus: 'Customer approved' }, $push: { notes: notes } },
{ new: true }
);
if (!order) {
return res.status(404).json({ message: 'Order not found' });
}
res.status(200).json(order);
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// Mock function to simulate token retrieval from the database
const getTokenFromDatabase = async (userId) => {
// Implement your logic to retrieve the token from the database based on the userId
return 'your_token_here';
};

app.get('/auth/token', async (req, res) => {
console.log("token fetching");
try {
const userId = req.query.userId; // Assume you pass userId as a query parameter\
console.log("userId",userId)
const token = await getTokenFromDatabase(userId);
if (!token) {
return res.status(404).json({ error: 'Token not found' });
}
res.status(200).json({ token });
} catch (error) {
res.status(500).json({ error: 'Failed to get token' });
}
});





// Route to update actualGP
// app.put('/orders/:orderNo/updateActualGP', async (req, res) => {
// const { orderNo } = req.params;
// const { actualGP } = req.body;
// console.log("updating actualGP",orderNo,actualGP)
// try {
// const order = await Order.findOne({ orderNo });

// if (!order) {
// return res.status(404).send('Order not found');
// }

// const lastIndex = order.additionalInfo.length - 1;
// order.actualGP = actualGP;
// console.log("actualGP",actualGP,order);
// await order.save();
// // console.log("saved actualGP")
// res.status(200).send('Actual GP updated successfully');
// } catch (error) {
// res.status(500).send('Error updating actual GP');
// }
// });
// Route to update actualGP for a specific order
app.put('/orders/:orderNo/updateActualGP', async (req, res) => {
console.log("PUT request for actualGP");
const { orderNo } = req.params;  // 'orderNo' from the URL params
const { actualGP } = req.body;   // 'actualGP' from the request body

console.log("GPS:", actualGP, "OrderNo:", orderNo);

try {
// Query by 'orderNo' explicitly and ensure it's treated as a string
const order = await Order.findOneAndUpdate(
{ orderNo: String(orderNo) },  // Force 'orderNo' as a string
{ 
actualGP: actualGP  // Update the 'actualGP' field
},
{ new: true }  // Return the updated document
);

if (!order) {
return res.status(404).json({ message: 'Order not found' });
}

res.json(order);  // Respond with the updated order
} catch (error) {
console.error('Error updating gp information:', error);
res.status(500).json({ message: 'Server error' });
}
});



// to delete a user
app.delete('/users/:id', async (req, res) => {
try {
const userId = req.params.id;
const user = await User.findByIdAndDelete(userId);

if (!user) {
return res.status(404).json({ message: 'User not found' });
}

res.json({ message: 'User deleted successfully' });
} catch (error) {
console.error('Error deleting user:', error);
res.status(500).json({ message: 'Server error' });
}
});

// to get the users by id
app.get('/users/:id', async (req, res) => {
console.log("fetching user data by id");
try {
const user = await User.findById(req.params.id);
if (!user) {
return res.status(404).json({ message: 'User not found' });
}
res.json(user);
} catch (error) {
res.status(500).json({ message: 'Server error', error });
}
});




//edit user details
app.put('/users/:id', async (req, res) => {
try {
const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
new: true,
runValidators: true,
});
if (!updatedUser) {
return res.status(404).json({ message: 'User not found' });
}
res.json(updatedUser);
} catch (error) {
res.status(400).json({ message: error.message });
}
});

// // api for updating PO sent date:
// app.put('/orders/:orderNo', (req, res) => {
// const { orderNo } = req.params;
// const { poSentDate } = req.body;
// Order.findOneAndUpdate({ orderNo: orderNo }, { $set: { poSentDate: poSentDate } }, { new: true })
// .then(updatedOrder => {
// res.json(updatedOrder);
// })
// .catch(err => {
// console.error('Error updating PO Sent Date:', err);
// res.status(500).send('Error updating PO Sent Date');
// });
// });
// api for updating po sent date and delivery date:
// app.put('/orders/:orderNo/additionalInfo/:yardIndex', async (req, res) => {
// const { orderNo, yardIndex } = req.params;
// const { poSentDate, partDeliveredDate, status } = req.body;

// try {
// const order = await Order.findOne({ orderNo });

// if (!order) {
// return res.status(404).send('Order not found');
// }

// const yard = order.additionalInfo[yardIndex];

// if (!yard) {
// return res.status(404).send('Yard not found');
// }

// // Update the relevant fields
// if (poSentDate) yard.poSentDate = poSentDate;
// if (partDeliveredDate) yard.partDeliveredDate = partDeliveredDate;

// // Save the changes
// await order.save();

// res.json(order);
// } catch (err) {
// console.error('Error updating yard dates:', err);
// res.status(500).send('Internal server error');
// }
// });


// Move order from cancelledOrders to orders if orderStatus is not 'Order Cancelled'
app.put('/moveOrder/:orderNo', async (req, res) => {
console.log("A PUT req to move orders from cancelled to orders if the status changes to Not cancelled");
const { orderNo } = req.params;
const { orderStatus } = req.body;
console.log("orderNo:",orderNo,"Status:",orderStatus);
try {
const cancelledOrder = await CancelledOrder.findOne({ orderNo });
if (!cancelledOrder) {
return res.status(404).json({ message: 'Order not found in cancelledOrders.' });
}
if (orderStatus === 'Order Cancelled') {
return res.status(400).json({ message: 'Order cannot be moved back because its status is "Order Cancelled".' });
}
const orderData = { ...cancelledOrder._doc, orderStatus: orderStatus }; 
const newOrder = new Order(orderData);
console.log("newOrder",newOrder);
await newOrder.save();
await CancelledOrder.findOneAndDelete({ orderNo });

res.status(200).json({ message: 'Order moved back to orders collection successfully.', newOrder });
} catch (error) {
console.error('Error moving order:', error);
res.status(500).json({ error: 'An error occurred while moving the order.' });
}
});

// GET route to fetch additionalInfo for a specific order and yardIndex
app.get("/orders/:orderNo/additionalInfo/:yardIndex", async (req, res) => {
const { orderNo, yardIndex } = req.params;
console.log("getting additional info",orderNo,yardIndex);
const actualYardIndex = yardIndex - 1 ;
try {
const order = await Order.findOne({ orderNo });
if (!order) {
return res.status(404).json({ error: "Order not found" });


}
const additionalInfo = order.additionalInfo[actualYardIndex];

if (!additionalInfo) {
return res.status(404).json({ error: "Yard index not found" });
}
res.json(additionalInfo);
} catch (err) {
console.error(err);
res.status(500).json({ error: "Server error" });
}
});
// PATCH route to update additionalInfo for a specific order and yardIndex
app.patch("/orders/:orderNo/additionalInfo/:yardIndex", async (req, res) => {
const { orderNo, yardIndex } = req.params;

// Convert yardIndex to a number for proper comparison
const actualYardIndex = parseInt(yardIndex) - 1;
console.log("actualYardIndex", actualYardIndex);

const updateData = req.body; 
console.log("updatedData", updateData);

try {
// Find the order by orderNo
const order = await Order.findOne({ orderNo });
if (!order) {
return res.status(404).json({ error: "Order not found" });
}

// Find the specific additionalInfo object by yardIndex
const additionalInfo = order.additionalInfo[actualYardIndex]
console.log("fetched additionalInfo", additionalInfo);

if (!additionalInfo) {
return res.status(404).json({ error: "Yard index not found" });
}

// Update only the fields that were provided in the request body
Object.keys(updateData).forEach((key) => {
additionalInfo[key] = updateData[key];
});

// Save the updated order
await order.save();

// Send success response
res.status(200).json({ message: "Order updated successfully" });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Server error" });
}
});
//for storing disputes
app.put('/orders/:orderNo/dispute', async (req, res) => {
console.log("put request for dispute");
const { orderNo } = req.params;
const { disputedDate, disputeReason , disputedRefAmount} = req.body;
console.log("Disputes:", disputedDate, disputeReason, "OrderNo:", orderNo, "disputedRefAmount", disputedRefAmount);

try {
const order = await Order.findOneAndUpdate(
{ orderNo: orderNo }, 
{ 
disputedDate: disputedDate, 
disputeReason: disputeReason ,
custRefAmount: disputedRefAmount,
},
{ new: true }  
);
if (!order) {
return res.status(404).json({ message: 'Order not found' });
}
res.json(order);
} catch (error) {
console.error('Error updating dispute information:', error);
res.status(500).json({ message: 'Server error' });
}
});
// for storing custRefunds
app.put('/orders/:orderNo/custRefund', async (req, res) => {
console.log("PUT request for custRefund:", req.body);
const { orderNo } = req.params;
const {
custRefundDate, 
custRefundedAmount, 
cancelledDate, 
custRefAmount,
cancellationReason,
orderStatus
} = req.body;
console.log(
"Refunds:", custRefundDate, custRefundedAmount, 
"Cancellations:", cancelledDate, custRefAmount, 
"OrderNo:", orderNo,
"cancellationReason:", cancellationReason,
"orderStatus", orderStatus
);
// custRefAmount is the
var firstName = req.query.firstName;
console.log("firstName",firstName )
try {
const updateFields = {};
if (custRefundDate) updateFields.custRefundDate = custRefundDate;
if (custRefundedAmount) updateFields.custRefAmount = custRefundedAmount;
if (cancelledDate) updateFields.cancelledDate = cancelledDate;
if (custRefAmount) updateFields.custRefAmount = custRefAmount;
if (cancellationReason) updateFields.cancellationReason = cancellationReason;
if (orderStatus) updateFields.orderStatus = orderStatus;
const order = await Order.findOne({ orderNo: orderNo });
if (!order) {
return res.status(404).json({ message: 'Order not found' });
}
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
// Add to orderHistory
let historyEntry = "";

if (custRefundDate && custRefundedAmount) {
historyEntry = 'Order status changed to Refunded';
}
 if (cancelledDate && cancellationReason) {
historyEntry = 'Order Cancelled';
}

if (historyEntry) {
order.orderHistory = order.orderHistory || [];
order.orderHistory.push(
    `${historyEntry} by ${firstName} on ${formattedDateTime}`
    );
}

// Update the order
Object.assign(order, updateFields);
await order.save();

res.json(order);
} catch (error) {
console.error('Error updating refund or cancellation information:', error);
res.status(500).json({ message: 'Server error' });
}
});


// const moment = require('moment-timezone');
app.get('/orders/salesperson/:salesperson', async (req, res) => {
const salesperson = req.params.salesperson;
try {
const orders = await Order.aggregate([
{
$match: {
salesAgent: salesperson,
},
},
{
// Parse orderDate from string to Date object
$addFields: {
orderDateParsed: {
$dateFromString: {
dateString: {
$reduce: {
input: { $split: ["$orderDate", " "] },
initialValue: "",
in: {
$cond: {
if: { $regexMatch: { input: "$$this", regex: /^(st|nd|rd|th)$/ } },
then: "$$value",
else: { $concat: ["$$value", " ", "$$this"] }
}
}
}
},
format: "%d %b, %Y %H:%M",
timezone: "UTC"
}
}
}
},
{
$group: {
_id: { $dayOfMonth: "$orderDateParsed" },
totalOrders: { $sum: 1 },
totalGP: { $sum: "$actualGP" }, // Assuming actualGP is part of the schema
},
},
{
$sort: { _id: 1 } // Sort by day in ascending order
}
]);

const formattedOrders = orders.map(order => ({
day: order._id,
totalOrders: order.totalOrders,
totalGP: order.totalGP
}));

res.json(formattedOrders);
} catch (error) {
res.status(500).json({ message: 'Error fetching salesperson performance', error });
}
});
app.get('/orders/yearly', async (req, res) => {
console.log("yearly orders");
try {
const orders = await Order.aggregate([
{
$addFields: {
orderDateParsed: {
$dateFromString: {
dateString: {
$reduce: {
input: { $split: ["$orderDate", " "] },
initialValue: "",
in: {
$cond: {
if: { $regexMatch: { input: "$$this", regex: /^(st|nd|rd|th)$/ } },
then: "$$value",
else: { $concat: ["$$value", " ", "$$this"] }
}
}
}
},
format: "%d %b, %Y %H:%M",
timezone: "UTC"
}
}
}
},
{
$group: {
_id: { $month: "$orderDateParsed" },
totalOrders: { $sum: 1 },
},
},
{
$sort: { _id: 1 } 
}
]);
console.log("orders found",orders);
const formattedOrders = orders.map(order => ({
month: order._id,
totalOrders: order.totalOrders,
}));

res.json(formattedOrders);
} catch (error) {
res.status(500).json({ message: 'Error fetching yearly progress', error });
}
});

// endpoint for sending cancellation email
app.post("/orders/sendCancelEmail/:orderNo", async (req, res) => {
console.log("send tracking info");
try {
const order = await Order.findOne({ orderNo: req.params.orderNo });
console.log("no", order);
if (!order) {
return res.status(400).send("Order not found");
}
const { trackingNo, eta, shipperName, link } = req.body;
var orderDate = order.orderDate;
var cancelledRefAmount = req.query.cancelledRefAmount;
  const date = new Date(orderDate);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  const formattedDate = `${month}-${day}-${year}`;
  console.log(formattedDate);
console.log("trackingInfo", trackingNo, eta, shipperName, link);
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});
var customerName = order.customerName || order.fName;
const mailOptions = {
from: "service@50starsautoparts.com",
// to: `dipsikha.spotopsdigital@gmail.com`,
to: `${order.email}`,
bcc:`service@50starsautoparts.com,dipsikha.spotopsdigital@gmail.com`,
subject: `Order Cancellation | ${order.orderNo}`,
html: `<p>Dear ${customerName},</p>
<p>I hope this email finds you well. I am writing to inform you about the cancellation of your recent order #<b>${order.orderNo}</b>, dated <b>${formattedDate}</b>, for a <b>${order.year} ${order.make}
${order.model} ${order.pReq}</b> with <b>50 Stars Auto Parts</b>.
<p>We regret any inconvenience this may have caused you.</p>
<b>We have cancelled your order and will refund you $${cancelledRefAmount}  to the same source account.</b>
Please call us if you have any questions. Rest assured, any payment made for the cancelled order will be promptly refunded to your original payment method. You can expect to see the refund reflected in your account within 3-5 business days.<br>
<p>We understand the importance of timely and efficient service, and we sincerely apologize for any inconvenience this cancellation may have caused. Our team is working diligently to prevent such occurrences in the future.<br>
If you have any questions or require further assistance, please don't hesitate to contact our customer support team at [<b>+1 (888) 732-8680</b>]. We are here to assist you in any way we can.Thank you for your understanding and continued support.<br></p>
<p><b>Please reply to this email with a quick confirmation to acknowledge and approve this cancellation request.</b></p>
<p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
attachments: [{
filename: 'logo.png',
path: 'https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png',
cid: 'logo' 
}]

};

console.log("mail", mailOptions);

transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Error sending mail:", error);
res.status(500).json({ message: `Error sending mail: ${error.message}` });
} else {
console.log("Cancellation email sent successfully:", info.response);
res.json({ message: `Cancellation email sent successfully` });
}

});
} catch (error) {
console.error("Server  at the end:", error);
res.status(500).json({ message: "Server error", error });
}
});
// to send refund email to the yard
app.post("/orders/sendRefundEmailYard/:orderNo", upload.single("pdfFile"), async (req, res) => {
  console.log("send refund email to the yard");
  try {
  const order = await Order.findOne({ orderNo: req.params.orderNo });
  console.log("no", order);
  if (!order) {
  return res.status(400).send("Order not found");
  }
  const pdfFile = req.file; 
  var firstName = req.query.firstName;
if (!pdfFile) return res.status(400).send("No PDF file uploaded");
  var orderDate = order.orderDate;
  var yardIndex = req.query.yardIndex - 1;
  var refundReason = req.query.refundReason;
  var returnTracking = req.query.returnTracking;
  var refundToCollect = req.query.refundToCollect;
  var shipperName = req.query.shipper;
  
  console.log("yardIndex",yardIndex);
  // const date = new Date(orderDate.replace(/(\d+)(st|nd|rd|th)/, '$1'));
  // date.setDate(date.getDate() - 1);
  // const month = (date.getMonth() + 1).toString().padStart(2, '0');  
  // const day = date.getDate().toString().padStart(2, '0');
  // const year = date.getFullYear();
  // var orderedDate =  `${month}/${day}/${year}`;
  console.log("refundReason", refundReason, returnTracking, refundToCollect);
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
  user: "purchase@auto-partsgroup.com",
  pass: "zhtb vimk prif bdfg",
  },
  });
  var yardAgent = order.additionalInfo[yardIndex].agentName;
  var partPrice = order.additionalInfo[yardIndex].partPrice;
  const yardOSorYS = order.additionalInfo[yardIndex].shippingDetails || '';
  let shippingValueYard = 0;
 if (yardOSorYS.includes("Yard shipping")) {
shippingValueYard = parseFloat(yardOSorYS.split(":")[1].trim()) || 0;
}
var others = order.additionalInfo[yardIndex].others || 0;
var chargedAmount = partPrice + shippingValueYard + others;
var stockNo = order.additionalInfo[yardIndex].stockNo || "NA";
var yardEmail = order.additionalInfo[yardIndex].email;
  const mailOptions = {
  from: "purchase@auto-partsgroup.com",
  // to: `dipsikha.spotopsdigital@gmail.com`,
  to: `${yardEmail}`,
  bcc:`purchase@auto-partsgroup.com,dipsikha.spotopsdigital@gmail.com`,
  subject: `Request for Yard Refund | ${order.orderNo}`,
  html: `<p>Dear ${yardAgent},</p>
  <p>I am writing to bring to your attention that there was a charge  on my credit card for the Order ID- #<b>${order.orderNo}</b>, for a <b>${order.year} ${order.make}
  ${order.model} ${order.pReq}</b>. I request a refund for the same.
  <p>Requested refund amount : $${refundToCollect} </p>
  <p>Stock No: ${stockNo}</p>
  <p>Return tracking number : ${returnTracking}</p>
  <p>Refund Reason : ${refundReason}</p>
  <p>I kindly request you to process the refund at your earliest convenience and share the refund receipt with us.</p>
  <p>If any further information or documentation is required, please do not hesitate to contact us.</p>
  <p>Thank you for your understanding and cooperation.</p>
  <p>I appreciate your prompt attention to this matter and look forward to a swift resolution.</p>
  <p>Note : If you have another company name or DBA, please do let us know. Purchase Order has been attached below for your reference.</p>
             
  <p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
  <p>${firstName || ""}</p>
  <p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 732-8680<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
  attachments: [
    {
    filename: pdfFile.originalname,
    content: pdfFile.buffer,
    },
    {
    filename: "logo.png",
    path: "https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png",
    cid: "logo",
    },
    ],
  };
  
  console.log("mail", mailOptions);
  
  transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
  console.error("Error sending mail:", error);
  res.status(500).json({ message: `Error sending mail: ${error.message}` });
  } else {
  console.log("Cancellation email sent successfully:", info.response);
  res.json({ message: `Cancellation email sent successfully` });
  }
  
  });
  } catch (error) {
  console.error("Server  at the end:", error);
  res.status(500).json({ message: "Server error", error });
  }
  });
 
app.post("/sendPOEmailYard/:orderNo", upload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), async (req, res) => {
  try {
    const { orderNo } = req.params;
    const firstName = req.query.firstName;
    const yardIndex = parseInt(req.body.yardIndex, 10) - 1;

    console.log("Sending PO to yard...", "yardIndex", yardIndex);

    const order = await Order.findOne({ orderNo });
    if (!order) return res.status(404).send("Order not found");

    const pdfFile = req.files?.pdfFile?.[0];
    const imageFiles = req.files?.images || [];
    if (!pdfFile) return res.status(400).send("No PDF file uploaded");

    const yard = order.additionalInfo[yardIndex];
    if (!yard) return res.status(400).send("Invalid yard index");

    const {
      year, make, model, pReq, desc, vin, partNo,
      fName, lName, sAddressStreet, sAddressCity,
      sAddressState, sAddressZip
    } = order;

    const {
      agentName, yardName, street, city, state, zipcode,
      shippingDetails = "", partPrice, email: rawYardEmail,
      stockNo = "NA", warranty = "30", others = 0
    } = yard;

    const yardEmail = (rawYardEmail || "").trim();

    // If yard email is missing, log it and return success without sending
    if (!yardEmail) {
      const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
      const date = new Date(centralTime);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

      const msg = `Yard ${yardIndex + 1} PO not sent (missing yard email) by ${firstName} on ${formattedDate}`;
      order.additionalInfo[yardIndex].notes.push(msg);
      order.orderHistory.push(msg);
      await order.save();

      console.log(`Email skipped: No yard email for yardIndex ${yardIndex}`);
      return res.status(200).json({ message: "Failed to send a PO. No yard email provided." });
    }

    let shipping = 0;
    let shippingValue = "-";
    if (shippingDetails.includes("Own shipping")) {
      shippingValue = "Own Shipping (Auto Parts Group Corp)";
    } else if (shippingDetails.includes("Yard shipping")) {
      const match = shippingDetails.match(/Yard shipping:\s*(\d+)/);
      if (match) {
        const parsed = parseFloat(match[1]);
        shipping = parsed;
        shippingValue = parsed === 0 ? "Included" : `${parsed}`;
      }
    }

    const total = parseFloat(partPrice) + shipping + parseFloat(others);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "purchase@auto-partsgroup.com",
        pass: "zhtb vimk prif bdfg",
      },
    });

    const mailOptions = {
      from: "purchase@auto-partsgroup.com",
      to: yardEmail,
      bcc: "dipsikha.spotopsdigital@gmail.com",
      subject: `Purchase Order | ${orderNo} | ${year} ${make} ${model} | ${pReq}`,
      html: `
        <p style="font-size: 14px;">Dear ${agentName},</p>
        <p style="font-size: 14px;">Please find attached the Purchase Order for the following:</p>
        <ul style="font-size: 14px;">
          <li><strong>Order No:</strong> ${orderNo}</li>
          <li><strong>Year/Make/Model:</strong> ${year} ${make} ${model}</li>
          <li><strong>Part:</strong> ${pReq}</li>
          <li><strong>Description:</strong> ${desc}</li>
          <li><strong>VIN:</strong> ${vin || 'NA'}</li>
          <li><strong>Part No:</strong> ${partNo || 'NA'}</li>
          <li><strong>Stock No:</strong> ${stockNo}</li>
          <li><strong>Warranty:</strong> ${warranty} days</li>
        </ul>
        <p><strong>Purchase Order To:</strong> ${yardName}<br>
        <strong>Part Price:</strong> $${parseFloat(partPrice).toFixed(2)}<br>
        <strong>Shipping:</strong> ${shippingValue}</p>
        
        <p style="font-size: 14px;">
          Notes:<br>
          Please provide the transaction receipt after you have charged our card.<br>
          Also, make sure it's blind shipping, and don't add any tags or labels during the shipment.<br>
          Please ensure that the items are delivered as specified above and in accordance with the agreed-upon terms and conditions.<br>
          If there are any discrepancies or questions regarding this order, please contact us immediately.
        </p>

        <p>
          <strong style="background-color: #ffff00; font-size: 20px; color: black; font-weight: bold; padding: 4px; display: inline-block;margin-bottom:4px;">
            NOTE: BLIND SHIPPING
          </strong><br>
          <strong style="background-color: #ff0000; font-size: 20px; color: black; font-weight: bold; padding: 4px; display: inline-block;margin-bottom:4px;">
            NOTE: PROVIDE PICTURES BEFORE SHIPPING 
          </strong>
        </p>

        <p><img src="cid:logo" alt="logo" style="width: 180px; height: 100px;"></p>
        <p style="font-size: 16px;">
          ${firstName}<br>
          Auto Parts Group Corp<br>
          +1 (888) 732-8680 | purchase@auto-partsgroup.com
        </p>
      `,
      attachments: [
        {
          filename: pdfFile.originalname,
          content: pdfFile.buffer,
          contentType: 'application/pdf'
        },
        {
          filename: "logo.png",
          path: "https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png",
          cid: "logo",
        },
        ...imageFiles.map((img, index) => ({
          filename: img.originalname || `image_${index + 1}.jpg`,
          content: img.buffer,
          contentType: img.mimetype
        }))
      ]
    };
    try {
  const info = await transporter.sendMail(mailOptions);
  
  const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
  const date = new Date(centralTime);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedDate = `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;

  order.additionalInfo[yardIndex].status = "Yard PO Sent";
  order.additionalInfo[yardIndex].notes.push(`Yard ${yardIndex + 1} PO sent by ${firstName} on ${formattedDate}`);
  order.orderHistory.push(`Yard ${yardIndex + 1} PO sent by ${firstName} on ${formattedDate}`);

  await order.save();
  console.log("PO email sent:", info.response);
  return res.status(200).json({ message: "PO email sent and status updated successfully" });

} catch (error) {
  console.error("Error sending mail:", error);
  return res.status(500).json({ message: "Email sending failed", error });
}

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
 
// to check orderNo existence
app.get('/orders/checkOrderNo/:orderNo', async (req, res) => {
const { orderNo } = req.params;
try {
const orderExists = await Order.exists({ orderNo });
res.json({ exists: !!orderExists });
} catch (error) {
console.error("Error checking Order No:", error);
res.status(500).send("Internal Server Error");
}
});
// for voiding label
app.put("/orders/updateYard/:orderNo/:yardIndex", async (req, res) => {
const { orderNo, yardIndex } = req.params;
const { trackingNo, eta, shipperName, trackingLink, status, updatedBy } = req.body;
var firstname = req.query.firstName;
try {
// Fetch the order by order number
const order = await Order.findOne({ orderNo });
if (!order) {
return res.status(404).json({ message: "Order not found" });
}

// Check if the yard index is valid
if (!order.additionalInfo[yardIndex - 1]) {
return res.status(400).json({ message: "Invalid yard index" });
}

const yardData = order.additionalInfo[yardIndex - 1];

// Initialize history arrays if they don't exist
yardData.trackingHistory = yardData.trackingHistory || [];
yardData.etaHistory = yardData.etaHistory || [];
yardData.shipperNameHistory = yardData.shipperNameHistory || [];
yardData.trackingLinkHistory = yardData.trackingLinkHistory || [];

// Append current data to history arrays if it exists
if (Array.isArray(yardData.trackingNo)) {
const cleanedTrackingNo = yardData.trackingNo.map((number) => number.trim());
yardData.trackingHistory.push(...cleanedTrackingNo); // Append cleaned tracking numbers
} else if (typeof yardData.trackingNo === "string" && yardData.trackingNo.trim() !== "") {
yardData.trackingHistory.push(yardData.trackingNo.trim()); // Append single tracking number
}

if (yardData.eta) {
const cleanedEta = typeof yardData.eta === "string" ? yardData.eta.trim() : yardData.eta;
yardData.etaHistory.push(cleanedEta);
}

if (yardData.shipperName) {
const cleanedShipperName = typeof yardData.shipperName === "string" ? yardData.shipperName.trim() : yardData.shipperName;
yardData.shipperNameHistory.push(cleanedShipperName);
}

if (yardData.trackingLink) {
const cleanedTrackingLink = typeof yardData.trackingLink === "string" ? yardData.trackingLink.trim() : yardData.trackingLink;
yardData.trackingLinkHistory.push(cleanedTrackingLink);
}

// Update current fields with new values or clear them
yardData.trackingNo = Array.isArray(trackingNo) ? trackingNo : [];
yardData.eta = eta || "";
yardData.shipperName = shipperName || "";
yardData.trackingLink = trackingLink || "";


// Update yard status
yardData.status = status || "Yard PO Sent";

// Add a label voided entry to the order history
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
order.orderHistory.push(
    `Label voided for Yard ${yardIndex} by ${firstname} on ${formattedDateTime}`
    );


// Save the updated order
await order.save();

res.status(200).json({ message: "Yard info updated successfully", order });
} catch (error) {
console.error("Error updating yard info:", error);
res.status(500).json({ message: "Error updating yard info", error: error.message });
}
});
// for voiding label in part from customer in replacement(esc)
app.put("/orders/voidLabelRepCust/:orderNo/:yardIndex", async (req, res) => {
const { orderNo, yardIndex } = req.params;
const { customerTrackingNumberReplacement, customerETAReplacement, customerShipperReplacement, customerShippingMethodReplacement, escRepCustTrackingDate} = req.body;
var firstname = req.query.firstName;
try {
// Fetch the order by order number
const order = await Order.findOne({ orderNo });
if (!order) {
return res.status(404).json({ message: "Order not found" });
}

// Check if the yard index is valid
if (!order.additionalInfo[yardIndex - 1]) {
return res.status(400).json({ message: "Invalid yard index" });
}

const yardData = order.additionalInfo[yardIndex - 1];

// Initialize history arrays if they don't exist
yardData.escRepTrackingHistoryCust = yardData.escRepTrackingHistoryCust || [];
yardData.escRepETAHistoryCust = yardData.escRepETAHistoryCust || [];
yardData.escRepShipperNameHistoryCust = yardData.escRepShipperNameHistoryCust || [];
yardData.escrepBOLhistoryCust = yardData.escrepBOLhistoryCust || [];

// Append current data to history arrays if it exists
if (Array.isArray(yardData.customerTrackingNumberReplacement)) {
const cleanedTrackingNo = yardData.customerTrackingNumberReplacement.map((number) => number.trim());
yardData.escRepTrackingHistoryCust.push(...cleanedTrackingNo); // Append cleaned tracking numbers
} else if (typeof yardData.customerTrackingNumberReplacement === "string" && yardData.customerTrackingNumberReplacement.trim() !== "") {
yardData.escRepTrackingHistoryCust.push(yardData.customerTrackingNumberReplacement.trim()); // Append single tracking number
}

if (yardData.customerETAReplacement) {
const cleanedEta = typeof yardData.customerETAReplacement === "string" ? yardData.customerETAReplacement.trim() : yardData.customerETAReplacement;
yardData.escRepETAHistoryCust.push(cleanedEta);
}

if (yardData.customerShipperReplacement) {
const cleanedShipperName = typeof yardData.customerShipperReplacement === "string" ? yardData.customerShipperReplacement.trim() : yardData.customerShipperReplacement;
yardData.escRepShipperNameHistoryCust.push(cleanedShipperName);
}
if (yardData.escRepCustTrackingDate) {
const cleanedescRepCustTrackingDate = typeof yardData.escRepCustTrackingDate === "string" ? yardData.escRepCustTrackingDate.trim() : yardData.escRepCustTrackingDate;
yardData.escrepBOLhistoryCust.push(cleanedescRepCustTrackingDate);
}
// Update current fields with new values or clear them
yardData.customerTrackingNumberReplacement = customerTrackingNumberReplacement || "";
yardData.customerETAReplacement = customerETAReplacement || "";
yardData.customerShipperReplacement = customerShipperReplacement || "";
yardData.escRepCustTrackingDate = "";
yardData.customerShippingMethodReplacement = customerShippingMethodReplacement || "";
// Add a label voided entry to the order history
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
order.orderHistory.push(
`Label voided for Part from customer part in replacement process(escalation) for Yard ${yardIndex} by ${firstname} on ${formattedDateTime}`
);


// Save the updated order
await order.save();

res.status(200).json({ message: "Yard info updated successfully", order });
} catch (error) {
console.error("Error updating yard info:", error);
res.status(500).json({ message: "Error updating yard info", error: error.message });
}
});

// for voiding label in part from yard in replacement(esc)
app.put("/orders/voidLabelRepYard/:orderNo/:yardIndex", async (req, res) => {
const { orderNo, yardIndex } = req.params;
const { yardTrackingNumber, yardTrackingETA, yardShipper, escRepYardTrackingdate, yardShippingMethod} = req.body;
var firstname = req.query.firstName;
try {
// Fetch the order by order number
const order = await Order.findOne({ orderNo });
if (!order) {
return res.status(404).json({ message: "Order not found" });
}
if (!order.additionalInfo[yardIndex - 1]) {
return res.status(400).json({ message: "Invalid yard index" });
}
const yardData = order.additionalInfo[yardIndex - 1];
// Initialize history arrays if they don't exist
yardData.escRepTrackingHistoryYard = yardData.escRepTrackingHistoryYard || [];
yardData.escRepETAHistoryYard = yardData.escRepETAHistoryYard || [];
yardData.escRepShipperNameHistoryYard = yardData.escRepShipperNameHistoryYard || [];
yardData.escrepBOLhistoryYard = yardData.escrepBOLhistoryYard || [];
// Append current data to history arrays if it exists
if (Array.isArray(yardData.yardTrackingNumber)) {
const cleanedTrackingNo = yardData.yardTrackingNumber.map((number) => number.trim());
yardData.escRepTrackingHistoryYard.push(...cleanedTrackingNo); 
} else if (typeof yardData.yardTrackingNumber === "string" && yardData.yardTrackingNumber.trim() !== "") {
yardData.escRepTrackingHistoryYard.push(yardData.yardTrackingNumber.trim()); 
}
if (yardData.yardTrackingETA) {
const cleanedEta = typeof yardData.yardTrackingETA === "string" ? yardData.yardTrackingETA.trim() : yardData.yardTrackingETA;
yardData.escRepETAHistoryYard.push(cleanedEta);
}
if (yardData.yardShipper) {
const cleanedShipperName = typeof yardData.yardShipper === "string" ? yardData.yardShipper.trim() : yardData.yardShipper;
yardData.escRepShipperNameHistoryYard.push(cleanedShipperName);
}
if (yardData.escRepYardTrackingdate) {
const cleanedescRepYardTrackingDate = typeof yardData.escRepYardTrackingdate === "string" ? yardData.escRepYardTrackingdate.trim() : yardData.escRepYardTrackingdate;
yardData.escrepBOLhistoryYard.push(cleanedescRepYardTrackingDate);
}
// Update current fields with new values or clear them
yardData.yardTrackingNumber = yardTrackingNumber || "";
yardData.yardTrackingETA = yardTrackingETA || "";
yardData.yardShipper = yardShipper || "";
yardData.escRepYardTrackingdate = "";
yardData.yardShippingMethod = "";
// Add a label voided entry to the order history
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
order.orderHistory.push(
`Label voided for Part from yard part in replacement process(escalation) for Yard ${yardIndex} by ${firstname} on ${formattedDateTime}`
);


// Save the updated order
await order.save();

res.status(200).json({ message: "Yard info updated successfully", order });
} catch (error) {
console.error("Error updating yard info:", error);
res.status(500).json({ message: "Error updating yard info", error: error.message });
}
});

// for voiding label in part from yard in replacement(esc)
app.put("/orders/voidLabelReturn/:orderNo/:yardIndex", async (req, res) => {
const { orderNo, yardIndex } = req.params;
const {returnTrackingCust, custretPartETA, escRetTrackingDate, customerShipperReturn, customerShippingMethodReturn } = req.body;
var firstname = req.query.firstName;
try {
// Fetch the order by order number
const order = await Order.findOne({ orderNo });
if (!order) {
return res.status(404).json({ message: "Order not found" });
}
if (!order.additionalInfo[yardIndex - 1]) {
return res.status(400).json({ message: "Invalid yard index" });
}
const yardData = order.additionalInfo[yardIndex - 1];
// Initialize history arrays if they don't exist
yardData.escReturnTrackingHistory = yardData.escReturnTrackingHistory || [];
yardData.escReturnETAHistory = yardData.escReturnETAHistory || [];
yardData.escReturnShipperNameHistory = yardData.escReturnShipperNameHistory || [];
yardData.escReturnBOLhistory = yardData.escReturnBOLhistory || [];
// Append current data to history arrays if it exists
if (Array.isArray(yardData.returnTrackingCust)) {
const cleanedTrackingNo = yardData.returnTrackingCust.map((number) => number.trim());
yardData.escReturnTrackingHistory.push(...cleanedTrackingNo); 
} else if (typeof yardData.returnTrackingCust === "string" && yardData.returnTrackingCust.trim() !== "") {
yardData.escReturnTrackingHistory.push(yardData.returnTrackingCust.trim()); 
}
if (yardData.custretPartETA) {
const cleanedEta = typeof yardData.custretPartETA === "string" ? yardData.custretPartETA.trim() : yardData.custretPartETA;
yardData.escReturnETAHistory.push(cleanedEta);
}
if (yardData.customerShipperReturn) {
const cleanedShipperName = typeof yardData.customerShipperReturn === "string" ? yardData.customerShipperReturn.trim() : yardData.customerShipperReturn;
yardData.escReturnShipperNameHistory.push(cleanedShipperName);
}
if (yardData.escRetTrackingDate) {
const cleanedescRetTrackingDate = typeof yardData.escRetTrackingDate === "string" ? yardData.escRetTrackingDate.trim() : yardData.escRetTrackingDate;
yardData.escrepBOLhistoryYard.push(cleanedescRetTrackingDate);
}
// Update current fields with new values or clear them
yardData.returnTrackingCust = returnTrackingCust || "";
yardData.custretPartETA = custretPartETA || "";
yardData.customerShipperReturn = customerShipperReturn || "";
yardData.escRetTrackingDate = escRetTrackingDate || "";
yardData.customerShippingMethodReturn = customerShippingMethodReturn || "";

// Add a label voided entry to the order history
const centralTime = moment().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
console.log('US Central Time:', centralTime);
const date = new Date(centralTime);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const formattedDate = `${day} ${month}, ${year}`;
const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
order.orderHistory.push(
`Label voided for Part from customer part in return process(escalation) Yard ${yardIndex} by ${firstname} on ${formattedDateTime}`
);


// Save the updated order
await order.save();

res.status(200).json({ message: "Yard info updated successfully", order });
} catch (error) {
console.error("Error updating yard info:", error);
res.status(500).json({ message: "Error updating yard info", error: error.message });
}
});
    
// Create a payment intent
app.post("/create-payment-intent", async (req, res) => {
try {
const { amount, currency } = req.body;
const paymentIntent = await stripe.paymentIntents.create({
amount: amount * 100, // Amount in cents (e.g., $10 = 1000)
currency: currency || "usd", // Default to USD
});
res.json({ clientSecret: paymentIntent.client_secret });
} catch (error) {
console.error("Error creating payment intent:", error.message);
res.status(500).json({ error: "Failed to create payment intent" });
}
});

// for more than two yards
app.get('/moreThanTwoYardsOrders', async (req, res) => {
  const { month, year, additionalInfoLength } = req.query;
  const filter = {
    "orderDate": { $regex: `${month}.*${year}` },
    "additionalInfo": { $exists: true },
    "additionalInfoLength": { $gt: parseInt(additionalInfoLength, 10) }
  };
  const orders = await db.collection('orders').find(filter).toArray();
  res.json(orders);
});
// createTask

app.post("/createTask", async (req, res) => {
  console.log(":inside create Task")
  const { orderNo, taskName, assignedTo, assignedBy, taskCreatedDate, deadline, taskDescription, taskStatus } = req.body;
console.log("orderNo",orderNo);
  try {
    const taskGroup = await TaskGroup.findOne({ orderNo });

    if (taskGroup) {
      // If orderNo exists, add the new task to the tasks array
      taskGroup.tasks.push({
        taskName,
        assignedTo,
        assignedBy,
        taskCreatedDate,
        deadline,
        taskDescription,
        taskStatus,
      });
      await taskGroup.save();
      res.status(200).json({ message: "Task added to existing order.", taskGroup });
    } else {
      // If orderNo doesn't exist, create a new document
      const newTaskGroup = new TaskGroup({
        orderNo,
        tasks: [
          {
            taskName,
            assignedTo,
            assignedBy,
            taskCreatedDate,
            deadline,
            taskDescription,
            taskStatus,
          },
        ],
      });
      await newTaskGroup.save();
      res.status(201).json({ message: "New order created with task.", newTaskGroup });
    }
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task." });
  }
});
// upload pictures to s3 bucket(order-specific)
app.post("/uploadToS3", upload.array("pictures"), async (req, res) => {
  const orderNo = req.query.orderNo || req.body.orderNo;
  const files = req.files;

  console.log("Uploading to S3 for orderNo:", orderNo);
  if (!orderNo || !files || files.length === 0) {
    return res.status(400).send("Order No and pictures are required.");
  }

  try {
    const order = await Order.findOne({ orderNo: orderNo });
    if (!order) {
      return res.status(404).send("Order not found.");
    }

    const imageUrls = [];

    for (const file of files) {
      const fileKey = `${orderNo}/${Date.now()}_${path.basename(file.originalname)}`;

      // Upload to S3
      await s3.upload({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }).promise();

      const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
      imageUrls.push(imageUrl);  // Collect URLs to send to the frontend
      order.images.push({ url: imageUrl });
    }

    // Save the order document
    await order.save();

    // Return the uploaded image URLs
    res.status(200).json({ uploadedImages: imageUrls });
  } catch (error) {
    console.error("Error uploading to S3 or saving to DB:", error);
    res.status(500).send("Failed to upload pictures.");
  }
});

// Add a new part
app.post("/addNewPart", async (req, res) => {
  console.log("adding new part");
  const { name } = req.body;
  if (!name) {
      return res.status(400).json({ error: "Part name is required" });
  }
  try {
      const existingPart = await Part.findOne({ name: name.trim() });
      if (existingPart) {
          return res.status(400).json({ error: "Part already exists" });
      }
      const newPart = new Part({ name: name.trim() });
      await newPart.save();
      res.status(201).json(newPart);
  } catch (error) {
      res.status(500).json({ error: "Server error while adding new part" });
  }
});

