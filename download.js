const axios = require('axios');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);
    
    // The "Bridge" makes the request to Cobalt for you
    const response = await axios.post("https://api.cobalt.tools/api/json", payload, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Cymor-Downloader-Engine"
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error("Cymor Error Log:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "The engine is currently busy. Try again in 10 seconds." })
    };
  }
};
