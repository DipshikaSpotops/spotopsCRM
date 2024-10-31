const mongoose = require('mongoose');

const orderNoSchema = new mongoose.Schema({
  latestOrderNo: {
    type: String,
    required: true,
    default: '50STARS0000'
  }
});

// Check if the model is already compiled
const OrderNo = mongoose.models.OrderNo || mongoose.model('OrderNo', orderNoSchema);
console.log("orderNo",OrderNo);
module.exports = OrderNo;
