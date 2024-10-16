import { ethers } from "ethers";
import bridgeJSON from "../../contracts/out/Bridge.sol/Bridge.json" assert { type: "json" };
import dannyTokenJSON from "../../contracts/out/DannyToken.sol/DannyToken.json" assert { type: "json" };
import wrappedTokenJSON from "../../contracts/out/WrappedToken.sol/WrappedToken.json" assert { type: "json" };
import dotenv from "dotenv";

dotenv.config();

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not defined in env");
}

if (!process.env.SEPOLIA_ENDPOINT) {
  throw new Error("SEPOLIA_ENDPOINT is not defined in env");
}

// const sepoliaProvider = new ethers.JsonRpcProvider(process.env.SEPOLIA_ENDPOINT);
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, sepoliaProvider);
// const baseSepoliaProvider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_ENDPOINT);
// const mainBridgeAddress = process.env.BRIDGE_SEPOLIA_ADDRESS;
// const targetBridgeAddress = process.env.BRIDGE_BASE_SEPOLIA_ADDRESS;
// const dannyTokenAddress = process.env.DANNY_TOKEN_ADDRESS;
// const wrappedTokenAddress = process.env.WRAPPED_TOKEN_ADDRESS;

const provider = new ethers.JsonRpcProvider(process.env.TEST_ENDPOINT);
const wallet = new ethers.Wallet(process.env.TEST_PRIVATE_KEY, provider);
const bridgeAddress = process.env.TEST_BRIDGE;
const dannyTokenAddress = process.env.TEST_DANNY_TOKEN;
const wrappedTokenAddress = process.env.TEST_WRAPPED_TOKEN;

const bridgeContract = new ethers.Contract(
  bridgeAddress,
  bridgeJSON.abi,
  wallet
);

const dannyTokenContract = new ethers.Contract(
  dannyTokenAddress,
  dannyTokenJSON.abi,
  wallet
);

const GAS_LIMIT = 3000000;

async function lock(tokenAddress, amount) {
  console.log(`Approving ${amount} tokens for the bridge contract...`);
  const approveTx = await dannyTokenContract.approve(
    bridgeAddress,
    ethers.parseUnits(amount, 18),
    {
      gasLimit: GAS_LIMIT,
    }
  );

  await approveTx.wait();
  const tx = await bridgeContract.lockTokens(
    tokenAddress,
    ethers.parseUnits(amount, 18),
    {
      gasLimit: GAS_LIMIT,
    }
  );

  await tx.wait();
  console.log(`Locked ${amount} tokens of ${tokenAddress}`);
  console.log(tx);
}

async function claim(tokenAddress, amount) {
  const tx = await bridgeContract.claimTokens(
    tokenAddress,
    ethers.parseUnits(amount, 18),
    {
      gasLimit: GAS_LIMIT,
    }
  );
  await tx.wait();
  console.log(`Claimed ${amount} tokens of ${tokenAddress}`);
}

async function burn(tokenAddress, amount) {
  const tx = await bridgeContract.burnTokens(
    tokenAddress,
    ethers.parseUnits(amount, 18),
    {
      gasLimit: GAS_LIMIT,
    }
  );
  await tx.wait();
  console.log(`Burned ${amount} tokens of ${tokenAddress}`);
}

async function release(tokenAddress, amount) {
  const tx = await bridgeContract.releaseTokens(
    tokenAddress,
    ethers.parseUnits(amount, 18),
    {
      gasLimit: GAS_LIMIT,
    }
  );
  await tx.wait();
  console.log(`Released ${amount} tokens of ${tokenAddress}`);
}

const args = process.argv.slice(2);
const command = args[0];
const tokenAddress = args[1];
const amount = args[2];

if (!command || !tokenAddress || !amount) {
  console.error("Usage: node cli.js <command> <tokenAddress> <amount>");
  process.exit(1);
}

switch (command) {
  case "lock":
    lock(tokenAddress, amount).catch(console.error);
    break;
  case "claim":
    claim(tokenAddress, amount).catch(console.error);
    break;
  case "burn":
    burn(tokenAddress, amount).catch(console.error);
    break;
  case "release":
    release(tokenAddress, amount).catch(console.error);
    break;
  default:
    console.error("Unknown command:", command);
    console.error("Usage: node cli.js <command> <tokenAddress> <amount>");
    process.exit(1);
}
