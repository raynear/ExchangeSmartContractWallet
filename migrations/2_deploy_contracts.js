const JSHToken = artifacts.require("JSHToken");
//const NBKToken = artifacts.require("NBKToken");
const MasterWallet = artifacts.require("MasterWallet");
const Wallet = artifacts.require("Wallet");
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
    deployer.deploy(JSHToken, "SUHO", "JSH", 10000);
    // deployer.deploy(NBKToken, "NBK", "NBK", 10000);
    // deployer.deploy(MasterWallet, deployer);
    const instance = await deployProxy(MasterWallet, [accounts[0]], { deployer });
    console.log(instance.address);
//    const upgraded = await upgradeProxy(instance.address, BoxV2, { deployer });
//    deployer.deploy(Wallet, '0x0');
};