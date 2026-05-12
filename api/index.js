const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// 1. Trending & Search (TMDB)
app.get('/api/movies/trending', async (req, res) => {
    const response = await axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.TMDB_API_KEY}`);
    res.json(response.data);
});

// 2. Zero-Cost AI (OpenRouter Free Models)
app.post('/api/ai/recommend', async (req, res) => {
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "open-assistant/oasst-sft-6-llama-30b", // Always check for $0 models
            messages: [{ role: "user", content: `Recommend a movie for a ${req.body.mood} mood.` }]
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://cymor-hub.vercel.app' 
            }
        });
        res.json({ suggestion: response.data.choices[0].message.content });
    } catch (err) { res.status(500).send("AI Offline"); }
});

// 3. The "Redirect Resolver" (Zero Bandwidth Download)
app.get('/api/watch/download', (req, res) => {
    const { id, type } = req.query;
    // We redirect the user to the source. You pay $0 for the movie traffic.
    res.redirect(`https://vidsrc.xyz/download/${type}/${id}`);
});

module.exports = app;
