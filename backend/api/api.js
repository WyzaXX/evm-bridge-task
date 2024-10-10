import express from "express";
import mongoose from "mongoose";
import { eventSchema } from "../schemas/events.js";
import dotenv from "dotenv";

dotenv.config();


const PORT = 8080;

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const Event = mongoose.model("Event", eventSchema);

const app = express();
app.use(express.json());

const validateAddress = (req, res, next) => {
  const { walletAddress } = req.params;
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }
  next();
};

app.get("/api/tokens/locked", async (req, res) => {
  const events = await Event.find({ event: "TokenLocked" });
  res.json(events);
});

app.get("/api/tokens/released", async (req, res) => {
  const events = await Event.find({ event: "TokenReleased" });
  res.json(events);
});

app.get(
  "/api/tokens/bridged/:walletAddress",
  validateAddress,
  async (req, res) => {
    const events = await Event.find({ user: req.params.walletAddress });
    res.json(events);
  }
);

app.get("/api/tokens/erc20", async (req, res) => {
  const events = await Event.find({
    event: { $in: ["TokenLocked", "TokenReleased"] },
  });
  res.json(events);
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
