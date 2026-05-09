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
                isNoTTWatermark: true,
                filenamePattern: "pretty"
            },
            {
                timeout: 20000,
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (CymorDownloader/1.0)"
                }
            }
        );

        const data = response.data;

        if (data && data.url) {
            return res.json({
                success: true,
                download: data.url
            });
        }

        return res.status(400).json({
            success: false,
            message: data?.text || "Unsupported video or blocked link"
        });

    } catch (err) {
        console.error("Cymor Backend Error:");

        // 🔥 Better error visibility (VERY IMPORTANT)
        if (err.response) {
            console.error("Response Data:", err.response.data);
        } else {
            console.error("Error Message:", err.message);
        }

        return res.status(500).json({
            success: false,
            message: "Backend failed: " + (err.response?.data?.text || err.message)
        });
    }
});

/* PORT FIX FOR RAILWAY */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Cymor Backend running on port ${PORT}`);
});
