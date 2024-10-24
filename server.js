const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");   
const nodemailer = require("nodemailer");
const fs = require("fs");
const moment = require('moment-timezone');
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
require("dotenv").config();
const OrderNumber = require("./backend/models/OrderNo");
// console.log(OrderNumber)

const User = require("./backend/models/User"); // Import User model
const Team = require("./backend/models/Team"); // Import Team model
const { url } = require("inspector");
const { getMaxListeners } = require("events");

const port = 3000;
const app = express();

app.use(cors({
origin: 'https://spotops360.com', // Replace with your frontend's domain
methods: 'GET,POST,PUT,DELETE,OPTIONS',
credentials: true
}));
// to handle unknown paths
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
orderStatus,
vin,
last4digits,
notes,
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
orderStatus,
vin,
last4digits,
notes,
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
var orderId = newOrder.orderNo;
// console.log("orderNo",orderId);
await generateInvoice(orderId, newOrder);
res.status(201).json({ newOrder, team: newOrder.team });
} catch (error) {
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
address: String,
country:String,
partPrice: Number,
shippingDetails: String,
others: String,
status: String,
paymentStatus: String,
refundStatus:String,
refundedAmount: Number,
trackingNo: String ,
faxNo: String,
eta: String,
shipperName: String,
trackingLink:String,
escalationCause: String,
escalationProcess: String,
notes: [String],
poSentDate: String,
escalationDate: String,
labelCreationDate: String,
escTicked:String,
partDeliveredDate:String,
stockNo: String,
warranty: Number,
// for replacement__part from customer
custReason: String,
customerShippingMethodReplacement: String,
customerShipperReplacement: String,
customerTrackingNumberReplacement: String,
custOwnShipReplacement: String,
// part from yard
yardShippingStatus: String,
yardShippingMethod: String,
yardShipper: String,
yardTrackingNumber: String,
yardOwnShipping: String,
// return__part from customer
customerShippingMethodReturn: String,
customerShipperReturn: String,
custOwnShippingReturn: String,
returnTrackingCust: String,
custReturnDelivery: String,
// reimburesement part
reimbursementAmount: String,
isReimbursedChecked: String,
},
{strict:false}
);
const Yard = mongoose.model('Yard', additionalInfoSchema);
// Cancelled Orders Schema
const CancelledOrderSchema = new mongoose.Schema({
orderNo: String,
orderDate: String,
salesAgent: String,
customerName: String,
bAddress: String,
sAddress: String,
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
orderStatus: String,
vin: String,
last4digits: String,
additionalInfo: [additionalInfoSchema],
trackingInfo: String,
orderHistory: [String],
notes: [String],
isCancelled: { type: Boolean, default: false },
teamOrder:String,
actualGP:Number,
supportNotes:[String]

});

const CancelledOrder = mongoose.model("CancelledOrder", CancelledOrderSchema);

const OrderSchema = new mongoose.Schema({
orderNo: String,
orderDate: String,
salesAgent: String,
customerName: String,
customerApprovedDate: String,
bAddress: String,
sAddress: String,
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
disputedDate: String ,  
disputeReason: String,
custRefundDate: String,
custRefundedAmount: Number,
cancelledDate: String,
cancelledRefAmount:Number
});

const Order = mongoose.model("Order", OrderSchema);

