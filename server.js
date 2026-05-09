const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const COBALT_API = "https://api.cobalt.tools/api/json";

/* HEALTH CHECK */
app.get("/", (req, res) => {
    res.send("Cymor Backend is running 🚀");
});

/* MAIN DOWNLOAD ROUTE */
app.post("/download", async (req, res) => {
    const { url, type } = req.body;

    // VALIDATION
    if (!url || typeof url !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing URL"
        });
    }

    const isMp3 = type === "mp3";

    try {
        const response = await axios.post(COBALT_API, {
            url: url.trim(),
            vQuality: "1080",
            isAudioOnly: isMp3,
            isNoTTWatermark: true,
            filenamePattern: "pretty"
        }, {
            timeout: 15000
        });

        const data = response.data;

        if (data && data.url) {
            return res.json({
                success: true,
                download: data.url
            });
        }

        return res.status(400).json({
            success: false,
            message: data?.text || "Media not supported"
        });

    } catch (err) {
        console.error("Cymor Backend Error:", err.message);

        return res.status(500).json({
            success: false,
            message: "Server error or API unavailable"
        });
    }
});

/* PORT FIX FOR DEPLOYMENT */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Cymor Backend running on port ${PORT}`);
});
