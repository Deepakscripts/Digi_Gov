const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const Reply = require('../models/Reply');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get notices
router.get('/', protect, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const notices = await Notice.find({})
                .populate('sentTo.shopId', 'shopName')
                .sort({ createdAt: -1 });
            res.json(notices);
        } else {
            if (!req.user.shopId) return res.status(400).json({ message: "No shop linked" });
            const notices = await Notice.find({ "sentTo.shopId": req.user.shopId })
                .sort({ createdAt: -1 });
            res.json(notices);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Notice (Admin)
router.post('/', protect, adminOnly, upload.single('document'), async (req, res) => {
    const { title, description, shopIds, noticeNumber } = req.body;
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let ids = [];
    try {
        ids = shopIds ? JSON.parse(shopIds) : [];
    } catch (e) {
        ids = [shopIds];
    }

    try {
        const sentTo = ids.map(id => ({
            shopId: id,
            status: 'sent'
        }));

        const notice = await Notice.create({
            noticeNumber,
            title,
            description,
            attachmentUrl,
            sentBy: req.user.id,
            sentTo
        });

        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark as viewed (Shop)
router.put('/:id/view', protect, async (req, res) => {
    try {
        await Notice.updateOne(
            { _id: req.params.id, "sentTo.shopId": req.user.shopId },
            {
                $set: {
                    "sentTo.$.status": 'viewed',
                    "sentTo.$.viewedAt": new Date()
                }
            }
        );
        res.json({ message: 'Marked as viewed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Shop Reply
router.post('/reply', protect, upload.single('document'), async (req, res) => {
    const { noticeId, message } = req.body;
    const attachmentUrl = req.file ? `/uploads++/${req.file.filename}` : null;

    try {
        const reply = await Reply.create({
            noticeId,
            shopId: req.user.shopId,
            message,
            attachmentUrl
        });

        await Notice.updateOne(
            { _id: noticeId, "sentTo.shopId": req.user.shopId },
            {
                $set: {
                    "sentTo.$.status": 'replied',
                    "sentTo.$.replyId": reply._id,
                    "sentTo.$.updatedAt": new Date()
                }
            }
        );

        res.status(201).json(reply);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Status (Admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
    const { shopId, status, remarks } = req.body;

    try {
        // Update Notice Status
        await Notice.updateOne(
            { _id: req.params.id, "sentTo.shopId": shopId },
            {
                $set: {
                    "sentTo.$.status": status,
                    "sentTo.$.updatedAt": new Date()
                }
            }
        );

        // Update Reply Status and Remarks
        const notice = await Notice.findById(req.params.id);
        const target = notice.sentTo.find(s => s.shopId.toString() === shopId);
        if (target && target.replyId) {
            await Reply.findByIdAndUpdate(target.replyId, {
                status: status,
                adminRemarks: remarks
            });
        }

        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Replies for a notice
router.get('/:id/replies', protect, adminOnly, async (req, res) => {
    try {
        const replies = await Reply.find({ noticeId: req.params.id }).populate('shopId', 'shopName');
        res.json(replies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
