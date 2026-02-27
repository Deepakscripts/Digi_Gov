const express = require('express');
const router = express.Router();
const File = require('../models/File');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const s3Client = require('../config/r2');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

// Get My Files
router.get('/', protect, async (req, res) => {
    const parentId = req.query.parentId || null;
    // Handing "null" string from query params if passed as string "null"
    const pid = parentId === 'null' ? null : parentId;

    try {
        const files = await File.find({ owner: req.user.id, parentId: pid }).sort({ type: 1, name: 1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload Files (Bulk) to R2
router.post('/upload', protect, upload.array('files'), async (req, res) => {
    const { parentId } = req.body;
    const pid = parentId === 'null' ? null : parentId;

    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    try {
        const uploadedFiles = [];
        for (const file of req.files) {
            const fileName = `uploads/${Date.now()}-${file.originalname}`;

            const uploadParams = {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            await s3Client.send(new PutObjectCommand(uploadParams));

            const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

            const newFile = await File.create({
                name: file.originalname,
                type: 'file',
                extension: path.extname(file.originalname),
                url: fileUrl,
                size: file.size,
                owner: req.user.id,
                parentId: pid
            });
            uploadedFiles.push(newFile);
        }
        res.status(201).json(uploadedFiles);
    } catch (error) {
        console.error('R2 Upload Error:', error);
        res.status(500).json({ message: 'Error uploading to Cloudflare R2' });
    }
});

// Create Folder
router.post('/folder', protect, async (req, res) => {
    const { name, parentId } = req.body;
    const pid = parentId === 'null' ? null : parentId;
    try {
        const folder = await File.create({
            name,
            type: 'folder',
            owner: req.user.id,
            parentId: pid
        });
        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rename or Update File (Name, Remarks)
router.put('/:id', protect, async (req, res) => {
    const { name, remarks } = req.body;
    try {
        const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
        if (file) {
            if (name) file.name = name;
            if (remarks !== undefined) file.remarks = remarks;
            await file.save();
            res.json(file);
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Breadcrumb Path
router.get('/path/:id', protect, async (req, res) => {
    try {
        const path = [];
        let currentId = req.params.id;

        // Safety limit for recursion
        for (let i = 0; i < 10; i++) {
            if (!currentId || currentId === 'null') break;
            const folder = await File.findById(currentId);
            if (!folder) break;

            path.unshift(folder);
            currentId = folder.parentId;
        }
        res.json(path);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const deleteFolderRecursive = async (folderId, userId) => {
    const children = await File.find({ parentId: folderId, owner: userId });
    for (const child of children) {
        if (child.type === 'folder') {
            await deleteFolderRecursive(child._id, userId);
        }
        await File.deleteOne({ _id: child._id });
    }
};

router.delete('/:id', protect, async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
        if (file) {
            if (file.type === 'folder') {
                await deleteFolderRecursive(file._id, req.user.id);
            }
            await file.deleteOne();
            res.json({ message: 'Deleted' });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search Files and Folders
router.get('/search', protect, async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);

    try {
        const files = await File.find({
            owner: req.user.id,
            name: { $regex: query, $options: 'i' }
        }).sort({ type: 1, name: 1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to extract the R2 key from a file URL
// Handles both properly formatted URLs and legacy URLs with 'undefined' prefix
// Expected key format: 'uploads/timestamp-filename'
const extractR2Key = (fileUrl) => {
    // Handle null, undefined, or non-string inputs
    if (!fileUrl || typeof fileUrl !== 'string') {
        return '';
    }
    
    // Look for the 'uploads/' prefix which is the expected key format for this application
    // Match '/uploads/' or start with 'uploads/' to avoid matching in domain names
    const uploadsMatch = fileUrl.match(/(?:^|\/)uploads\/.+$/);
    if (uploadsMatch) {
        // Extract just the 'uploads/...' part
        const match = uploadsMatch[0];
        return match.startsWith('/') ? match.substring(1) : match;
    }
    
    // Fallback: try URL parsing for other URL formats
    try {
        const urlObj = new URL(fileUrl);
        return urlObj.pathname.substring(1);
    } catch {
        // If all else fails, return the original (will likely fail at R2 level)
        return fileUrl;
    }
};

// Proxy Download - Fetch file from R2 and serve (Bypasses CORS)
router.get('/download/:id', protect, async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
        if (!file || file.type === 'folder') {
            return res.status(404).json({ message: 'File not found' });
        }

        // Extract the key from the file URL (handles legacy 'undefined/uploads/...' URLs)
        const key = extractR2Key(file.url);

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);

        // Set headers for download
        res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
        res.setHeader('Content-Length', response.ContentLength);

        // Pipe the stream to response
        response.Body.pipe(res);
    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
});

// Proxy View - Fetch file from R2 and serve inline (for preview - Bypasses CORS)
router.get('/view/:id', protect, async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
        if (!file || file.type === 'folder') {
            return res.status(404).json({ message: 'File not found' });
        }

        // Extract the key from the file URL (handles legacy 'undefined/uploads/...' URLs)
        const key = extractR2Key(file.url);

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);

        // Set headers for inline viewing
        res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
        res.setHeader('Content-Length', response.ContentLength);

        // Pipe the stream to response
        response.Body.pipe(res);
    } catch (error) {
        console.error('View Error:', error);
        res.status(500).json({ message: 'Error viewing file' });
    }
});

module.exports = router;

