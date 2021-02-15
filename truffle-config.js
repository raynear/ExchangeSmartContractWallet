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
  "9ebd87b93069f9722fe209719c2eb4da270df11043cb156bbbf916cd1eff94ff",
  "75fad522265e340ff6ad218151c933f01b65236206426bf45334af52b36dfde2",
  "c9da919f305ceb6cfc579552b7c3536ec8e43cf35e3655df69fb0842057e53df",
  "73a5e6d3a27abe6b4d968afaa493cb5dccfa74e5d68ea9a610b8828ef2249d12",
  "2993fda78a23e44ec67ebd2e4da9133b593ac31ff14e16b723798506a1941b5b",
  "a3616ec81a2492e5923a7bccc5b9ce25446a457d0664f62a42d50e273cb3b8d0",
  "bf49eea28cbce00e043fba3b3c394d1ca5147f28df798a65e46d2baddaa27c51",
  "2e9cbd94a46b6bdabffd910e6b5c3ba73360b147be8befeb664901eaa312d8e4",
  "7f4cba812875e0b41de46280a743709db97dc44d05a196d0c223c0a65a4da9b3",
  "ff1be13186d9a0c8f20ebab5e018cf7e76d552f34e9de711d6247605de4f7fe6"
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
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    rinkeby: {
//      provider: new LedgerWalletProvider(ledgerOptions, "http://url.com"),
      provider: function() {
        return new HDWalletProvider(privateKeys, "https://rinkeby.infura.io/v3/26efc52b4864486a95ba0158dfc3671e");
      },
      network_id: 4,
      gas: 4000000
    },
    mainnet: {
//      provider: new LedgerWalletProvider(ledgerOptions, "http://url.com"),
      provider: function() {
        return new HDWalletProvider("75fad522265e340ff6ad218151c933f01b65236206426bf45334af52b36dfde2", "https://mainnet.infura.io/v3/26efc52b4864486a95ba0158dfc3671e");
      },
      network_id: 1,
      gas: 4000000
    },
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
