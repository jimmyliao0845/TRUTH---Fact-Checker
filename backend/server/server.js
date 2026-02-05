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
// CREDIT & USAGE TRACKING SYSTEM
// ============================================
const creditManager = {
  // Configure based on your Copyleaks plan
  totalMonthlyCredits: 98, // UPDATE THIS: Total credits per month from your plan
  maxUsagePercent: 80, // Use only 80% of credits as safety buffer
  
  // Credit costs per scan type (adjust based on Copyleaks pricing)
  costs: {
    text: 1,      // Cost per text scan
    document: 1,  // Cost per document scan
    image: 2      // Cost per image scan (usually costs more)
  },
  
  // Track usage (resets monthly)
  usage: {
    creditsUsed: 0,
    lastResetDate: new Date().toISOString().slice(0, 7), // YYYY-MM format
    scanHistory: []
  },
  
  // Check if we need to reset monthly counter
  checkMonthlyReset() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (this.usage.lastResetDate !== currentMonth) {
      console.log(`📅 Monthly reset: ${this.usage.lastResetDate} → ${currentMonth}`);
      this.usage.creditsUsed = 0;
      this.usage.lastResetDate = currentMonth;
      this.usage.scanHistory = [];
    }
  },
  
  // Calculate max allowed credits (80% of total)
  getMaxAllowedCredits() {
    return Math.floor(this.totalMonthlyCredits * (this.maxUsagePercent / 100));
  },
  
  // Get remaining credits
  getRemainingCredits() {
    this.checkMonthlyReset();
    const maxAllowed = this.getMaxAllowedCredits();
    return maxAllowed - this.usage.creditsUsed;
  },
  
  // Check if we can perform a scan
  canScan(scanType) {
    this.checkMonthlyReset();
    
    const cost = this.costs[scanType] || 1;
    const remaining = this.getRemainingCredits();
    const maxAllowed = this.getMaxAllowedCredits();
    
    if (remaining < cost) {
      return {
        allowed: false,
        reason: `Credit limit reached. You've used ${this.usage.creditsUsed}/${maxAllowed} credits (${this.maxUsagePercent}% of ${this.totalMonthlyCredits} total). Resets next month.`,
        creditsRemaining: remaining,
        creditsUsed: this.usage.creditsUsed,
        maxAllowed: maxAllowed
      };
    }
    
    return {
      allowed: true,
      creditsRemaining: remaining - cost, // After this scan
      creditsUsed: this.usage.creditsUsed,
      cost: cost
    };
  },
  
  // Record a scan
  recordScan(scanType) {
    this.checkMonthlyReset();
    const cost = this.costs[scanType] || 1;
    
    this.usage.creditsUsed += cost;
    this.usage.scanHistory.push({
      type: scanType,
      cost: cost,
      timestamp: new Date().toISOString()
    });
    
    console.log(`💳 Credit used: ${cost} | Total used: ${this.usage.creditsUsed}/${this.getMaxAllowedCredits()}`);
  },
  
  // Get usage stats
  getStats() {
    this.checkMonthlyReset();
    const maxAllowed = this.getMaxAllowedCredits();
    
    return {
      creditsUsed: this.usage.creditsUsed,
      creditsRemaining: this.getRemainingCredits(),
      maxAllowedCredits: maxAllowed,
      totalMonthlyCredits: this.totalMonthlyCredits,
      usagePercent: Math.round((this.usage.creditsUsed / maxAllowed) * 100),
      maxUsagePercent: this.maxUsagePercent,
      currentMonth: this.usage.lastResetDate,
      scanHistory: this.usage.scanHistory
    };
  }
};

// ============================================
// RATE LIMITING (ADDITIONAL SAFETY)
// ============================================
const rateLimiter = {
  scans: [],
  maxScansPerHour: 10,
  
  addScan(type) {
    this.scans.push({
      type,
      timestamp: Date.now()
    });
    
    // Clean up scans older than 1 hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.scans = this.scans.filter(scan => scan.timestamp > oneHourAgo);
  },
  
  canScan() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentScans = this.scans.filter(scan => scan.timestamp > oneHourAgo).length;
    
    if (recentScans >= this.maxScansPerHour) {
      const oldestScan = this.scans[0];
      const resetTime = oldestScan.timestamp + (60 * 60 * 1000);
      const minutesLeft = Math.ceil((resetTime - Date.now()) / (60 * 1000));
      
      return {
        allowed: false,
        reason: `Rate limit: ${this.maxScansPerHour} scans/hour. Try again in ${minutesLeft} minutes.`
      };
    }
    
    return { allowed: true };
  }
};

