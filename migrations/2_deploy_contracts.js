const JSHToken = artifacts.require("JSHToken");
const NBKToken = artifacts.require("NBKToken");
const WalletFactory = artifacts.require("WalletFactory");
const Wallet = artifacts.require("Wallet");
const NewWallet = artifacts.require("NewWallet");

module.exports = function(deployer) {
    deployer.deploy(JSHToken, "SUHO", "JSH", 10000);
    deployer.deploy(NBKToken, "NBK", "NBK", 10000);
    deployer.deploy(WalletFactory);
//    deployer.deploy(Wallet, '0x0');
};