const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const JSON_PATH = path.join(DATA_DIR, 'schemes_data.json');
const CSV_PATH = path.join(DATA_DIR, 'schemes_data.csv');
const XLSX_PATH = path.join(DATA_DIR, 'schemes_data.xlsx');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Simple endpoint to get all schemes
app.get('/api/schemes', (req, res) => {
  if (fs.existsSync(JSON_PATH)) {
    fs.readFile(JSON_PATH, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read schemes database.' });
      }
      try {
        const schemes = JSON.parse(data);
        return res.json(schemes);
      } catch (parseErr) {
        return res.status(500).json({ error: 'Failed to parse schemes database.' });
      }
    });
  } else {
    // If the file is not yet generated, return a basic response informing them
    return res.json([]);
  }
});

// SSE endpoint to trigger scraper and stream logs in real-time
app.get('/api/scrape', (req, res) => {
  const query = req.query.query || '';
  
  // Set headers for Server-Sent Events (SSE)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Prevent Nginx buffering if deployed
  });

  res.write(`data: [SERVER] Launching scraping agent for "${query}"...\n\n`);

  const pythonExecutable = path.join(__dirname, '.venv', 'bin', 'python');
  const scraperPath = path.join(__dirname, 'scraper.py');
  
  const args = [scraperPath];
  if (query) {
    args.push(query);
  }

  // Spawn Python child process
  const child = spawn(pythonExecutable, args, { cwd: __dirname });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        res.write(`data: ${line}\n\n`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        res.write(`data: [ERROR] ${line}\n\n`);
      }
    });
  });

  child.on('close', (code) => {
    if (code === 0) {
      res.write(`event: complete\ndata: {"status": "success", "code": ${code}}\n\n`);
    } else {
      res.write(`event: complete\ndata: {"status": "error", "code": ${code}}\n\n`);
    }
    res.end();
  });

  // If connection is closed by client, kill the process
  req.on('close', () => {
    child.kill();
  });
});

// File download endpoints
app.get('/api/download/csv', (req, res) => {
  if (fs.existsSync(CSV_PATH)) {
    res.download(CSV_PATH, 'government_schemes.csv');
  } else {
    res.status(404).json({ error: 'CSV file not found. Please run scraper first.' });
  }
});

app.get('/api/download/xlsx', (req, res) => {
  if (fs.existsSync(XLSX_PATH)) {
    res.download(XLSX_PATH, 'government_schemes.xlsx');
  } else {
    res.status(404).json({ error: 'Excel file not found. Please run scraper first.' });
  }
});

// Serve static files from React build directory 'public'
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(publicPath, 'index.html'));
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
