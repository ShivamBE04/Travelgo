import axios from "axios";

export const searchHotels = async (req, res) => {
  try {
    const { destination, checkin, checkout, rooms, adults, kids } = req.body;

    // 🔐 HEADERS REQUIRED BY ZENTRUM
    const headers = {
      "apikey": " 782adf85-f7e9-48d2-b6aa-0174c6002805",
      "accountId": "zentrum-demo-account",
      "channelId": " theobeglobal-sandbox",
      "content-type": "application/json"
    };

    // 🔥 BODY REQUIRED BY INIT API
    const body = {
      channelId: "YOUR_CHANNEL_ID",
      currency: "INR",
      culture: "en-US",
      checkIn: checkin,
      checkOut: checkout,
      occupancies: [
        {
          rooms: rooms,
          adults: adults,
          children: kids
        }
      ]
    };

    // ▶️ CALL FIRST API (INIT)
    const initResponse = await axios.post(
      "https://nexus.prod.zentrumhub.com/api/hotel/availability/init",
      body,
      { headers }
    );

    console.log("INIT RESPONSE:", initResponse.data);

    const token = initResponse.data.token;

    if (!token) {
      return res.status(400).json({ message: "Token not received" });
    }

    // ▶️ CALL SECOND API (ASYNC RESULTS)
    const resultsResponse = await axios.get(
      `https://nexus.prod.zentrumhub.com/api/hotel/availability/async/${token}/results`,
      { headers }
    );

    console.log("RESULTS RESPONSE:", resultsResponse.data);

    res.json(resultsResponse.data);

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Hotel search failed", error: error.response?.data });
  }
};
