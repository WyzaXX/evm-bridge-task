import { ethers } from "ethers";
import bridgeJSON from "../../contracts/out/Bridge.sol/Bridge.json" assert { type: "json" };
import dotenv from "dotenv";
import mongoose from "mongoose";
import { eventSchema } from "../schemas/events.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const Event = mongoose.model("Event", eventSchema);

// const sepoliaProvider = new ethers.JsonRpcProvider(process.env.SEPOLIA_ENDPOINT);
// const baseSepoliaProvider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_ENDPOINT);
// const mainBridgeAddress = process.env.BRIDGE_SEPOLIA_ADDRESS;
// const targetBridgeAddress = process.env.BRIDGE_BASE_SEPOLIA_ADDRESS;
// const dannyTokenAddress = process.env.DANNY_TOKEN_ADDRESS;
// const wrappedTokenAddress = process.env.WRAPPED_TOKEN_ADDRESS;

const provider = new ethers.JsonRpcProvider(process.env.TEST_ENDPOINT);
const bridgeAddress = process.env.TEST_BRIDGE;
const dannyTokenAddress = process.env.TEST_DANNY_TOKEN;
const bridgeABI = bridgeJSON.abi;
const bridgeContract = new ethers.Contract(bridgeAddress, bridgeABI, provider);

async function getLastProcessedBlock() {
  const lastEvent = await Event.findOne().sort({ blockNumber: -1 });
  return lastEvent ? lastEvent.blockNumber : 0;
}

async function processPastEvents(fromBlock, toBlock) {
  console.log("Processing events from block", fromBlock, "to block", toBlock);

  const filter = {
    address: bridgeAddress,
    fromBlock,
    toBlock,
    topics: [
      bridgeContract.filters.TokenClaimed().topics,
      bridgeContract.filters.TokenBurned().topics,
      bridgeContract.filters.TokenReleased().topics,
      bridgeContract.filters.TokenLocked().topics,
    ],
  };

  const events = await provider.getLogs(filter);
  for (const event of events) {
    const parsedEvent = bridgeContract.interface.parseLog(event);
    const { name, args } = parsedEvent;

    const newEvent = new Event({
      event: name,
      tokenAddress: args.token,
      userAddress: args.user,
      amount: args.amount.toString(),
      blockNumber: event.blockNumber,
    });
    await newEvent.save();
    console.log(`${name} event saved:`, newEvent);
  }
}

async function processEvents(fromBlock, toBlock) {
  const filter = {
    address: bridgeAddress,
    fromBlock,
    toBlock: toBlock,
    topics: [
      ethers.id("TokenLocked(address,address,uint256)"),
      ethers.id("TokenClaimed(address,address,uint256)"),
      ethers.id("TokenBurned(address,address,uint256)"),
      ethers.id("TokenReleased(address,address,uint256)"),
    ],
  };

  const logs = await provider.getLogs(filter);
  for (const log of logs) {
    const parsedLog = bridgeContract.interface.parseLog(log);
    const { name, args } = parsedLog;
    const newEvent = new Event({
      event: name,
      tokenAddress: args.token,
      userAddress: args.user,
      amount: args.amount.toString(),
      blockNumber: log.blockNumber,
    });
    await newEvent.save();
    console.log(`${name} event saved:`, newEvent);
  }
}

async function listenEvents() {
  const lastProcessedBlock = await getLastProcessedBlock();
  console.log("Last processed block:", lastProcessedBlock);
  const currentBlock = await provider.getBlockNumber();
  if (lastProcessedBlock < currentBlock) {
    await processPastEvents(lastProcessedBlock + 1, currentBlock);
  }

  bridgeContract.on("TokenLocked", async (token, user, amount, event) => {
    const newEvent = new Event({
      event: "TokenLocked",
      tokenAddress: token,
      userAddress: user,
      amount: amount.toString(),
      blockNumber: event.log.blockNumber,
    });
    await newEvent.save();
    console.log("TokenLocked event saved:", newEvent);
  });

  bridgeContract.on("TokenClaimed", async (token, user, amount, event) => {
    const newEvent = new Event({
      event: "TokenClaimed",
      tokenAddress: token,
      userAddress: user,
      amount: amount.toString(),
      blockNumber: event.log.blockNumber,
    });
    await newEvent.save();
    console.log("TokenClaimed event saved:", newEvent);
  });

  bridgeContract.on("TokenBurned", async (token, user, amount, event) => {
    const newEvent = new Event({
      event: "TokenBurned",
      tokenAddress: token,
      userAddress: user,
      amount: amount.toString(),
      blockNumber: event.log.blockNumber,
    });
    await newEvent.save();
    console.log("TokenBurned event saved:", newEvent);
  });

  bridgeContract.on("TokenReleased", async (token, user, amount, event) => {
    const newEvent = new Event({
      event: "TokenReleased",
      tokenAddress: token,
      userAddress: user,
      amount: amount.toString(),
      blockNumber: event.log.blockNumber,
    });
    await newEvent.save();
    console.log("TokenReleased event saved:", newEvent);
  });

  provider.on("block", async (blockNumber) => {
    console.log("New block mined:", blockNumber);
    const lastProcessedBlock = await getLastProcessedBlock();
    console.log("Last processed block:", lastProcessedBlock);
    await processEvents(lastProcessedBlock + 1, blockNumber);
  });
}

listenEvents().catch(console.error);
