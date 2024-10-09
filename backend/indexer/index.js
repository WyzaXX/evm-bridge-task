import { ethers } from "ethers";
import bridgeJSON from "../../broadcast/Bridge.s.sol/31337/run-latest.json" assert { type: "json" };
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

mongoose
  .connect("mongodb://localhost:27017/bridge", { useUnifiedTopology: true })
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

const provider = new ethers.providers.JsonRpcProvider(
  process.env.SEPOLIA_ENDPOINT
);

const bridgeAddress = "0xf17bb16952A76DC90503D714B5346fC7E6B0AA43";
const bridgeABI = bridgeJSON.abi;
const bridgeContract = new ethers.Contract(bridgeAddress, bridgeABI, provider);

async function getLastProcessedBlock() {
  const lastEvent = await Event.findOne().sort({ blockNumber: -1 });
  return lastEvent ? lastEvent.blockNumber : 0;
}

async function processEvents(fromBlock) {
  const currentBlock = await provider.getBlockNumber();
  const filter = {
    address: bridgeAddress,
    fromBlock,
    toBlock: currentBlock,
    topics: [
      ethers.utils.id("TokenLocked(address,address,uint256)"),
      ethers.utils.id("TokenClaimed(address,address,uint256)"),
      ethers.utils.id("TokenBurned(address,address,uint256)"),
      ethers.utils.id("TokenReleased(address,address,uint256)"),
    ],
  };

  const logs = await provider.getLogs(filter);
  for (const log of logs) {
    const parsedLog = bridgeContract.interface.parseLog(log);
    const { name, args } = parsedLog;
    const newEvent = new Event({
      event: name,
      token: args.token,
      user: args.user,
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
  await processEvents(lastProcessedBlock + 1);

  bridgeContract.on("TokenLocked", async (token, user, amount, event) => {
    const newEvent = new Event({
      event: "TokenLocked",
      token,
      user,
      amount: amount.toString(),
      blockNumber: event.blockNumber,
    });
    await newEvent.save();
    console.log("TokenLocked event saved:", newEvent);
  });

  bridgeContract.on("TokenClaimed", async (token, user, amount, event) => {
    const newEvent = new Event({
      event: "TokenClaimed",
      token,
      user,
      amount: amount.toString(),
      blockNumber: event.blockNumber,
    });
    await newEvent.save();
    console.log("TokenClaimed event saved:", newEvent);
  });

  bridgeContract.on("TokenBurned", async (token, user, amount, event) => {
    const newEvent = new Event({
      event: "TokenBurned",
      token,
      user,
      amount: amount.toString(),
      blockNumber: event.blockNumber,
    });
    await newEvent.save();
    console.log("TokenBurned event saved:", newEvent);
  });

  bridgeContract.on("TokenReleased", async (token, user, amount, event) => {
    const newEvent = new Event({
      event: "TokenReleased",
      token,
      user,
      amount: amount.toString(),
      blockNumber: event.blockNumber,
    });
    await newEvent.save();
    console.log("TokenReleased event saved:", newEvent);
  });
}

listenEvents().catch(console.error);
