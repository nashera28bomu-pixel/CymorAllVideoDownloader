const axios = require("axios");

exports.handler = async (event) => {
    // Allow only POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: corsHeaders(),
            body: JSON.stringify({
                error: "Method Not Allowed"
            })
        };
    }

    try {
        const payload = JSON.parse(event.body);

        if (!payload.url) {
            return {
                statusCode: 400,
                headers: corsHeaders(),
                body: JSON.stringify({
                    error: "No URL provided"
                })
            };
        }

        // Working Cobalt mirrors
        const apiNodes = [
            "https://api.cobalt.tools/api/json",
            "https://co.wuk.sh/api/json",
            "https://api-cobalt.is-an.org/api/json"
        ];

        let lastError = null;

        for (const node of apiNodes) {
            try {
                const response = await axios.post(
                    node,
                    payload,
                    {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            "User-Agent": "CymorAllVideo/3.0"
                        },
                        timeout: 15000
                    }
                );

                const data = response.data;

                // Direct download
                if (data.url) {
                    return success(data.url);
                }

                // Picker support
                if (
                    data.picker &&
                    Array.isArray(data.picker) &&
                    data.picker.length > 0
                ) {
                    return success(data.picker[0].url);
                }

                // Audio support
                if (data.audio) {
                    return success(data.audio);
                }

                // Error returned by API
                if (data.status === "error") {
                    lastError = data.text || "Unknown API error";
                    continue;
                }

            } catch (err) {
                console.log(`Failed node: ${node}`);
                console.log(err.message);

                lastError = err.message;
                continue;
            }
        }

        return {
            statusCode: 500,
            headers: corsHeaders(),
            body: JSON.stringify({
                error: lastError || "All servers busy"
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders(),
            body: JSON.stringify({
                error: err.message
            })
        };
    }
};

function success(url) {
    return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
            success: true,
            url
        })
    };
}

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };
}
