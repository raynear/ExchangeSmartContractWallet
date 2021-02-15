//const JSHToken = artifacts.require("JSHToken");
const MasterWallet = artifacts.require("MasterWallet");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
//const Wallet = artifacts.require("Wallet");

module.exports = async function(deployer, network, accounts) {
    // deployer.deploy(JSHToken, "SUHO", "JSH", 10000);
    // console.log('deployer', deployer);
    // console.log('network', network);
    console.log('accounts', accounts);
    const proxy = await deployProxy(MasterWallet, ["0x5d581D59F37c8E3d4682c291C1801ad00f2a120c"], { deployer, from:accounts[1] });
    console.log(proxy.address);
};

/*
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const Box = artifacts.require('Box');
const BoxV2 = artifacts.require('BoxV2');

describe('upgrades', () => {
  it('works', async () => {
    const box = await deployProxy(Box, [42]);
    const box2 = await upgradeProxy(box.address, BoxV2);

    const value = await box2.value();
    assert.equal(value.toString(), '42');
  });
})
*/