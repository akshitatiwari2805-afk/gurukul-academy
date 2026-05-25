const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Middleware Configuration
app.use(cors());
app.use(express.json());

// Upload Local Directory Setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ==========================================
// 🗄️ MONGODB SCHEMA & MODEL CONFIGURATION
// ==========================================
const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

// Multer Disk Storage Engine for PDF Files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// ==========================================
// 📤 API ROUTE: UPLOAD FILE TO MONGO DB
// ==========================================
app.post('/api/upload', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Koi file select nahi ki gayi!' });
        }

        // Real MongoDB Cloud document parameters
        // Student ke laptop/phone me offline file download karwane ke liye live path
        const newNote = new Note({
            title: req.body.title || 'Untitled Document',
            fileName: req.file.filename,
            filePath: `https://gurukul-academy-p4yx.onrender.com/uploads/${req.file.filename}`
        }); // 🎯 UPDATED: Bracket safely closed here!

        await newNote.save(); // Saved permanently to Cloud Database
        res.json({ success: true, file: newNote });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server upload error!', error: error.message });
    }
});

// ==========================================
// 📥 API ROUTE: FETCH ALL FILES FROM CLOUD
// ==========================================
app.get('/api/fetch', async (req, res) => {
    try {
        // Fetch logs directly from Atlas Cluster (Latest entries on top)
        const allFiles = await Note.find().sort({ uploadedAt: -1 });
        res.json(allFiles);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database query failed!', error: error.message });
    }
});

// Serve uploads folder as live static assets directory
app.use('/uploads', express.static(uploadDir));

// ==========================================
// 📡 SERVER STARTUP ENGINE CONTROL
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 GURUKUL BACKEND IS COMPLETELY ACTIVE!`);
    console.log(`📡 Listening smoothly at: http://localhost:${PORT}`);
});

// MongoDB Atlas Cloud String
mongoose.connect('mongodb+srv://akshitatiwari2805_db_user:akshitatiwari%40mango@cluster0.jblqvkw.mongodb.net/gurukul_db?retryWrites=true&w=majority')
  .then(() => {
    console.log('🎉 Gurukul Database Connected Successfully to MongoDB Atlas Cloud!\n');
  })
  .catch((err) => {
    console.log('❌ Database connection me error aaya bhai:', err);
  });