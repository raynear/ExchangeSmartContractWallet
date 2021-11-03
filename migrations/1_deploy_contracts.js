const JSHToken = artifacts.require("JSHToken");
const NBKToken = artifacts.require("NBKToken");
const MasterWallet = artifacts.require("MasterWallet");
const HotWallet = artifacts.require("HotWallet");
const Wallet = artifacts.require("Wallet");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const upgrades_core_1 = require("@openzeppelin/upgrades-core");
const truffle_1 = require("@openzeppelin/truffle-upgrades/dist/truffle");
const validate_1 = require("@openzeppelin/truffle-upgrades/dist/validate");
const deploy_1 = require("@openzeppelin/truffle-upgrades/dist/utils/deploy");
const factories_1 = require("@openzeppelin/truffle-upgrades/dist/factories");
const wrap_provider_1 = require("@openzeppelin/truffle-upgrades/dist/wrap-provider");
const options_1 = require("@openzeppelin/truffle-upgrades/dist/options");

async function deployProxyCustom(Contract, args = [], opts = {}, account) {
    if (!Array.isArray(args)) {
        opts = args;
        args = [];
    }
    let { deployer } = options_1.withDeployDefaults(opts);
    const provider = wrap_provider_1.wrapProvider(deployer.provider);
    const { contracts_build_directory, contracts_directory } = truffle_1.getTruffleConfig();
    const validations = await validate_1.validateArtifacts(contracts_build_directory, contracts_directory);
    const linkedBytecode = await validate_1.getLinkedBytecode(Contract, provider);
    const version = upgrades_core_1.getVersion(Contract.bytecode, linkedBytecode);
    upgrades_core_1.assertUpgradeSafe([validations], version, opts);
    const impl = await upgrades_core_1.fetchOrDeploy(version, provider, async () => {
        const deployment = await deploy_1.deploy(Contract, deployer);
        const layout = upgrades_core_1.getStorageLayout([validations], version);
        return { ...deployment, layout };
    });
    const AdminFactory = factories_1.getProxyAdminFactory(Contract);
    const adminAddress = await upgrades_core_1.fetchOrDeployAdmin(provider, () => deploy_1.deploy(AdminFactory, deployer));
    const data = getInitializerData(Contract, args, opts.initializer);
    const AdminUpgradeabilityProxy = factories_1.getProxyFactory(Contract);
    const proxy = await deployer.deploy(AdminUpgradeabilityProxy, impl, adminAddress, data, {from:account});
    Contract.address = proxy.address;
    const contract = new Contract(proxy.address);
    contract.transactionHash = proxy.transactionHash;
    return contract;
}

function getInitializerData(Contract, args, initializer) {
    if (initializer === false) {
        return '0x';
    }
    const allowNoInitialization = initializer === undefined && args.length === 0;
    initializer = initializer !== null && initializer !== void 0 ? initializer : 'initialize';
    const stub = new Contract('');
    if (initializer in stub.contract.methods) {
        return stub.contract.methods[initializer](...args).encodeABI();
    }
    else if (allowNoInitialization) {
        return '0x';
    }
    else {
        throw new Error(`Contract ${Contract.name} does not have a function \`${initializer}\``);
    }
}

module.exports = async function(deployer, network, accounts) {
    deployer.deploy(JSHToken, "SUHO", "JSH", 100000000);
    deployer.deploy(NBKToken, "RAYNEAR", "NBK", 100000000);
    console.log('deployer', deployer);
    console.log('network', network);
    console.log('accounts', accounts);
    // const proxy = await deployProxy(MasterWallet, ["0x5d581D59F37c8E3d4682c291C1801ad00f2a120c"], { deployer, from:accounts[1] });
    // const hotProxy= await deployProxy(HotWallet, [accounts[0], accounts[0]], { deployer });
    // console.log(hotProxy.address);
    // console.log(HotWallet.address);
    // const hotProxy= await deployProxy(HotWallet, [accounts[0], accounts[0]], { deployer });
    // const walletProxy = await deployProxyCustom(Wallet, [accounts[0]], { deployer }, accounts[1]);
    // console.log(walletProxy.address);
    // const wallet = await deployer.deploy(Wallet, {from:accounts[1]});
    // const masterProxy = await deployProxy(MasterWallet, [hotProxy.address, wallet.address], { deployer });
    // console.log(masterProxy.address);
};