// ============================================
// COPYLEAKS AUTHENTICATION
// ============================================
let authToken = null;
let tokenExpiry = null;

async function getCopyleaksToken() {
  if (authToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    console.log('✅ Using cached Copyleaks token');
    return authToken;
  }

  try {
    console.log('🔐 Authenticating with Copyleaks v3 API...');
    const response = await axios.post('https://id.copyleaks.com/v3/account/login/api', {
      email: process.env.COPYLEAKS_EMAIL,
      key: process.env.COPYLEAKS_API_KEY
    });

    authToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 86400;
    tokenExpiry = Date.now() + (expiresIn * 1000);
    
    console.log('✅ Copyleaks authentication successful');
    return authToken;
  } catch (error) {
    console.error('❌ Copyleaks authentication failed:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
}

// ============================================
// USAGE STATS ENDPOINT
// ============================================
app.get('/api/usage', (req, res) => {
  res.json({
    credits: creditManager.getStats(),
    rateLimit: {
      scansInLastHour: rateLimiter.scans.length,
      maxScansPerHour: rateLimiter.maxScansPerHour
    }
  });
});

// ============================================
// UPDATE CREDIT SETTINGS ENDPOINT
// ============================================
app.post('/api/credits/configure', (req, res) => {
  const { totalMonthlyCredits, maxUsagePercent } = req.body;
  
  if (totalMonthlyCredits) {
    creditManager.totalMonthlyCredits = totalMonthlyCredits;
  }
  
  if (maxUsagePercent) {
    creditManager.maxUsagePercent = Math.min(100, Math.max(0, maxUsagePercent));
  }
  
  res.json({
    message: 'Credit settings updated',
    settings: {
      totalMonthlyCredits: creditManager.totalMonthlyCredits,
      maxUsagePercent: creditManager.maxUsagePercent,
      maxAllowedCredits: creditManager.getMaxAllowedCredits()
    }
  });
});

// ============================================
// TEXT DETECTION ENDPOINT
// ============================================
app.post('/api/detect/text', async (req, res) => {
  try {
    const { text } = req.body;

    // Check rate limiting
    const rateCheck = rateLimiter.canScan();
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: rateCheck.reason
      });
    }

    // Check credit limit
    const creditCheck = creditManager.canScan('text');
    if (!creditCheck.allowed) {
      return res.status(429).json({ 
        error: 'Credit limit exceeded',
        message: creditCheck.reason,
        creditsUsed: creditCheck.creditsUsed,
        maxAllowed: creditCheck.maxAllowed
      });
    }

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const MIN_TEXT_LENGTH = 50;
    if (text.trim().length < MIN_TEXT_LENGTH) {
      return res.status(400).json({ 
        error: 'Text too short',
        message: `Text must contain at least ${MIN_TEXT_LENGTH} characters. Found: ${text.trim().length} characters.`,
        extractedLength: text.trim().length,
        minimumRequired: MIN_TEXT_LENGTH
      });
    }

    const scanId = `scan-text-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const token = await getCopyleaksToken();

    console.log(`📝 Submitting text scan with ID: ${scanId}`);

    await axios.put(
      `https://api.copyleaks.com/v3/writer-detector/${scanId}/submit`,
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

    console.log('✅ Scan submitted, polling for results...');

    let attempts = 0;
    const maxAttempts = 15;
    let resultData = null;

    while (attempts < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const resultResponse = await axios.get(
          `https://api.copyleaks.com/v3/writer-detector/${scanId}/result`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        resultData = resultResponse.data;
        console.log('✅ Results retrieved successfully');
        break;
      } catch (pollError) {
        if (pollError.response?.status === 404) {
          attempts++;
          console.log(`⏳ Results not ready, attempt ${attempts}/${maxAttempts}...`);
        } else {
          throw pollError;
        }
      }
    }

    if (!resultData) {
      return res.status(408).json({
        error: 'Timeout',
        message: 'Scan is taking longer than expected. Please try again later.',
        scanId: scanId
      });
    }

    // Record successful scan
    creditManager.recordScan('text');
    rateLimiter.addScan('text');

    const summary = resultData.summary || {};
    
    const result = {
      ai_probability: Math.round((summary.ai || 0) * 100),
      human_probability: Math.round((summary.human || 0) * 100),
      scanId: scanId,
      timestamp: new Date().toISOString(),
      creditsRemaining: creditManager.getRemainingCredits(),
      details: resultData
    };

    console.log(`✅ Text Results: AI=${result.ai_probability}%, Human=${result.human_probability}%`);
    res.json(result);

  } catch (error) {
    console.error('❌ Text detection error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({
      error: 'Text detection failed',
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
});

// ============================================
// DOCUMENT DETECTION ENDPOINT
// ============================================
app.post('/api/detect/document', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Received document detection request');

    // Check rate limiting
    const rateCheck = rateLimiter.canScan();
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: rateCheck.reason
      });
    }

    // Check credit limit
    const creditCheck = creditManager.canScan('document');
    if (!creditCheck.allowed) {
      return res.status(429).json({ 
        error: 'Credit limit exceeded',
        message: creditCheck.reason,
        creditsUsed: creditCheck.creditsUsed,
        maxAllowed: creditCheck.maxAllowed
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`🔍 Processing document: ${req.file.originalname} (${req.file.size} bytes)`);

    let extractedText = '';

    if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        req.file.originalname.endsWith('.docx')) {
      console.log('📄 Extracting text from DOCX...');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
      console.log(`✅ Extracted ${extractedText.length} characters from DOCX`);
    } 
    else if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
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
      console.log('📄 Reading plain text file...');
      extractedText = req.file.buffer.toString('utf8');
      console.log(`✅ Read ${extractedText.length} characters from TXT`);
    }
    else {
      return res.status(400).json({ 
        error: 'Unsupported file format',
        message: 'Please upload .docx, .pdf, or .txt files',
        supportedFormats: ['.docx', '.pdf', '.txt']
      });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'No text found',
        message: 'The document appears to be empty or text could not be extracted'
      });
    }

    const MIN_TEXT_LENGTH = 50;
    if (extractedText.trim().length < MIN_TEXT_LENGTH) {
      return res.status(400).json({ 
        error: 'Text too short',
        message: `Document must contain at least ${MIN_TEXT_LENGTH} characters. Found: ${extractedText.trim().length} characters.`,
        extractedLength: extractedText.trim().length,
        minimumRequired: MIN_TEXT_LENGTH
      });
    }

    const scanId = `scan-doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const token = await getCopyleaksToken();

    console.log(`📝 Submitting document scan with ID: ${scanId}`);

    await axios.put(
      `https://api.copyleaks.com/v3/writer-detector/${scanId}/submit`,
      {
        text: extractedText,
        sandbox: process.env.COPYLEAKS_SANDBOX === 'true'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Document scan submitted, polling for results...');

    let attempts = 0;
    const maxAttempts = 15;
    let resultData = null;

    while (attempts < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const resultResponse = await axios.get(
          `https://api.copyleaks.com/v3/writer-detector/${scanId}/result`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        resultData = resultResponse.data;
        console.log('✅ Results retrieved successfully');
        break;
      } catch (pollError) {
        if (pollError.response?.status === 404) {
          attempts++;
          console.log(`⏳ Results not ready, attempt ${attempts}/${maxAttempts}...`);
        } else {
          throw pollError;
        }
      }
    }

    if (!resultData) {
      return res.status(408).json({
        error: 'Timeout',
        message: 'Scan is taking longer than expected. Please try again later.',
        scanId: scanId
      });
    }

    // Record successful scan
    creditManager.recordScan('document');
    rateLimiter.addScan('document');

    const summary = resultData.summary || {};
    
    const result = {
      ai_probability: Math.round((summary.ai || 0) * 100),
      human_probability: Math.round((summary.human || 0) * 100),
      scanId: scanId,
      timestamp: new Date().toISOString(),
      creditsRemaining: creditManager.getRemainingCredits(),
      documentInfo: {
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        textLength: extractedText.length,
        wordCount: extractedText.split(/\s+/).filter(w => w.length > 0).length
      },
      details: resultData
    };

    console.log(`📊 Document Results: AI=${result.ai_probability}%, Human=${result.human_probability}%`);
    res.json(result);

  } catch (error) {
    console.error('❌ Document detection error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({
      error: 'Document detection failed',
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
});

