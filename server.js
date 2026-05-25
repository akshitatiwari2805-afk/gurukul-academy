
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ================= LOCAL DATABASE INSTANCE (No Internet Required!) =================
let databaseMockFiles = [
    { name: "Syllabus Core Blueprint Overview.pdf", url: "/uploads/default-sample.pdf", date: "Verified Admin Content" }
];

// 1. Storage setup configuration (Multer)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// ================= API ROUTES FOR SCRIPT.JS CONNECTION =================

// API 1: Saari uploaded files ki list frontend ko bhejna
app.get('/api/files', (req, res) => {
    res.json(databaseMockFiles);
});

// API 2: Frontend se nayi file receive karke save karna
app.post('/api/upload', upload.single('pdfFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const newFile = {
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        date: "Just Now • Student Upload"
    };

    databaseMockFiles.unshift(newFile); // List me sabse upar add karein
    res.json({ success: true, file: newFile });
});

app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 GURUKUL BACKEND IS COMPLETELY ACTIVE AND READY!`);
    console.log(`📡 Listening smoothly at: http://localhost:${PORT}`);
    console.log(`=======================================================`);
});