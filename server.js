const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// ⚡ SERVERLESS DATABASE CONNECTION FUNCTION
let isConnected = false;
async function connectToDatabase() {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  // Vercel ke environment variables ko read karega, agar nahi milenge toh fallback string chalegi
  const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://akshitatiwari2805_db_user:akshita28@cluster0.jblqvkw.mongodb.net/gurukul?appName=Cluster0';

  console.log('=> Connecting to database...');
  try {
    const db = await mongoose.connect(dbUri);
    isConnected = db.connections[0].readyState;
    console.log('MongoDB Connected successfully!');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    throw err;
  }
}

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

// Vercel serverless optimization for models
const File = mongoose.models.File || mongoose.model('File', fileSchema);

// 4. Routes with Database Connection Check

// Upload Route
app.post('/api/upload', async (req, res, next) => {
  try {
    await connectToDatabase(); // Pehle connection check karega
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
}, upload.single('file'), async (req, res) => {
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
    await connectToDatabase(); // Pehle connection check karega
    const files = await File.find().sort({ createdAt: -1 });
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// For Vercel Serverless Export
module.exports = app;

const PORT = process.env.PORT || 10000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server live on port ${PORT}`);
  });
}