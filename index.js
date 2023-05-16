const ethers = require('ethers');

const type = process.argv[2]; // "http" or "wss"
const tries = process.argv[3];
const rpcUrls = process.argv.slice(4); // All command-line arguments after the tries

const network = {
  chainId: 1, // For Ethereum Mainnet
  name: 'homestead'
};

const results = [];

const transaction = {
  from: "0x0000000000000000000000000000000000000000", // Doesn't have to exist
  to: "0x000000000000000000000000000000000000dEaD" // Ethereum burn address
};

if(type === "http") {
  rpcUrls.forEach(rpcUrl => {
    const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      chainId: network.chainId,
      name: network.name
    });

    async function testHttpProvider() {
      const times = [];
      for(let i = 0; i < tries; i++) {
        const start = Date.now();
        const gasEstimate = await customHttpProvider.estimateGas(transaction);
        const end = Date.now();
        console.log(`HTTP Iteration ${i+1}, Gas estimate: ${gasEstimate.toString()}`);
        times.push(end - start);
      }
      const average = times.reduce((a, b) => a + b, 0) / times.length;
      results.push({rpcUrl, 'Average HTTP RPC latency': average});
      console.table(results);
    }
    
    // Test the provider
    testHttpProvider();
  });
}

if(type === "wss") {
  rpcUrls.forEach(rpcUrl => {
    const customWebSocketProvider = new ethers.providers.WebSocketProvider(rpcUrl, {
      chainId: network.chainId,
      name: network.name
    });

    async function testWsProvider() {
      const times = [];
      for(let i = 0; i < tries; i++) {
        const start = Date.now();
        const gasEstimate = await customWebSocketProvider.estimateGas(transaction);
        const end = Date.now();
        console.log(`WSS Iteration ${i+1}, Gas estimate: ${gasEstimate.toString()}`);
        times.push(end - start);
      }
      const average = times.reduce((a, b) => a + b, 0) / times.length;
      results.push({rpcUrl, 'Average WSS RPC latency': average});
      console.table(results);
    }

    // Test the provider
    testWsProvider();
  });
}
