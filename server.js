const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const COBALT_API = "https://api.cobalt.tools/api/json";

/* 🚀 HEALTH CHECK */
app.get("/", (req, res) => {
    res.send("Cymor Backend is running 🚀 — Powered by Cymor");
});

/* 📥 MAIN DOWNLOAD ROUTE */
app.post("/download", async (req, res) => {
    const { url, type } = req.body;

    // VALIDATION
    if (!url || typeof url !== "string") {
        return res.status(400).json({
            success: false,
            message: "No URL provided"
        });
    }

    try {
        const response = await axios.post(
            COBALT_API,
            {
                url: url.trim(),
                vQuality: "1080",
                isAudioOnly: type === "mp3",
                isNoTTWatermark: true, // No Watermark logic
                filenamePattern: "pretty"
            },
            {
                timeout: 30000, // Increased timeout for heavy processing
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "User-Agent": "CymorTechService/1.0"
                }
            }
        );

        const data = response.data;

        // Cobalt returns status: 'stream', 'redirect', or 'link' usually
        if (data && data.url) {
            return res.json({
                success: true,
                download: data.url
            });
        }

        return res.status(400).json({
            success: false,
            message: data?.text || "Unsupported video or link protected by Cobalt"
        });

    } catch (err) {
        console.error("❌ Cymor Backend Error:");

        if (err.response) {
            console.error("Response Data:", err.response.data);
            return res.status(err.response.status).json({
                success: false,
                message: err.response.data.text || "Cobalt API rejected the request"
            });
        } 
        
        console.error("Error Message:", err.message);
        return res.status(500).json({
            success: false,
            message: "Backend Error: " + err.message
        });
    }
});

/* 🔧 PORT & HOST FIX FOR RAILWAY */
// Listening on 0.0.0.0 is mandatory for cloud health checks
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Cymor Backend Online`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Host: 0.0.0.0`);
});
