const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Test pdf-parse on startup
console.log('🔍 PDF-Parse check:', typeof pdfParse === 'function' ? '✅ Working' : '❌ Not a function');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ============================================
// COPYLEAKS AUTHENTICATION
// ============================================
let authToken = null;
let tokenExpiry = null;

async function getCopyleaksToken() {
  // Return cached token if still valid (with 5 min buffer)
  if (authToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    console.log('✅ Using cached Copyleaks token');
    return authToken;
  }

  try {
    console.log('🔐 Authenticating with Copyleaks...');
    const response = await axios.post('https://id.copyleaks.com/v3/account/login/api', {
      email: process.env.COPYLEAKS_EMAIL,
      key: process.env.COPYLEAKS_API_KEY
    });

    authToken = response.data.access_token;
    // Copyleaks tokens last 48 hours
    tokenExpiry = Date.now() + (48 * 60 * 60 * 1000);
    
    console.log('✅ Copyleaks authentication successful');
    return authToken;
  } catch (error) {
    console.error('❌ Copyleaks authentication failed:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
}

// ============================================
// IMAGE DETECTION ENDPOINT
// ============================================
app.post('/api/detect/image', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Received image detection request');

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`🔍 Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

    // Get authentication token
    const token = await getCopyleaksToken();

    // Prepare Copyleaks request body
    const requestBody = {
      base64: base64Image,
      filename: req.file.originalname,
      sandbox: process.env.COPYLEAKS_SANDBOX === 'true',
      model: 'ai-image-1-ultra'
    };

    console.log('📤 Sending to Copyleaks:', {
      scanId,
      filename: req.file.originalname,
      base64Length: base64Image.length,
      sandbox: requestBody.sandbox,
      model: requestBody.model
    });

    // Call Copyleaks AI Image Detection API
    const copyleaksResponse = await axios.post(
      `https://api.copyleaks.com/v1/ai-image-detector/${scanId}/check`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('✅ Copyleaks response received');

    // Transform Copyleaks response to match frontend expectations
    const data = copyleaksResponse.data;
    
    // Copyleaks returns decimals (0.0-1.0), convert to percentages
    const humanPercent = Math.round((data.summary?.human || 0) * 100);
    const aiPercent = Math.round((data.summary?.ai || 0) * 100);

    const result = {
      ai_probability: aiPercent,
      human_probability: humanPercent,
      model: data.model || 'ai-image-1-ultra',
      scanId: scanId,
      timestamp: new Date().toISOString(),
      imageInfo: data.imageInfo,
      // Include RLE mask data if needed for visualization
      result: data.result
    };

    console.log(`📊 Results: AI=${aiPercent}%, Human=${humanPercent}%`);
    res.json(result);

  } catch (error) {
    console.error('❌ Image detection error:', error.response?.data || error.message);
    
    // Log full error details for debugging
    if (error.response?.data?.error?.details) {
      console.error('📋 Error details:', JSON.stringify(error.response.data.error.details, null, 2));
    }
    
    // Return detailed error information
    const errorResponse = {
      error: 'Image detection failed',
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error?.details || null,
      copyleaksError: error.response?.data || null
    };

    res.status(error.response?.status || 500).json(errorResponse);
  }
});

