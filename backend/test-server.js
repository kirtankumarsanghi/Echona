const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/api/surprise", async (req, res) => {
  res.json({
    success: true,
    test: "works!",
    context: {
      time: "morning",
      weather: "sunny",
      moodUsed: "Happy"
    },
    track: {
      id: "h1",
      title: "Happy",
      artist: "Pharrell Williams",
      mood: "Happy",
      genre: "pop",
      youtubeId: "ZbZSe6N_BXs"
    }
  });
});

const PORT = Number(process.env.BACKEND_TEST_PORT || 5050);

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