// ============================================
// IMAGE DETECTION ENDPOINT
// ============================================
app.post('/api/detect/image', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Received image detection request');

    // Check rate limiting
    const rateCheck = rateLimiter.canScan();
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: rateCheck.reason
      });
    }

    // Check credit limit
    const creditCheck = creditManager.canScan('image');
    if (!creditCheck.allowed) {
      return res.status(429).json({ 
        error: 'Credit limit exceeded',
        message: creditCheck.reason,
        creditsUsed: creditCheck.creditsUsed,
        maxAllowed: creditCheck.maxAllowed
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const scanId = `scan-img-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`🔍 Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

    const token = await getCopyleaksToken();

    const requestBody = {
      base64: base64Image,
      filename: req.file.originalname,
      model: 'ai-image-1-ultra' // ✅ Fixed: Added -ultra
    };

    if (process.env.COPYLEAKS_SANDBOX === 'true') {
      requestBody.sandbox = true;
    }

    console.log('📤 Sending request with params:', {
      scanId,
      filename: req.file.originalname,
      base64Length: base64Image.length,
      model: requestBody.model,
      hasSandbox: requestBody.sandbox || false
    });

    const copyleaksResponse = await axios.post(
      `https://api.copyleaks.com/v1/ai-image-detector/${scanId}/check`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Record successful scan
    creditManager.recordScan('image');
    rateLimiter.addScan('image');

    console.log('✅ Image scan response received');

    const data = copyleaksResponse.data;
    const summary = data.summary || {};
    
    const result = {
      ai_probability: Math.round((summary.ai || 0) * 100),
      human_probability: Math.round((summary.human || 0) * 100),
      model: data.model || 'ai-image-1-ultra',
      scanId: scanId,
      timestamp: new Date().toISOString(),
      creditsRemaining: creditManager.getRemainingCredits(),
      imageInfo: data.imageInfo,
      details: data
    };

    console.log(`📊 Image Results: AI=${result.ai_probability}%, Human=${result.human_probability}%`);
    res.json(result);

  } catch (error) {
    console.error('❌ Image detection error:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.details) {
      console.error('📋 Full error details:', JSON.stringify(error.response.data.error.details, null, 2));
    }
    
    if (error.response?.status === 403 || error.response?.status === 402) {
      return res.status(403).json({
        error: 'Feature not available',
        message: 'Image detection is not available with your current plan.',
        upgradeUrl: 'https://copyleaks.com/pricing',
        details: error.response?.data
      });
    }
    
    res.status(error.response?.status || 500).json({
      error: 'Image detection failed',
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
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
    timestamp: new Date().toISOString(),
    apiVersion: 'v3',
    credits: creditManager.getStats()
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
║  🚀 Copyleaks Detection Server (v3 API)  ║
║  📍 http://localhost:${PORT}                ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  Endpoints:                               ║
║  • POST /api/detect/text                  ║
║  • POST /api/detect/document              ║
║  • POST /api/detect/image                 ║
║  • GET  /api/usage                        ║
║  • POST /api/credits/configure            ║
║  • GET  /api/health                       ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  Credit Management:                       ║
║  • Total: ${creditManager.totalMonthlyCredits} credits/month           ║
║  • Limit: ${creditManager.maxUsagePercent}% (${creditManager.getMaxAllowedCredits()} credits)          ║
║  • Text: ${creditManager.costs.text} credit  | Doc: ${creditManager.costs.document} credit        ║
║  • Image: ${creditManager.costs.image} credits                      ║
╚═══════════════════════════════════════════╝
  `);
  
  getCopyleaksToken()
    .then(() => {
      console.log('✅ Initial Copyleaks v3 authentication successful');
      console.log('💳 Credit tracking enabled');
      console.log(`🎯 Using max ${creditManager.getMaxAllowedCredits()}/${creditManager.totalMonthlyCredits} credits (${creditManager.maxUsagePercent}% limit)`);
    })
    .catch(err => console.error('❌ Initial setup error:', err.message));
});