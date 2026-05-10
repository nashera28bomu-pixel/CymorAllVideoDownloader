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

        const {
            url,
            vQuality,
            isAudioOnly
        } = req.body;

        if (!url) {

            return res.status(400).json({
                error: "No URL provided"
            });
        }

        const payload = {

            url,

            vQuality:
            vQuality || "1080",

            isAudioOnly:
            isAudioOnly || false,

            isNoTTWatermark: true
        };

        const nodes = [

            "https://api.cobalt.tools/api/json",

            "https://co.wuk.sh/api/json"

        ];

        for (const node of nodes) {

            try {

                const response =
                await axios.post(
                    node,
                    payload,
                    {
                        headers: {
                            "Accept":
                            "application/json",

                            "Content-Type":
                            "application/json",

                            "User-Agent":
                            "CymorDownloader/3.0"
                        },

                        timeout: 20000
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
                        url:
                        data.picker[0].url
                    });
                }

            } catch (err) {

                console.log(
                    "Failed node:",
                    node
                );

                continue;
            }
        }

        return res.status(500).json({
            error:
            "All download nodes failed"
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            error:
            err.message
        });
    }
};
