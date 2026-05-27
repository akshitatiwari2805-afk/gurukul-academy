const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ FIXED: Sahi mongodb+srv connection string bina shard ke jhanjhat ke
mongoose.connect('mongodb+srv://akshitatiwari2805:akshi123@cluster0.p4yx.mongodb.net/gurukul?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB Connected & Cloudinary Linked Permanent!'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// 1. Cloudinary Setup
cloudinary.config({
  cloud_name: 'dki9p3gi6', 
  api_key: '934349118624737', 
  api_secret: 'GMREtveY64pWS7qXSs0oDt8X4Ns' 
});

// 2. Cloud Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gurukul_notes', 
    resource_type: 'auto',   
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
  },
});

const upload = multer({ storage: storage });

// 3. Database Schema
const fileSchema = new mongoose.Schema({
  title: String,       
  subject: String,     
  classLevel: String,  
  name: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

// 4. Routes
// Upload Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const newFile = new File({
      title: req.body.title || req.file.originalname,
      subject: req.body.subject,
      classLevel: req.body.classLevel,
      name: req.file.originalname,
      url: req.file.path 
    });
    
    await newFile.save();
    res.json({ success: true, file: newFile });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch Route
app.get('/api/fetch', async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// For Vercel Serverless Export
module.exports = app;

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});