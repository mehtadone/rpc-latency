const ethers = require('ethers');
const ping = require('ping');

const type = process.argv[2]; // "http" or "wss"
const duration = parseInt(process.argv[3]) * 1000; // duration in milliseconds
const rpcUrls = process.argv.slice(4); // All command-line arguments after the duration

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
  const pingResult = await ping.promise.probe(rpcUrl.split('//')[1].split(':')[0]);
  const times = [];
  const balanceTimes = [];
  
  const start = Date.now();
  while (Date.now() - start < duration) {
    const startGasEstimate = Date.now();
    await provider.estimateGas(transaction);
    const endGasEstimate = Date.now();
    times.push(endGasEstimate - startGasEstimate);

    const startBalance = Date.now();
    await provider.getBalance(address);
    const endBalance = Date.now();
    balanceTimes.push(endBalance - startBalance);

    // Display a progress timer
    console.log(`Elapsed time: ${((Date.now() - start) / 1000).toFixed(2)} seconds`);
  }

  const average = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
  const averageBalance = (balanceTimes.reduce((a, b) => a + b, 0) / balanceTimes.length).toFixed(2);
  results[rpcUrl] = {'Ping speed': Number(pingResult.avg).toFixed(2), 'estimateGas': average, 'getBalance': averageBalance};
}

async function testHttpProvider(rpcUrl) {
  const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    chainId: network.chainId,
    name: network.name
  });
  return testProvider(rpcUrl, customHttpProvider);
}

async function testWsProvider(rpcUrl) {
  const customWebSocketProvider = new ethers.providers.WebSocketProvider(rpcUrl, {
    chainId: network.chainId,
    name: network.name
  });
  return testProvider(rpcUrl, customWebSocketProvider);
}

Promise.all(rpcUrls.map(type === "http" ? testHttpProvider : testWsProvider)).then(() => {
  console.table(results);
  process.exit(0);
});
