const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    estcostP: Number,
    estshippingFee: Number,
    salestax: Number,
    estgrossProfit: Number,
    orderStatus: String,
    vin: String,
    last4digits: String,
    notes:String,
    additionalInfo: Array,
    trackingInfo: String,
    notes: String,
    orderHistory: [String],
    team: { type: String, enum: ['Mark', 'Sussane'], required: true },
    isCancelled: { type: Boolean, default: false },
    isOrdered:{ type: String, enum : ['Mark', 'Sussane'],required: true},
    teamOrder: { type: String },
    actualGP:Number 
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
