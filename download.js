const axios = require("axios");

exports.handler = async (event) => {

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: cors()
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: cors(),
            body: JSON.stringify({
                error: "Method not allowed"
            })
        };
    }

    try {

        const body = JSON.parse(event.body);

        if (!body.url) {
            return {
                statusCode: 400,
                headers: cors(),
                body: JSON.stringify({
                    error: "No URL provided"
                })
            };
        }

        const payload = {
            url: body.url,
            vQuality: body.vQuality || "1080",
            isAudioOnly: body.isAudioOnly || false,
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
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                            "User-Agent": "CymorDownloader/3.0"
                        },
                        timeout: 20000
                    }
                );

                const data = response.data;

                console.log(data);

                if (data.url) {

                    return {
                        statusCode: 200,
                        headers: cors(),
                        body: JSON.stringify({
                            url: data.url
                        })
                    };
                }

                if (
                    data.picker &&
                    Array.isArray(data.picker) &&
                    data.picker.length > 0
                ) {

                    return {
                        statusCode: 200,
                        headers: cors(),
                        body: JSON.stringify({
                            url: data.picker[0].url
                        })
                    };
                }

            } catch (err) {

                console.log(
                    "Node failed:",
                    node
                );

                continue;
            }
        }

        return {
            statusCode: 500,
            headers: cors(),
            body: JSON.stringify({
                error: "All nodes failed"
            })
        };

    } catch (err) {

        console.log(err);

        return {
            statusCode: 500,
            headers: cors(),
            body: JSON.stringify({
                error: err.message
            })
        };
    }
};

function cors() {

    return {

        "Access-Control-Allow-Origin": "*",

        "Access-Control-Allow-Headers":
        "Content-Type",

        "Access-Control-Allow-Methods":
        "POST, OPTIONS",

        "Content-Type":
        "application/json"
    };
}