// ============================================
// DOCUMENT DETECTION ENDPOINT (DOCX, PDF, TXT)
// ============================================
app.post('/api/detect/document', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Received document detection request');

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`🔍 Processing document: ${req.file.originalname} (${req.file.size} bytes)`);

    let extractedText = '';

    // Extract text based on file type
    if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        req.file.originalname.endsWith('.docx')) {
      // DOCX file - extract text using mammoth
      console.log('📄 Extracting text from DOCX...');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
      console.log(`✅ Extracted ${extractedText.length} characters from DOCX`);
    } 
    else if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      // PDF file - extract text using pdf-parse
      console.log('📄 Extracting text from PDF...');
      try {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
        console.log(`✅ Extracted ${extractedText.length} characters from PDF (${pdfData.numpages} pages)`);
      } catch (pdfError) {
        console.error('❌ PDF parsing error:', pdfError.message);
        return res.status(500).json({ 
          error: 'PDF parsing failed',
          message: 'Could not extract text from PDF: ' + pdfError.message
        });
      }
    }
    else if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
      // Plain text file
      console.log('📄 Reading plain text file...');
      extractedText = req.file.buffer.toString('utf8');
      console.log(`✅ Read ${extractedText.length} characters from TXT`);
    }
    else {
      // Unsupported format
      return res.status(400).json({ 
        error: 'Unsupported file format',
        message: 'Please upload .docx, .pdf, or .txt files',
        supportedFormats: ['.docx', '.pdf', '.txt']
      });
    }

    // Check if we got any text
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'No text found',
        message: 'The document appears to be empty or text could not be extracted'
      });
    }

    // Check minimum length requirement (Copyleaks requires 255 characters minimum)
    const MIN_TEXT_LENGTH = 255;
    if (extractedText.trim().length < MIN_TEXT_LENGTH) {
      return res.status(400).json({ 
        error: 'Text too short',
        message: `Document must contain at least ${MIN_TEXT_LENGTH} characters. Found: ${extractedText.trim().length} characters.`,
        extractedLength: extractedText.trim().length,
        minimumRequired: MIN_TEXT_LENGTH,
        suggestion: 'Please upload a document with more content for accurate AI detection.'
      });
    }

    console.log(`📝 Sending ${extractedText.length} characters to Copyleaks...`);

    const scanId = `scan-doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const token = await getCopyleaksToken();

    // Call Copyleaks Writer Detector API with extracted text
    const copyleaksResponse = await axios.post(
      `https://api.copyleaks.com/v2/writer-detector/${scanId}/check`,
      {
        text: extractedText,
        sandbox: process.env.COPYLEAKS_SANDBOX === 'true'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for documents
      }
    );

    console.log('✅ Copyleaks document response received');

    const data = copyleaksResponse.data;
    
    // Transform response
    const humanPercent = Math.round((data.summary?.human || 0) * 100);
    const aiPercent = Math.round((data.summary?.ai || 0) * 100);
    const mixedPercent = Math.round((data.summary?.mixed || 0) * 100);

    const result = {
      ai_probability: aiPercent,
      human_probability: humanPercent,
      mixed_probability: mixedPercent,
      scanId: scanId,
      timestamp: new Date().toISOString(),
      documentInfo: {
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        textLength: extractedText.length,
        wordCount: extractedText.split(/\s+/).filter(w => w.length > 0).length
      }
    };

    console.log(`📊 Document Results: AI=${aiPercent}%, Human=${humanPercent}%, Mixed=${mixedPercent}%`);
    res.json(result);

  } catch (error) {
    console.error('❌ Document detection error:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.details) {
      console.error('📋 Error details:', JSON.stringify(error.response.data.error.details, null, 2));
    }
    
    res.status(error.response?.status || 500).json({
      error: 'Document detection failed',
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error?.details || null,
      copyleaksError: error.response?.data || null
    });
  }
});

// ============================================
// TEXT DETECTION ENDPOINT
// ============================================
app.post('/api/detect/text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Check minimum length requirement
    const MIN_TEXT_LENGTH = 255;
    if (text.trim().length < MIN_TEXT_LENGTH) {
      return res.status(400).json({ 
        error: 'Text too short',
        message: `Text must contain at least ${MIN_TEXT_LENGTH} characters. Found: ${text.trim().length} characters.`,
        extractedLength: text.trim().length,
        minimumRequired: MIN_TEXT_LENGTH
      });
    }

    const scanId = `scan-text-${Date.now()}`;
    const token = await getCopyleaksToken();

    // Call Copyleaks AI Text Detection API
    const copyleaksResponse = await axios.post(
      `https://api.copyleaks.com/v2/writer-detector/${scanId}/check`,
      {
        text: text,
        sandbox: process.env.COPYLEAKS_SANDBOX === 'true'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = copyleaksResponse.data;
    
    // Transform response
    const result = {
      ai_probability: Math.round((data.summary?.ai || 0) * 100),
      human_probability: Math.round((data.summary?.human || 0) * 100),
      mixed_probability: Math.round((data.summary?.mixed || 0) * 100),
      scanId: scanId,
      timestamp: new Date().toISOString(),
      details: data
    };

    res.json(result);

  } catch (error) {
    console.error('❌ Text detection error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Text detection failed',
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error?.details || null
    });
  }
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Copyleaks AI Detection Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  🚀 Copyleaks Detection Server Running   ║
║  📍 http://localhost:${PORT}                ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  Endpoints:                               ║
║  • POST /api/detect/image                 ║
║  • POST /api/detect/document              ║
║  • POST /api/detect/text                  ║
║  • GET  /api/health                       ║
╚═══════════════════════════════════════════╝
  `);
  
  // Test authentication on startup
  getCopyleaksToken()
    .then(() => console.log('✅ Initial Copyleaks authentication successful'))
    .catch(err => console.error('❌ Initial authentication failed:', err.message));
});