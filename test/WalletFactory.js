const Assert = require('truffle-assertions');

const JSHToken = artifacts.require("JSHToken");
const MasterWallet = artifacts.require("MasterWallet");
const Wallet = artifacts.require("Wallet");

const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

contract("MasterWallet", async accounts => {
    let factory;
    let walletAddress;
    let wallet;
    let token;
    let proxy;

    const master = accounts[0];
    const manager = accounts[1];
    const cold = accounts[2];
    const user = accounts[3];
    const user2 = accounts[4];
    const user3 = accounts[5];

    const zeroAddress = '0x0000000000000000000000000000000000000000';

    before("before", async () => {
        token = await JSHToken.new("SUHO", "JSH", 10000, {from:master}); 

        factory = await MasterWallet.new({from:master});
        await factory.initialize(master);

        // proxy = await deployProxy(MasterWallet, [master], {master});
        // factory = await MasterWallet.at(proxy.address);
        // assert.notEqual(factory.owner(), master, "proxy ok");
    });

    beforeEach("beforeEach", async () => {
        let result = await factory.setManager(manager, { from: master });
        Assert.eventEmitted(result, 'ManagerChanged');
        result = await factory.setColdWallet(token.address, cold, { from: master });
        Assert.eventEmitted(result, 'ColdWalletChanged');
    });

    afterEach("afterEach", async () => {
        let result = await factory.delManager(manager, { from: master });
        Assert.eventEmitted(result, 'ManagerChanged');
        result = await factory.setColdWallet(token.address, zeroAddress, { from: master });
        Assert.eventEmitted(result, 'ColdWalletChanged');
    });

    describe("create user wallet", () => {
        it("createWallet", async () => {
            let res = await factory.createWallet({ from: manager });
            walletAddress = res.logs[0].args.walletAddress;
            console.log("wallet address", walletAddress);
        });

        it("wallet load", async () => {
            wallet = await Wallet.at(walletAddress);
        });
    });

    describe("coldwallet", () => {
        it("setColdWallet", async () => {
            let result = await factory.setColdWallet(token.address, cold, { from: master });
            Assert.eventEmitted(result, 'ColdWalletChanged');
            let coldWallet = await factory.getColdWallet(token.address);
            assert.equal(coldWallet, cold, "have to same")

            result = await factory.setColdWallet(zeroAddress, cold, { from: master });
            Assert.eventEmitted(result, 'ColdWalletChanged');
            coldWallet = await factory.getColdWallet(zeroAddress);
            assert.equal(coldWallet, cold, "have to same")

            await Assert.reverts(factory.setColdWallet(token.address, user, { from: user }), "Ownable: caller is not the owner", "Ownable Failed");
        });
    });

    describe("transfer", () => {
        it("ether transfer", async () => {
            wallet = await Wallet.at(walletAddress);
            let coldBalance = await web3.eth.getBalance(cold);
            let result = await factory.getColdWallet(zeroAddress);
            result = await web3.eth.sendTransaction({ from: user, to: wallet.address, value: web3.utils.toWei("1", "ether")});
            // Assert.eventEmitted(result, 'Transfer');
            let newColdBalance = await web3.eth.getBalance(cold);
            assert.equal(parseFloat(web3.utils.fromWei(newColdBalance)), parseFloat(web3.utils.fromWei(coldBalance))+parseFloat(web3.utils.fromWei(web3.utils.toWei("1", "ether"))), 'have to increase');

            // 원복
            await web3.eth.sendTransaction({ from: cold, to: master, value: web3.utils.toWei("1", "ether")});
        });

        it("erc20 transfer", async () => {
            wallet = await Wallet.at(walletAddress);
            result = await factory.getColdWallet(token.address, { from: user });
            assert.equal(result, cold, 'token cold wallet setting failed')
            result = await token.transfer(wallet.address, web3.utils.toWei("1", "ether"), { from: master });
            Assert.eventEmitted(result, 'Transfer');
            assert.notEqual(token.balanceOf(wallet.address), 0);
            result = await wallet.transfer(token.address, { from: manager });
            //Assert.eventEmitted(result, 'Transfer');
            let balance = await token.balanceOf(wallet.address);
            assert.equal(balance, 0);

            // 원복
            await wallet.transfer(token.address);
            await token.transfer(master, web3.utils.toWei("1", "ether"), { from: cold});
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
            // 원복
            await web3.eth.sendTransaction({ from: cold, to: user2, value: web3.utils.toWei("39", "ether")});
            await factory.sendTokens([zeroAddress], [user2], [web3.utils.toWei("59", "ether")], {from:manager});
        });

        it("rebalancing token", async () => {
            await token.transfer(factory.address, web3.utils.toWei("10", "ether"), { from: master });
            let factoryBalance1 = web3.utils.fromWei(await token.balanceOf(factory.address), "ether");
            let coldBalance1 = web3.utils.fromWei(await token.balanceOf(cold), "ether");
            let result = await factory.rebalancing(token.address, {from:manager});
            let factoryBalance2 = web3.utils.fromWei(await token.balanceOf(factory.address), "ether");
            let coldBalance2 = web3.utils.fromWei(await token.balanceOf(cold), "ether");
            console.log(factoryBalance1, coldBalance1, '=>', factoryBalance2, coldBalance2);
        });

        it("rebalancing many", async () => {
            await web3.eth.sendTransaction({ from: user3, to: factory.address, value: web3.utils.toWei("99", "ether")});
            await token.transfer(factory.address, web3.utils.toWei("10", "ether"), { from: master });
            let factoryBalance1 = await web3.utils.fromWei(await web3.eth.getBalance(factory.address), "ether");
            let coldBalance1 = await web3.utils.fromWei(await web3.eth.getBalance(cold), "ether");
            let factoryTokenBalance1 = web3.utils.fromWei(await token.balanceOf(factory.address), "ether");
            let coldTokenBalance1 = web3.utils.fromWei(await token.balanceOf(cold), "ether");
            let result = await factory.rebalancingMany([zeroAddress, token.address], {from:manager});
            let factoryBalance2 = await web3.utils.fromWei(await web3.eth.getBalance(factory.address), "ether");
            let coldBalance2 = await web3.utils.fromWei(await web3.eth.getBalance(cold), "ether");
            let factoryTokenBalance2 = web3.utils.fromWei(await token.balanceOf(factory.address), "ether");
            let coldTokenBalance2 = web3.utils.fromWei(await token.balanceOf(cold), "ether");
            console.log(factoryBalance1, coldBalance1, '=>', factoryBalance2, coldBalance2);
            console.log(factoryTokenBalance1, coldTokenBalance1, '=>', factoryTokenBalance2, coldTokenBalance2);
            // 원복
            await web3.eth.sendTransaction({ from: cold, to: user3, value: web3.utils.toWei("39", "ether")});
            await factory.sendTokens([zeroAddress], [user3], [web3.utils.toWei("59", "ether")], {from:manager});
        });
    });

    describe("withdraw & gathering", () => {
        it("withdraw many", async () => {
            await web3.eth.sendTransaction({ from: master, to: factory.address, value: web3.utils.toWei("21", "ether")});
            await token.transfer(factory.address, web3.utils.toWei("21", "ether"), { from: master });

            let fTokenBalance = await token.balanceOf(factory.address);
            var fBalance = await web3.eth.getBalance(factory.address);
            let tokenBalance = await token.balanceOf(cold);
            var balance = await web3.eth.getBalance(cold);
            let result = await factory.sendTokens(
                [
                    token.address, token.address, token.address,
                    token.address, token.address, token.address,
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
                    token.address, token.address, token.address,
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
        });

        it("gathering many", async () => {
            let res = await factory.createWallet({ from: manager });
            let userWallet1 = res.logs[0].args.walletAddress;
            res = await factory.createWallet({ from: manager });
            let userWallet2 = res.logs[0].args.walletAddress;
            res = await factory.createWallet({ from: manager });
            let userWallet3 = res.logs[0].args.walletAddress;
            res = await factory.createWallet({ from: manager });
            let userWallet4 = res.logs[0].args.walletAddress;

            await token.transfer(userWallet1, web3.utils.toWei("1", "ether"), { from: master });
            await token.transfer(userWallet2, web3.utils.toWei("2", "ether"), { from: master });
            await token.transfer(userWallet3, web3.utils.toWei("3", "ether"), { from: master });
            await token.transfer(userWallet4, web3.utils.toWei("4", "ether"), { from: master });

            let result = await factory.gathering(
                [
                    token.address,
                    token.address,
                    token.address,
                    token.address
                ], [
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
            console.log(balance1, balance2, balance3, balance4);
            await token.transfer(master, web3.utils.toWei("10", "ether"), {from:cold});
        });
    });
});