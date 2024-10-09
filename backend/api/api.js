import express from "express";
import mongoose from "mongoose";

mongoose
  .connect("mongodb://localhost:27017/bridge", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const eventSchema = new mongoose.Schema({
  event: String,
  token: String,
  user: String,
  amount: String,
  blockNumber: Number,
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

app.get("/tokens/locked", async (req, res) => {
  const events = await Event.find({ event: "TokenLocked" });
  res.json(events);
});

app.get("/tokens/released", async (req, res) => {
  const events = await Event.find({ event: "TokenReleased" });
  res.json(events);
});

app.get("/tokens/bridged/:walletAddress", validateAddress, async (req, res) => {
  const events = await Event.find({ user: req.params.walletAddress });
  res.json(events);
});

app.get("/tokens/erc20", async (req, res) => {
  const events = await Event.find({
    event: { $in: ["TokenLocked", "TokenReleased"] },
  });
  res.json(events);
});

app.listen(3000, () => {
  console.log("API server running on port 3000");
});
