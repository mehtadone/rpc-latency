const ethers = require('ethers');
const ping = require('ping');

const type = process.argv[2]; // "http" or "wss"
const tries = process.argv[3];
const rpcUrls = process.argv.slice(4); // All command-line arguments after the tries

const network = {
  chainId: 1, // For Ethereum Mainnet
  name: 'homestead'
};

const transaction = {
  from: "0x0000000000000000000000000000000000000000", // Doesn't have to exist
  to: "0x000000000000000000000000000000000000dEaD" // Ethereum burn address
};

const address = '0x27aCED470E1E232BabF2Da93A78269bB5739C48C'; // address to get balance for

const results = {};

async function testProvider(rpcUrl, provider) {
  const times = [];
  const blockTimes = [];
  const balanceTimes = [];
  const pingResult = await ping.promise.probe(rpcUrl.split('//')[1].split(':')[0]);
  for(let i = 0; i < tries; i++) {
    const start = Date.now();
    const gasEstimate = await provider.estimateGas(transaction);
    const end = Date.now();
    console.log(`Iteration ${i+1}, Gas estimate: ${gasEstimate.toString()}`);
    times.push(end - start);

    const startBlock = Date.now();
    const block = await provider.getBlock();
    const endBlock = Date.now();
    console.log(`Iteration ${i+1}, Block number: ${block.number}`);
    blockTimes.push(endBlock - startBlock);

    const startBalance = Date.now();
    const balance = await provider.getBalance(address);
    const endBalance = Date.now();
    console.log(`Iteration ${i+1}, Balance: ${balance.toString()}`);
    balanceTimes.push(endBalance - startBalance);
  }
  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const averageBlock = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
  const averageBalance = balanceTimes.reduce((a, b) => a + b, 0) / balanceTimes.length;
  results[rpcUrl] = {'estimateGas': average, 'Ping speed': pingResult.avg, 'getBlock': averageBlock, 'getBalance': averageBalance};
}

async function testHttpProvider(rpcUrl) {
  const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    chainId: network.chainId,
    name: network.name
  });
  await testProvider(rpcUrl, customHttpProvider);
}

async function testWsProvider(rpcUrl) {
  const customWebSocketProvider = new ethers.providers.WebSocketProvider(rpcUrl, {
    chainId: network.chainId,
    name: network.name
  });
  await testProvider(rpcUrl, customWebSocketProvider);
}

if(type === "http") {
  Promise.all(rpcUrls.map(testHttpProvider)).then(() => console.table(results));
}

if(type === "wss") {
  Promise.all(rpcUrls.map(testWsProvider)).then(() => console.table(results));
}
