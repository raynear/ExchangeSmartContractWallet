/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

// const HDWalletProvider = require('@truffle/hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

require("@babel/polyfill");
const LedgerWalletProvider = require("truffle-ledger-provider");
const HDWalletProvider = require('truffle-hdwallet-provider');
const PrivateKeyProvider = require("truffle-privatekey-provider");
var mnemonic = '';

const ledgerOptions = {
    networkId: 4,
    path: "44'/60'/0'/0",
    askConfirm: false,
    accountsLength: 1,
    accountsOffset: 0
}

privateKeys = [
  "bfd1400b8100f4a86418584de3ffc19c4e03a5f01ec8ca83bdda4eddd4d95f32", 
  "191a802194607553d725898aa4c65e0e768dca72a378030baebc0956e1cc7d81", 
  "4efd768a63a6e2da2d002f1b87a7ead63d6dbdb2d56c55861a5871f0d4674da6", 
  "2e9f7ed424973a62ac7fc28d9c5a56c722b848f0294a1fc88302995ed7d45627", 
  "0a3c1dcd258e7b503ef2b628c2d8909aa58c9f76356e874cd9cd03a42bf4dfd7", 
  "175babc0ac3685d23e09faa90d4c765f477eceac66a5e41ed787782cd2eea958", 
  "f01d20ea0abaeb18c25858d8dea1abb2b19aa389c223026719d9495404d8000b", 
  "165b46310fcf52d1b8f3669e226f0305684a56b6e5ac2faa11ef2e732b3ee995", 
  "d7383b279e4d5fc38c5da836ec0e83157395a5a9b1191bd5778bc92fa6474ab8",
  "c4114052b47e9836a749bc39f6ce0178b17bd3b0e18cd6bf22589a822a40ca50" 
];

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      // provider: function() {
      //   return new PrivateKeyProvider("c89bc66f8e5231642aa7120cb876819c48b539659cbda0b1516a92b6174be4e0", "http://127.0.0.1:7545");
      // },
      // provider: function() {
      //   return new HDWalletProvider(privateKeys, "http://127.0.0.1:7545", 0, 10)
      // },
      // provider: function() {
      //   // return new HDWalletProvider(privateKeys, "https://rinkeby.infura.io/v3/26efc52b4864486a95ba0158dfc3671e");
      //   return new HDWalletProvider(privateKeys, "http://127.0.0.1:7545", 0, 10);
      // },
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      gas: 4000000,
    },
     rinkeby: {
 //      provider: new LedgerWalletProvider(ledgerOptions, "http://url.com"),
       provider: function() {
         return new HDWalletProvider(privateKeys, "https://rinkeby.infura.io/v3/26efc52b4864486a95ba0158dfc3671e", 0, 10);
       },
       network_id: 4,
       gas: 4000000
     },
//     mainnet: {
// //      provider: new LedgerWalletProvider(ledgerOptions, "http://url.com"),
//       provider: function() {
//         return new HDWalletProvider("75fad522265e340ff6ad218151c933f01b65236206426bf45334af52b36dfde2", "https://mainnet.infura.io/v3/26efc52b4864486a95ba0158dfc3671e");
//       },
//       network_id: 1,
//       gas: 4000000
//     },
    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.6.12",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 2000
       },
      //  evmVersion: "byzantium"
      // }
    }
  }
};
