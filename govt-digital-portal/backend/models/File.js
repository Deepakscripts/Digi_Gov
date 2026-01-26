const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['file', 'folder'], required: true },
    extension: String,
    url: String,
    size: Number,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWithAdmin: { type: Boolean, default: false },
    remarks: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
