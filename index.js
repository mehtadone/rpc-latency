const ethers = require('ethers');
const ping = require('ping');

const type = process.argv[2]; // "http" or "wss"
const tries = process.argv[3];
const rpcUrls = process.argv.slice(4); // All command-line arguments after the tries

const network = {
  chainId: 1, // For Ethereum Mainnet
  name: 'homestead'
};

const bearerToken = 'your-token';

const transaction = {
  from: "0x0000000000000000000000000000000000000000", // Doesn't have to exist
  to: "0x000000000000000000000000000000000000dEaD" // Ethereum burn address
};

const results = [];

if(type === "http") {
  rpcUrls.forEach(async rpcUrl => {
    const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      chainId: network.chainId,
      name: network.name
    });

    const times = [];
    const blockTimes = [];
    const pingResult = await ping.promise.probe(rpcUrl.split('//')[1].split(':')[0]);
    for(let i = 0; i < tries; i++) {
      const start = Date.now();
      const gasEstimate = await customHttpProvider.estimateGas(transaction);
      const end = Date.now();
      console.log(`HTTP Iteration ${i+1}, Gas estimate: ${gasEstimate.toString()}`);
      times.push(end - start);

      const startBlock = Date.now();
      const block = await customHttpProvider.getBlock();
      const endBlock = Date.now();
      console.log(`HTTP Iteration ${i+1}, Block number: ${block.number}`);
      blockTimes.push(endBlock - startBlock);
    }
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const averageBlock = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
    results.push({rpcUrl, 'Average HTTP RPC latency for estimateGas': average, 'Ping speed': pingResult.avg, 'Average HTTP RPC latency for getBlock': averageBlock});
    console.table(results);
  });
}

if(type === "wss") {
  rpcUrls.forEach(async rpcUrl => {
    const customWebSocketProvider = new ethers.providers.WebSocketProvider(rpcUrl, {
      chainId: network.chainId,
      name: network.name
    });

    const times = [];
    const blockTimes = [];
    const pingResult = await ping.promise.probe(rpcUrl.split('//')[1].split(':')[0]);
    for(let i = 0; i < tries; i++) {
      const start = Date.now();
      const gasEstimate = await customWebSocketProvider.estimateGas(transaction);
      const end = Date.now();
      console.log(`WSS Iteration ${i+1}, Gas estimate: ${gasEstimate.toString()}`);
      times.push(end - start);

      const startBlock = Date.now();
      const block = await customWebSocketProvider.getBlock();
      const endBlock = Date.now();
      console.log(`WSS Iteration ${i+1}, Block number: ${block.number}`);
      blockTimes.push(endBlock - startBlock);
    }
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const averageBlock = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
    results.push({rpcUrl, 'Average WSS RPC latency for estimateGas': average, 'Ping speed': pingResult.avg, 'Average WSS RPC latency for getBlock': averageBlock});
    console.table(results);
  });
}
