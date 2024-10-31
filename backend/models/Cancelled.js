const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CancelledOrderSchema = new Schema({
    orderNo: Number,
    orderDate: Date,
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
    vin: String,
    issueOrder: String,
    additionalInfo: Array,
    trackingInfo: String,
    orderHistory: Array,
    cancelledAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CancelledOrder', CancelledOrderSchema);
