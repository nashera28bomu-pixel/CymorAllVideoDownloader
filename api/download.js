const axios = require("axios");

module.exports = async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");

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

        const url = body.url;

        const isAudioOnly =
        body.isAudioOnly || false;

        if (!url) {

            return res.status(400).json({
                error: "Missing URL"
            });
        }

        const payload = {

            url,

            vQuality: "720",

            filenamePattern: "basic",

            isAudioOnly,

            isNoTTWatermark: true
        };

        const nodes = [

            "https://api.cobalt.tools/api/json",

            "https://co.wuk.sh/api/json",

            "https://api-cobalt.islantay.dev/api/json"
        ];

        for (const node of nodes) {

            try {

                const response =
                await axios.post(
                    node,
                    payload,
                    {
                        headers: {
                            accept:
                            "application/json",

                            "content-type":
                            "application/json"
                        },

                        timeout: 45000
                    }
                );

                const data =
                response.data;

                console.log(
                    "SUCCESS NODE:",
                    node
                );

                console.log(data);

                if (data.url) {

                    return res.status(200).json({
                        url: data.url
                    });
                }

                if (
                    data.picker &&
                    data.picker.length > 0
                ) {

                    return res.status(200).json({
                        url:
                        data.picker[0].url
                    });
                }

            } catch (err) {

                console.log(
                    "FAILED NODE:",
                    node
                );

                console.log(
                    err.response?.data
                    ||
                    err.message
                );

                continue;
            }
        }

        return res.status(500).json({
            error:
            "All download servers failed"
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            error:
            err.message
        });
    }
};
