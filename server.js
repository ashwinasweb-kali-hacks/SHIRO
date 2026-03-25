import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import { Ollama } from 'ollama';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins so Netlify can communicate with this backend bridge
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// Request Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize Ollama client pointing to the local Ollama instance
// When you deploy this backend (e.g. to a VPS or Render), Ollama should also be running there or accessible.
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

app.get('/', (req, res) => {
  res.send('Shiro AI Ollama Backend Bridge is running!');
});

// Route proxies to Python Backend (Port 8000)
const PYTHON_BACKEND = 'http://127.0.0.1:8000';
const OLLAMA_HOST = 'http://127.0.0.1:11434';

app.get('/status', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}/status`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Python backend offline' });
  }
});

const proxyPost = async (req, res, endpoint) => {
  try {
    const response = await fetch(`${PYTHON_BACKEND}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Proxy Error for ${endpoint}:`, error);
    res.status(500).json({ success: false, message: 'Python backend connection failed' });
  }
};

app.post('/api/generate-image', (req, res) => proxyPost(req, res, '/api/generate-image'));
app.post('/api/generate-video', (req, res) => proxyPost(req, res, '/api/generate-video'));
app.post('/api/generate-qr', (req, res) => proxyPost(req, res, '/api/generate-qr'));

// --- BRIDGE ALIASES ---
// Allow /ollama/* and /backend/* to work directly for easier configuration
app.use('/ollama', proxy(OLLAMA_HOST)); 
app.use('/backend', proxy(PYTHON_BACKEND));

// --- OLLAMA RAW API PROXY ---
// When user hits /api/*, we proxy to OLLAMA_HOST/api/*
app.use('/api', proxy(OLLAMA_HOST, {
  proxyReqPathResolver: req => {
    const parts = req.url.split('?');
    const queryString = parts[1] ? '?' + parts[1] : '';
    const updatedPath = '/api' + parts[0].replace(/\/$/, '') + queryString;
    console.log(`[Proxy] /api${req.url} -> ${OLLAMA_HOST}${updatedPath}`);
    return updatedPath;
  }
}));


app.listen(port, () => {
  console.log(`Shiro API Bridge running on http://localhost:${port}`);
  console.log(`When hosting on Netlify, enter this backend URL (or its deployed Ngrok/Render link) into your Settings Endpoint!`);
});
