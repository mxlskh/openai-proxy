// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const ddg = require('duckduckgo-images-api');

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI proxy (как было)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, temperature } = req.body;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model, messages, temperature })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('OpenAI proxy error:', err);
    res.status(500).json({ error: 'OpenAI Proxy Error' });
  }
});

// Новый роут для DDG-скрейпа
app.get('/api/ddg-images', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing q parameter' });

    // search options: moderate true, 1 страница
    const results = await ddg.image_search({
      query: query,
      moderate: true,
      iterations: 1
    });

    // возвращаем первые 10 URL
    const urls = results.slice(0, 10).map(r => r.image);
    res.json({ images: urls });
  } catch (err) {
    console.error('DDG proxy error:', err);
    res.status(500).json({ error: 'DDG Proxy Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy listening on port ${PORT}`);
});
