const JSHToken = artifacts.require("JSHToken");
const MasterWallet = artifacts.require("MasterWallet");
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
    deployer.deploy(JSHToken, "SUHO", "JSH", 10000);
    // deployer.deploy(NBKToken, "NBK", "NBK", 10000);
    // deployer.deploy(MasterWallet, deployer);
    //const proxy = await deployProxy(MasterWallet, [accounts[0]], { deployer });
    // console.log(proxy.address);
//    const upgraded = await upgradeProxy(instance.address, BoxV2, { deployer });
//    deployer.deploy(Wallet, '0x0');
};