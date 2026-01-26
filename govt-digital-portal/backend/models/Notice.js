const mongoose = require('mongoose');

const noticeSchema = mongoose.Schema({
    noticeNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    attachmentUrl: { type: String },
    tags: [String],
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentTo: [{
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
        status: {
            type: String,
            enum: ['sent', 'viewed', 'replied', 'approved', 'rejected', 'clarification'],
            default: 'sent'
        },
        replyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reply' },
        viewedAt: Date,
        updatedAt: Date
    }]
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
