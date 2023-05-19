# rpc-latency

1. Make sure you have node and npm [installed](https://nodejs.org/en/download)

2. Go to a directory you want to download the files to in a terminal window and run `git clone https://github.com/mehtadone/rpc-latency`

3. Run `cd rpc-latency`

4. Run `npm install`

5. Run the apps by using `node index.js PROTOCOL DURATION node1 node2 ....` for example `node index.js http 60 https://rpc.ankr.com/eth https://cloudflare-eth.com` or `node index.js wss 60 https://rpc.ankr.com/eth https://cloudflare-eth.com` where 

 - PROTOCOL is either wss or http
 - DURATION is how long you want the test to run in seconds
 - Followed by a list of nodes you want to test, seperated by a space

