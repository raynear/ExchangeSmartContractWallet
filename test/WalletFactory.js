//const path = require('path');
const fs = require('fs');
//const solc = require('solc');

const Assert = require('truffle-assertions');
const abiDecoder = require('abi-decoder');
//const EthWallet = require('ethereumjs-wallet'); 
//const EthTx = require('ethereumjs-tx');
//const Eth = require('ethjs-query');
//const WalletProvider = require('truffle-wallet-provider');

const JSHToken = artifacts.require("JSHToken");
const NBKToken = artifacts.require("NBKToken");
const MasterWallet = artifacts.require("MasterWallet");
const Wallet = artifacts.require("Wallet");

// const ProxyAdmin = artifacts.require("ProxyAdmin");
// const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabiliyProxy");

const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

// const pkProvider = require('truffle-privatekey-provider');
// const PrivateKeyProvider = require('truffle-privatekey-provider');


const masterWalletJson = JSON.parse(fs.readFileSync('./test/MasterWallet.json', 'utf8'));
abiDecoder.addABI(masterWalletJson.abi);


contract("MasterWallet", async accounts => {
    let factory;
    let walletAddress;
    let wallet;
    let token, token2;
    let proxy;

    const pks = [
        "c89bc66f8e5231642aa7120cb876819c48b539659cbda0b1516a92b6174be4e0",
        "48f836e261674c912a2c3997a97438ee225aafa96ed86d045f13a669dfdf51a0",
        "c9da919f305ceb6cfc579552b7c3536ec8e43cf35e3655df69fb0842057e53df",
        "73a5e6d3a27abe6b4d968afaa493cb5dccfa74e5d68ea9a610b8828ef2249d12",
        "2993fda78a23e44ec67ebd2e4da9133b593ac31ff14e16b723798506a1941b5b",
        "a3616ec81a2492e5923a7bccc5b9ce25446a457d0664f62a42d50e273cb3b8d0",
        "bf49eea28cbce00e043fba3b3c394d1ca5147f28df798a65e46d2baddaa27c51",
        "2e9cbd94a46b6bdabffd910e6b5c3ba73360b147be8befeb664901eaa312d8e4",
        "7f4cba812875e0b41de46280a743709db97dc44d05a196d0c223c0a65a4da9b3",
        "ff1be13186d9a0c8f20ebab5e018cf7e76d552f34e9de711d6247605de4f7fe6"
    ]

    let master;
    let manager;
    let cold;
    let user;
    let user2;
    let user3;

    const zeroAddress = '0x0000000000000000000000000000000000000000';

    before("before", async () => {
        // for (let i=0 ; i<10 ; i++) {
        //     let addr = web3.eth.accounts.privateKeyToAccount(pks[i]).address;
        //     console.log('addr', addr);

        //     await web3.eth.sendTransaction({ from: accounts[i], to: addr, value: web3.utils.toWei("99.8", "ether")});
        // }

        // for (let i=0 ; i<10 ; i++) {
        //     await web3.eth.accounts.wallet.add(pks[i]);
        // }
        // accountsArray = await web3.eth.getAccounts();

        // for (let i=0 ; i<10 ; i++) {
        //     accountsArray.push(web3.eth.accounts.wallet[i].address);
        // }
        // // accounts = web3.eth.accounts;
        // console.log(accounts);
        // // console.log(web3.eth.accounts);

        // accounts = accountsArray;

        console.log(global);

        master = accounts[0];
        manager = accounts[1];
        cold = accounts[2];
        user = accounts[3];
        user2 = accounts[4];
        user3 = accounts[5];

        console.log(accounts);

        token = await JSHToken.new("SUHO", "JSH", 10000, {from:master}); 
        token2 = await NBKToken.new("NBK", "NBK", 10000000, {from:master}); 

        //factory = await MasterWallet.new({from:master});
        //await factory.initialize(master);

        // have to fail
        //await Assert.reverts(factory.initialize(user));

        proxy = await deployProxy(MasterWallet, [master], {from:master});
        factory = await MasterWallet.at(proxy.address);
        // console.log("proxy", proxy.address);
        // console.log("factory", factory.address);

        walletModel = await Wallet.new();

        web3.eth.accounts.wallet.add('0xc89bc66f8e5231642aa7120cb876819c48b539659cbda0b1516a92b6174be4e0');
        console.log(accounts);

        // proxyAdmin = await ProxyAdmin.new();
        // adminUpgradeabilityProxy = await AdminUpgradeabilityProxy.new();

        await factory.setWalletModel(walletModel.address);

        // const vanityPK = 'c89bc66f8e5231642aa7120cb876819c48b539659cbda0b1516a92b6174be4e0';

        // const privKeyBuf = Buffer.from(vanityPK, 'hex');


        // var wallet = EthWallet.default.fromPrivateKey(privKeyBuf);

        // await web3.eth.sendTransaction({
        //     from: accounts[9],
        //     to: wallet.getAddressString(),
        //     value: web3.utils.toWei("2", "ether"),
        //     data: '0x'
        // });

        // provider = new PrivateKeyProvider(vanityPK, '127.0.0.1:7545');

        // web3.setProvider(provider);

        // var result = await new web3.eth.Contract(JSON.parse())

        // walletProxy = await deployProxy(Wallet, [factory.address], {from:wallet.getAddressString()});
        // factory.setWalletModel(walletProxy.address);
        // console.log('walletProxy address', walletProxy.address);
    });

    beforeEach("beforeEach", async () => {
        let result = await factory.setManager(manager, { from: master });
        Assert.eventEmitted(result, 'ManagerChanged');
        result = await factory.setColdWallet(cold, { from: master });
        Assert.eventEmitted(result, 'ColdWalletChanged');
    });

    afterEach("afterEach", async () => {
        let result = await factory.delManager(manager, { from: master });
        Assert.eventEmitted(result, 'ManagerChanged');
        result = await factory.setColdWallet(zeroAddress, { from: master });
        Assert.eventEmitted(result, 'ColdWalletChanged');
    });

    describe("create user wallet", () => {
        it("createWallet", async () => {
            // wallet create test
            let res = await factory.createWallet(1, { from: manager });
            walletAddress = res.logs[0].args.walletAddress[0];
            console.log('walletAddress', walletAddress);

            // only manager can create wallet
            await Assert.reverts(factory.createWallet(1, { from: user }));
            await Assert.reverts(factory.createWallet(1, { from: master }));
        });

        it("wallet load", async () => {
            wallet = await Wallet.at(walletAddress);

            await Assert.reverts(wallet.initialize(user));
        });

        it('create many', async () => {
            let res = await factory.createWallet(50, { from: manager });
            walletAddresses = res.logs[0].args.walletAddress;
            assert(walletAddresses.length === 50, "have to make 100 address");
            // console.log('walletAddress', walletAddresses, res.logs);
        });
    });

    describe("coldwallet", () => {
        it("setColdWallet", async () => {
            // set cold wallet
            let result = await factory.setColdWallet(cold, { from: master });
            Assert.eventEmitted(result, 'ColdWalletChanged');
            let coldWallet = await factory.getColdWallet();
            assert.equal(coldWallet, cold, "have to same")

            // only master can set cold wallet
            await Assert.reverts(factory.setColdWallet(user, { from: user }), "Ownable: caller is not the owner", "Ownable Failed");
        });
    });

    describe("transfer", () => {
        it("ether transfer", async () => {
            // if send ether to user wallet it redirect to factorywallet
            wallet = await Wallet.at(walletAddress);
            let walletBalance = await web3.eth.getBalance(wallet.address);
            let result = await web3.eth.sendTransaction({ from: user, to: wallet.address, value: web3.utils.toWei("1", "ether")});
            //const decodedLogs = abiDecoder.decodeLogs(result.logs);
            //console.log(decodedLogs, decodedLogs[0].events[0]);
            // Assert.eventEmitted(result, 'Transfer');
            let newWalletBalance = await web3.eth.getBalance(wallet.address);
            assert.equal(parseFloat(web3.utils.fromWei(newWalletBalance)), parseFloat(web3.utils.fromWei(walletBalance))+parseFloat(web3.utils.fromWei(web3.utils.toWei("1", "ether"))), 'have to increase');
            //원복
            await factory.gathering([zeroAddress], [wallet.address], {from:manager});
            factory.sendTokens([zeroAddress], [user], [web3.utils.toWei('1', 'ether')], {from:manager});
        });

        it("erc20 transfer", async () => {
            wallet = await Wallet.at(walletAddress);
            result = await factory.getColdWallet();
            assert.equal(result, cold, 'token cold wallet setting failed')
            result = await token.transfer(wallet.address, web3.utils.toWei("1", "ether"), { from: master });
            Assert.eventEmitted(result, 'Transfer');
            result = await token2.transfer(wallet.address, web3.utils.toWei("2", "ether"), { from: master });
            Assert.eventEmitted(result, 'Transfer');
            assert.notEqual(token.balanceOf(wallet.address), 0);
            assert.notEqual(token2.balanceOf(wallet.address), 0);
            result = await wallet.transfer(token.address, { from: manager });
            result = await wallet.transfer(token2.address, { from: manager });
            //Assert.eventEmitted(result, 'Transfer');
            let balance = await token.balanceOf(wallet.address);
            assert.equal(balance, 0);
            balance = await token2.balanceOf(wallet.address);
            assert.equal(balance, 0);

            // 원복
            await wallet.transfer(token.address);
            await wallet.transfer(token2.address);
        });
    });

    describe("rebalancing", () => {
        it("rebalancing ether", async () => {
            await web3.eth.sendTransaction({ from: user2, to: factory.address, value: web3.utils.toWei("99", "ether")});
            let factoryBalance1 = await web3.utils.fromWei(await web3.eth.getBalance(factory.address), "ether");
            let coldBalance1 = await web3.utils.fromWei(await web3.eth.getBalance(cold), "ether");
            let result = await factory.rebalancing(zeroAddress, {from:manager});
            let factoryBalance2 = await web3.utils.fromWei(await web3.eth.getBalance(factory.address), "ether");
            let coldBalance2 = await web3.utils.fromWei(await web3.eth.getBalance(cold), "ether");
            console.log(factoryBalance1, coldBalance1, '=>', factoryBalance2, coldBalance2);
            // assert.equal((factoryBalance1+coldBalance1)*0.3, factoryBalance2);
            // 원복
            await web3.eth.sendTransaction({ from: cold, to: user2, value: web3.utils.toWei("39.29", "ether")});
            await factory.sendTokens([zeroAddress], [user2], [web3.utils.toWei("59.69", "ether")], {from:manager});
        });

        it("rebalancing token", async () => {
            await token.transfer(factory.address, web3.utils.toWei("10", "ether"), { from: master });
            let factoryBalance1 = web3.utils.fromWei(await token.balanceOf(factory.address), "ether");
            let coldBalance1 = web3.utils.fromWei(await token.balanceOf(cold), "ether");
            let result = await factory.rebalancing(token.address, {from:manager});
            let factoryBalance2 = web3.utils.fromWei(await token.balanceOf(factory.address), "ether");
            let coldBalance2 = web3.utils.fromWei(await token.balanceOf(cold), "ether");
            console.log(factoryBalance1, coldBalance1, '=>', factoryBalance2, coldBalance2);
            // assert.equal((factoryBalance1+coldBalance1)*0.3, factoryBalance2);

            await token2.transfer(factory.address, web3.utils.toWei("20", "ether"), { from: master });
            factoryBalance1 = web3.utils.fromWei(await token2.balanceOf(factory.address), "ether");
            coldBalance1 = web3.utils.fromWei(await token2.balanceOf(cold), "ether");
            result = await factory.rebalancing(token2.address, {from:manager});
            factoryBalance2 = web3.utils.fromWei(await token2.balanceOf(factory.address), "ether");
            coldBalance2 = web3.utils.fromWei(await token2.balanceOf(cold), "ether");
            console.log(factoryBalance1, coldBalance1, '=>', factoryBalance2, coldBalance2);
            // assert.equal((factoryBalance1+coldBalance1)*0.3, factoryBalance2);
        });

        it("rebalancing many", async () => {
            await web3.eth.sendTransaction({ from: user3, to: factory.address, value: web3.utils.toWei("99", "ether")});
            await token.transfer(factory.address, web3.utils.toWei("10", "ether"), { from: master });
            await token2.transfer(factory.address, web3.utils.toWei("30", "ether"), { from: master });
            let factoryBalance1 = await web3.utils.fromWei(await web3.eth.getBalance(factory.address), "ether");
            let coldBalance1 = await web3.utils.fromWei(await web3.eth.getBalance(cold), "ether");
            let factoryTokenBalance1 = web3.utils.fromWei(await token.balanceOf(factory.address), "ether");
            let coldTokenBalance1 = web3.utils.fromWei(await token.balanceOf(cold), "ether");
            let factoryToken2Balance1 = web3.utils.fromWei(await token2.balanceOf(factory.address), "ether");
            let coldToken2Balance1 = web3.utils.fromWei(await token2.balanceOf(cold), "ether");
            let result = await factory.rebalancingMany([zeroAddress, token.address, token2.address], {from:manager});
            let factoryBalance2 = await web3.utils.fromWei(await web3.eth.getBalance(factory.address), "ether");
            let coldBalance2 = await web3.utils.fromWei(await web3.eth.getBalance(cold), "ether");
            let factoryTokenBalance2 = web3.utils.fromWei(await token.balanceOf(factory.address), "ether");
            let coldTokenBalance2 = web3.utils.fromWei(await token.balanceOf(cold), "ether");
            let factoryToken2Balance2 = web3.utils.fromWei(await token2.balanceOf(factory.address), "ether");
            let coldToken2Balance2 = web3.utils.fromWei(await token2.balanceOf(cold), "ether");
            console.log(factoryBalance1, coldBalance1, '=>', factoryBalance2, coldBalance2);
            // assert.equal((factoryBalance1+coldBalance1)*0.3, factoryBalance2);
            console.log(factoryTokenBalance1, coldTokenBalance1, '=>', factoryTokenBalance2, coldTokenBalance2);
            // assert.equal((factoryTokenBalance1+coldTokenBalance1)*0.3, factoryTokenBalance2);
            console.log(factoryToken2Balance1, coldToken2Balance1, '=>', factoryToken2Balance2, coldToken2Balance2);
            // assert.equal((factoryToken2Balance1+coldToken2Balance1)*0.3, factoryToken2Balance2);
            // 원복
            await web3.eth.sendTransaction({ from: cold, to: user3, value: web3.utils.toWei("39.29", "ether")});
            await factory.sendTokens([zeroAddress], [user3], [web3.utils.toWei("59.69", "ether")], {from:manager});
            // token은 원복 필요 없음
        });
    });

    describe("withdraw & gathering", () => {
        it("withdraw many", async () => {
            await web3.eth.sendTransaction({ from: master, to: factory.address, value: web3.utils.toWei("21", "ether")});
            await token.transfer(factory.address, web3.utils.toWei("21", "ether"), { from: master });
            await token2.transfer(factory.address, web3.utils.toWei("21", "ether"), { from: master });

            let fTokenBalance = await token.balanceOf(factory.address);
            var fBalance = await web3.eth.getBalance(factory.address);
            let tokenBalance = await token.balanceOf(cold);
            var balance = await web3.eth.getBalance(cold);
            let result = await factory.sendTokens(
                [
                    token.address, token.address, token.address,
                    token2.address, token2.address, token2.address,
                    zeroAddress, zeroAddress, zeroAddress,
                    zeroAddress, zeroAddress, zeroAddress
                ], [
                    user,user,user,user,user,user,
                    user,user,user,user,user,user
                ], [
                    web3.utils.toWei("1", "ether"),
                    web3.utils.toWei("2", "ether"),
                    web3.utils.toWei("3", "ether"),
                    web3.utils.toWei("4", "ether"),
                    web3.utils.toWei("5", "ether"),
                    web3.utils.toWei("6", "ether"),
                    web3.utils.toWei("1", "ether"),
                    web3.utils.toWei("2", "ether"),
                    web3.utils.toWei("3", "ether"),
                    web3.utils.toWei("4", "ether"),
                    web3.utils.toWei("5", "ether"),
                    web3.utils.toWei("6", "ether")
                ],
                { from: manager }
            );
            let fTokenBalance2 = await token.balanceOf(factory.address);
            var fBalance2 = await web3.eth.getBalance(factory.address);
            let tokenBalance2 = await token.balanceOf(cold);
            var balance2 = await web3.eth.getBalance(cold);

            result = await Assert.reverts(factory.sendTokens(
                [
                    token.address, token.address, token.address,
                    token2.address, token.address, token2.address,
                    zeroAddress, zeroAddress, zeroAddress,
                    zeroAddress, zeroAddress, zeroAddress
                ], [
                    user,user,user,user,user,user,
                    user,user,user,user,user,user
                ], [
                    web3.utils.toWei("0.123", "ether"),
                    web3.utils.toWei("0.223", "ether"),
                    web3.utils.toWei("0.423", "ether"),
                    web3.utils.toWei("0.413", "ether"),
                    web3.utils.toWei("0.433", "ether"),
                    web3.utils.toWei("400.463", "ether"),
                    web3.utils.toWei("0.443", "ether"),
                    web3.utils.toWei("5.123", "ether"),
                    web3.utils.toWei("0.223", "ether"),
                    web3.utils.toWei("100.323", "ether"),
                    web3.utils.toWei("0.623", "ether"),
                    web3.utils.toWei("0.323", "ether")
                ],
                { from: manager }
            ));
            // 원복
            await web3.eth.sendTransaction({ from: user, to: master, value: web3.utils.toWei("21", "ether")});
        });

        it("gathering many", async () => {
            let res = await factory.createWallet(4, { from: manager });
            let userWallet1 = res.logs[0].args.walletAddress[0];
            let userWallet2 = res.logs[0].args.walletAddress[1];
            let userWallet3 = res.logs[0].args.walletAddress[2];
            let userWallet4 = res.logs[0].args.walletAddress[3];

            await token.transfer(userWallet1, web3.utils.toWei("1", "ether"), { from: master });
            await token.transfer(userWallet2, web3.utils.toWei("2", "ether"), { from: master });
            await token.transfer(userWallet3, web3.utils.toWei("3", "ether"), { from: master });
            await token.transfer(userWallet4, web3.utils.toWei("4", "ether"), { from: master });
            await token2.transfer(userWallet1, web3.utils.toWei("3", "ether"), { from: master });
            await token2.transfer(userWallet2, web3.utils.toWei("4", "ether"), { from: master });
            await token2.transfer(userWallet3, web3.utils.toWei("5", "ether"), { from: master });
            await token2.transfer(userWallet4, web3.utils.toWei("6", "ether"), { from: master });
            await web3.eth.sendTransaction({from: user3, to: userWallet1, value:web3.utils.toWei("1", "ether")});
            await web3.eth.sendTransaction({from: user3, to: userWallet2, value:web3.utils.toWei("2", "ether")});
            await web3.eth.sendTransaction({from: user3, to: userWallet3, value:web3.utils.toWei("3", "ether")});
            await web3.eth.sendTransaction({from: user3, to: userWallet4, value:web3.utils.toWei("4", "ether")});

            let result = await factory.gathering(
                [
                    token.address,token.address,
                    token.address,token.address,
                    token2.address,token2.address,
                    token2.address,token2.address,
                    zeroAddress, zeroAddress,
                    zeroAddress, zeroAddress
                ], [
                    userWallet1,
                    userWallet2,
                    userWallet3,
                    userWallet4,
                    userWallet1,
                    userWallet2,
                    userWallet3,
                    userWallet4,
                    userWallet1,
                    userWallet2,
                    userWallet3,
                    userWallet4
                ],
                { from: manager }
            );


            // 잔액0 체크, gather to cold check
            let balance1 = web3.utils.fromWei(await token.balanceOf(userWallet1), "ether");
            let balance2 = web3.utils.fromWei(await token.balanceOf(userWallet2), "ether");
            let balance3 = web3.utils.fromWei(await token.balanceOf(userWallet3), "ether");
            let balance4 = web3.utils.fromWei(await token.balanceOf(userWallet4), "ether");
            assert.equal(balance1, 0, "gather fail");
            assert.equal(balance2, 0, "gather fail");
            assert.equal(balance3, 0, "gather fail");
            assert.equal(balance4, 0, "gather fail");
            // 잔액0 체크, gather to cold check
            balance1 = web3.utils.fromWei(await token2.balanceOf(userWallet1), "ether");
            balance2 = web3.utils.fromWei(await token2.balanceOf(userWallet2), "ether");
            balance3 = web3.utils.fromWei(await token2.balanceOf(userWallet3), "ether");
            balance4 = web3.utils.fromWei(await token2.balanceOf(userWallet4), "ether");
            assert.equal(balance1, 0, "gather fail");
            assert.equal(balance2, 0, "gather fail");
            assert.equal(balance3, 0, "gather fail");
            assert.equal(balance4, 0, "gather fail");

            let ethBalance1 = web3.utils.fromWei(await web3.eth.getBalance(userWallet1), "ether");
            let ethBalance2 = web3.utils.fromWei(await web3.eth.getBalance(userWallet2), "ether");
            let ethBalance3 = web3.utils.fromWei(await web3.eth.getBalance(userWallet3), "ether");
            let ethBalance4 = web3.utils.fromWei(await web3.eth.getBalance(userWallet4), "ether");
            assert.equal(ethBalance1, 0, "gather fail");
            assert.equal(ethBalance2, 0, "gather fail");
            assert.equal(ethBalance3, 0, "gather fail");
            assert.equal(ethBalance4, 0, "gather fail");

            result = await factory.sendTokens(
                [
                    token.address, token2.address, zeroAddress
                ], [
                    master,master,user3
                ], [
                    web3.utils.toWei("10", "ether"),
                    web3.utils.toWei("18", "ether"),
                    web3.utils.toWei("10", "ether")
                ],
                { from: manager }
            );
        });
    });
});

// Compile contract
function compile(fileName, contractName) {
    const contractPath = path.resolve(__dirname, fileName);
    const source = fs.readFileSync(contractPath, 'utf8');
    const input = {
    language: 'Solidity',
    sources: {
        fileName: {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
    };
    const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractFile = tempFile.contracts[fileName][contractName];
}
