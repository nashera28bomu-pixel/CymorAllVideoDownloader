const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const payload = JSON.parse(event.body);
  
  // List of different Cobalt API mirrors to try if one is busy
  const apiNodes = [
    "https://api.cobalt.tools/api/json",
    "https://cobalt.api.gh0st.cc/api/json" 
  ];

  for (let node of apiNodes) {
    try {
      const response = await axios.post(node, payload, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Cymor-Engine-v2"
        },
        timeout: 10000 // 10 second limit per try
      });

      if (response.data) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response.data)
        };
      }
    } catch (error) {
      console.log(`Node ${node} failed, trying next...`);
      continue; // Move to the next API node
    }
  }

  // If all nodes fail
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "All engine nodes are currently busy. Please try a different link." })
  };
};
