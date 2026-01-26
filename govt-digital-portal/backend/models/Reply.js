const mongoose = require('mongoose');

const replySchema = mongoose.Schema({
    noticeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notice', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    message: { type: String },
    attachmentUrl: { type: String },
    adminRemarks: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'clarification'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Reply', replySchema);
