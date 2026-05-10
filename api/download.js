const axios = require("axios");

module.exports = async (req, res) => {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        let body = req.body;

        if (typeof body === "string") {
            body = JSON.parse(body);
        }

        const {
            url,
            isAudioOnly
        } = body;

        if (!url) {

            return res.status(400).json({
                error: "No URL provided"
            });
        }

        const payload = {

            url,

            vQuality: "1080",

            isAudioOnly:
            isAudioOnly || false,

            isNoTTWatermark: true
        };

        const response = await axios.post(

            "https://api.cobalt.tools/api/json",

            payload,

            {
                headers: {
                    "Accept":
                    "application/json",

                    "Content-Type":
                    "application/json",

                    "User-Agent":
                    "Mozilla/5.0"
                },

                timeout: 30000
            }
        );

        const data = response.data;

        console.log(data);

        if (data.url) {

            return res.status(200).json({
                url: data.url
            });
        }

        if (
            data.picker &&
            Array.isArray(data.picker) &&
            data.picker.length > 0
        ) {

            return res.status(200).json({
                url: data.picker[0].url
            });
        }

        return res.status(500).json({
            error: "No downloadable media found",
            data
        });

    } catch (err) {

        console.log(err.response?.data || err.message);

        return res.status(500).json({
            error:
            err.response?.data ||
            err.message ||
            "Server error"
        });
    }
};
