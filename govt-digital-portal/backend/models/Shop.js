const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
