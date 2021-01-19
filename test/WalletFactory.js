const Assert = require('truffle-assertions');

const JSHToken = artifacts.require("JSHToken");
const MasterWallet = artifacts.require("MasterWallet");
const Wallet = artifacts.require("Wallet");

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

contract("MasterWallet", async accounts => {
    let factory;
    let walletAddress;
    let wallet;
    let token;

    const master = accounts[0];
    const manager = accounts[1];
    const cold = accounts[2];
    const user = accounts[3];

    it("deploy test", async () => {
        wallet = await MasterWallet.deployed();
        proxy = await deployProxy(wallet, [master], {master});
        factory = await MasterWallet.at(proxy.address);
        console.log("factory address:", factory.address);
    })

    it("createWallet", async () => {
        let res = await factory.createWallet({ from: master });
        walletAddress = res.logs[0].args.walletAddress;
        console.log("wallet address", walletAddress);
    });

    it("wallet load", async () => {
        wallet = await Wallet.at(walletAddress);
    });

    it("setColdWallet", async () => {
        token = await JSHToken.deployed();
        console.log("token address", token.address);
        let result = await factory.setColdWallet(token.address, cold, { from: master });
        Assert.eventEmitted(result, 'ColdWalletChanged');
        let coldWallet = await factory.getColdWallet(token.address);
        assert.equal(coldWallet, cold, "have to same")

        result = await factory.setColdWallet('0x0000000000000000000000000000000000000000', cold, { from: master });
        Assert.eventEmitted(result, 'ColdWalletChanged');
        coldWallet = await factory.getColdWallet('0x0000000000000000000000000000000000000000');
        assert.equal(coldWallet, cold, "have to same")

        await Assert.reverts(factory.setColdWallet(token.address, user, { from: user }), "Ownable: caller is not the owner", "Ownable Failed");
    });

    it("ether transfer", async () => {
        wallet = await Wallet.at(walletAddress);
        let coldBalance = await web3.eth.getBalance(cold);
        let result = await factory.getColdWallet('0x0000000000000000000000000000000000000000');
        result = await web3.eth.sendTransaction({ from: user, to: wallet.address, value: web3.utils.toWei("1", "ether")});
        // Assert.eventEmitted(result, 'Transfer');
        let newColdBalance = await web3.eth.getBalance(cold);
        console.log(parseFloat(web3.utils.fromWei(newColdBalance)), parseFloat(web3.utils.fromWei(coldBalance))+parseFloat(web3.utils.fromWei(web3.utils.toWei("1", "ether"))), 'have to increase');
        assert.equal(parseFloat(web3.utils.fromWei(newColdBalance)), parseFloat(web3.utils.fromWei(coldBalance))+parseFloat(web3.utils.fromWei(web3.utils.toWei("1", "ether"))), 'have to increase');
    });

    it("erc20 transfer", async () => {
        wallet = await Wallet.at(walletAddress);
        token = await JSHToken.deployed();
        let result = await factory.setManager(manager, { from: master });
        Assert.eventEmitted(result, 'ManagerChanged');
        result = await factory.setColdWallet(token.address, cold, { from: master });
        Assert.eventEmitted(result, 'ColdWalletChanged');
        result = await factory.getColdWallet(token.address, { from: user });
        assert.equal(result, cold, 'token cold wallet setting failed')
        result = await token.transfer(wallet.address, web3.utils.toWei("1", "ether"), { from: master });
        Assert.eventEmitted(result, 'Transfer');
        assert.notEqual(token.balanceOf(wallet.address), 0);
        result = await wallet.transfer(token.address, { from: manager });
        //Assert.eventEmitted(result, 'Transfer');
        let balance = await token.balanceOf(wallet.address);
        assert.equal(balance, 0);
    });

    it("send many", async () => {
        token = await JSHToken.deployed();
        // let result = await factory.setManager(manager, { from: master });
        // Assert.eventEmitted(result, 'ManagerChanged');
        await web3.eth.sendTransaction({ from: master, to: factory.address, value: web3.utils.toWei("3.223", "ether")});
        await token.transfer(factory.address, web3.utils.toWei("3.123", "ether"), { from: master });

        let fTokenBalance = await token.balanceOf(factory.address);
        var fBalance = await web3.eth.getBalance(factory.address);
        let tokenBalance = await token.balanceOf(cold);
        var balance = await web3.eth.getBalance(cold);
        let result = await factory.sendTokens(
            [
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.123", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.223", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.423", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.413", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.433", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.463", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.443", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.123", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.223", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.323", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.423", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.523", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.623", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.323", "ether")}
            ],
            { from: manager }
        );
        let fTokenBalance2 = await token.balanceOf(factory.address);
        var fBalance2 = await web3.eth.getBalance(factory.address);
        let tokenBalance2 = await token.balanceOf(cold);
        var balance2 = await web3.eth.getBalance(cold);

        result = await Assert.reverts(factory.sendTokens(
            [
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.123", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.223", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.423", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.413", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.433", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("0.463", "ether")},
                {tokenAddress: token.address, target: user, amount: web3.utils.toWei("20.443", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.123", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.223", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.323", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.423", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.523", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.623", "ether")},
                {tokenAddress:'0x0000000000000000000000000000000000000000', target:user, amount: web3.utils.toWei("0.323", "ether")}
            ],
            { from: manager }
        ));
    });

    it("gathering many", async () => {
        token = await JSHToken.deployed();

        let res = await factory.createWallet({ from: master });
        let userWallet1 = res.logs[0].args.walletAddress;
        res = await factory.createWallet({ from: master });
        let userWallet2 = res.logs[0].args.walletAddress;
        res = await factory.createWallet({ from: master });
        let userWallet3 = res.logs[0].args.walletAddress;
        res = await factory.createWallet({ from: master });
        let userWallet4 = res.logs[0].args.walletAddress;

        console.log(userWallet1, userWallet2, userWallet3, userWallet4);

        await token.transfer(userWallet1, web3.utils.toWei("1.123", "ether"), { from: master });
        await token.transfer(userWallet2, web3.utils.toWei("2.123", "ether"), { from: master });
        await token.transfer(userWallet3, web3.utils.toWei("3.123", "ether"), { from: master });
        await token.transfer(userWallet4, web3.utils.toWei("4.123", "ether"), { from: master });

        let result = await factory.gathering(
            [
                {tokenAddress: token.address, target: userWallet1},
                {tokenAddress: token.address, target: userWallet2},
                {tokenAddress: token.address, target: userWallet3},
                {tokenAddress: token.address, target: userWallet4}
            ],
            { from: manager }
        );
        console.log(result);

        // 잔액0 체크, gather to cold check
    });
});