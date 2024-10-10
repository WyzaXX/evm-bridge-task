import mongoose from "mongoose";

export const eventSchema = new mongoose.Schema({
  event: String,
  tokenAddress: String, // token address
  userAddress: String, // user address
  amount: String,
  blockNumber: Number,
});