app.get("/orders", async (req, res) => {
const orders = await Order.find({});
res.json(orders);
});
// for cancelled refunds
app.put('/cancelledRefund', async (req, res) => {
  console.log("put request for cancelledRefund");
  // const { orderNo } = req.params;
  const { cancelledDate, cancelledRefAmount , orderNo} = req.body;
  console.log("Cancelled:", cancelledDate,cancelledRefAmount, "OrderNo:", orderNo);
  
  try {
  const order = await Order.findOneAndUpdate(
  { orderNo: orderNo }, 
  { 
    cancelledDate: cancelledDate,
  cancelledRefAmount:cancelledRefAmount
  },
  { new: true }  
  );
  if (!order) {
  return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
  } catch (error) {
  console.error('Error updating cancelledRefund information:', error);
  res.status(500).json({ message: 'Server error' });
  }
  });
app.get("/orders/:orderNo", async (req, res) => {
const order = await Order.findOne({ orderNo: req.params.orderNo });
res.json(order);
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
console.log("update yard statuses and dates")  
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
const firstName = req.query.firstName; 
const status = req.body.status; 
const paymentStatus = req.body.paymentStatus;
const refundStatus = req.body.refundStatus;
order.orderHistory.push(`Yard ${yardIndex + 1} ${status || paymentStatus || refundStatus} updated by ${firstName} on ${formattedDateTime}`);
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

  try {
    const updateData = req.body; 
    console.log("updatedData", updateData);
    const orderNo = updateData.orderNo;  // Corrected to use orderNo as the field name
    const order = await Order.findOne({ orderNo });  // Corrected to query by orderNo
    const yardIndex = updateData.yardIndex;
    const actualYardIndex = yardIndex - 1;
    console.log("Order found:", "orderNo:", order.orderNo);
    console.log("Yard index:", actualYardIndex);
    if (!order) return res.status(404).send("Order not found");
    if (actualYardIndex >= 0 && actualYardIndex < order.additionalInfo.length) {
      const yardInfo = order.additionalInfo[actualYardIndex];
      console.log("Existing yard info:", yardInfo);
      for (const key in req.body) {
        if (req.body.hasOwnProperty(key)) {
          yardInfo[key] = req.body[key];
        }
      }
      order.additionalInfo[actualYardIndex] = yardInfo;
      const firstName = req.query.firstName;
      const escProcess = updateData.escalationProcess || "";
      const customerShippingMethod = updateData.customerShippingMethod || "";
      const customerShipper = updateData.customerShipper || "";
      const customerTrackingNumber = updateData.customerTrackingNumber || "";
      const custOwnShipping = updateData.custOwnShipping || "";
      const yardShippingStatus = updateData.yardShippingStatus || "";
      const yardShippingMethod = updateData.yardShippingMethod || "";
      const yardShipper = updateData.yardShipper || "";
      const yardTrackingNumber = updateData.yardTrackingNumber || "";
      order.orderHistory.push(
        `Escalation Process: ${escProcess || customerShippingMethod || customerShippingMethod || customerShippingMethod  || customerShipper  || customerTrackingNumber   || custOwnShipping || yardShippingStatus || yardShippingMethod || yardShipper || yardTrackingNumber} updated by ${firstName} on ${formattedDateTime}`
      );
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

const mailOptions = {
from: "service@50starsautoparts.com",
// to: order.email,
to: "dipsikha.spotopsdigital@gmail.com",
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
console.log(`Server is running on ${port}`);
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
// text: `50STARS${orderNo.toString().padStart(4, "0")}`,
text:`${orderNo}`,
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
user: "service@50starsautoparts.com",
pass: "hweg vrnk qyxx gktv",
},
});

const mailOptions = {
from: "service@50starsautoparts.com",
// to: `${order.email}`,
to: `dipsikha.spotopsdigital@gmail.com`,
subject: `Tracking Details / Order No. ${req.params.orderNo}`,
html: `<p>Hi ${order.customerName},</p>
<p>This email is regarding the order you placed with 50 stars auto parts, and we have attached the tracking information in the same email along with a link that will take you directly to the tracking page.</p>
<p>If the ETA is not updated in the system, it may take 24 hours to reflect on the tracking website; you may check again if you do not find the ETA.</p>
<p>Please call us if you have any questions.</p>
<p>${shipperName} - ${trackingNo}</p>
<p>ETA - ${eta} days</p>
<p>Link - <a href="${link}">${link}</a></p>
<p><img src="https://assets-autoparts.s3.ap-south-1.amazonaws.com/images/logo.png" alt="logo" style="max-width: 100%; height: auto;"></p>
<p>Customer Service Team<br>50 STARS AUTO PARTS<br>+1 (888) 666-7770<br>service@50starsautoparts.com<br>www.50starsautoparts.com</p>`,
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
    res.status(200).json(additionalInfo);
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
const { disputedDate, disputeReason } = req.body;
console.log("Disputes:", disputedDate, disputeReason, "OrderNo:", orderNo);

try {
const order = await Order.findOneAndUpdate(
{ orderNo: orderNo }, 
{ 
disputedDate: disputedDate, 
disputeReason: disputeReason 
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
    cancelledRefAmount 
  } = req.body;

  console.log(
    "Refunds:", custRefundDate, custRefundedAmount, 
    "Cancellations:", cancelledDate, cancelledRefAmount, 
    "OrderNo:", orderNo
  );

  try {
    const updateFields = {};
    if (custRefundDate) updateFields.custRefundDate = custRefundDate;
    if (custRefundedAmount) updateFields.custRefundedAmount = custRefundedAmount;
    if (cancelledDate) updateFields.cancelledDate = cancelledDate;
    if (cancelledRefAmount) updateFields.cancelledRefAmount = cancelledRefAmount;

    const order = await Order.findOneAndUpdate(
      { orderNo: orderNo },
      { $set: updateFields },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating refund or cancellation information:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



const moment = require('moment-timezone');


app.get('/orders/monthly', async (req, res) => {
console.log("monthly orders");
try {
const orders = await Order.aggregate([
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
format: "%d %b, %Y %H:%M", // Adjust format after removing suffix
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

const formattedOrders = orders.map(order => ({
month: order._id,
totalOrders: order.totalOrders,
}));

res.json(formattedOrders);
} catch (error) {
res.status(500).json({ message: 'Error fetching monthly orders', error });
}
});
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
