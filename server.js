const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const DOWNLOAD_DIR = path.join(__dirname, "downloads");

// create folder if not exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

/* HEALTH CHECK */
app.get("/", (req, res) => {
    res.send("Cymor yt-dlp Backend Running 🚀");
});

/* REAL DOWNLOAD ROUTE */
app.post("/download", async (req, res) => {
    const { url, type } = req.body;

    if (!url) {
        return res.status(400).json({
            success: false,
            message: "No URL provided"
        });
    }

    const fileName = `video_${Date.now()}`;
    const outputPath = path.join(DOWNLOAD_DIR, `${fileName}.%(ext)s`);

    // yt-dlp command
    let command = "";

    if (type === "mp3") {
        command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;
    } else {
        command = `yt-dlp -f "bestvideo+bestaudio/best" -o "${outputPath}" "${url}"`;
    }

    console.log("Running:", command);

    exec(command, (error) => {
        if (error) {
            console.error("yt-dlp error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Download failed"
            });
        }

        // find downloaded file
        fs.readdir(DOWNLOAD_DIR, (err, files) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "File read error"
                });
            }

            const file = files.find(f => f.includes(fileName));

            if (!file) {
                return res.status(500).json({
                    success: false,
                    message: "File not found"
                });
            }

            const fileUrl = `${req.protocol}://${req.get("host")}/file/${file}`;

            return res.json({
                success: true,
                download: fileUrl
            });
        });
    });
});

/* SERVE FILES */
app.use("/file", express.static(DOWNLOAD_DIR));

/* START SERVER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("yt-dlp Backend running on port " + PORT);
});
