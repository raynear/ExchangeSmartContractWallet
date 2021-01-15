const Assert = require('truffle-assertions');

const JSHToken = artifacts.require("JSHToken");

contract("JSHToken", async accounts => {
    const master = accounts[0];

    let token;

    it("deploy", async () => {
        token = await JSHToken.deployed();
    })

    it("balance", async () => {
        const masterBalance = await token.balanceOf(master);
        assert.notEqual(masterBalance, 0, 'no balance')
    });
});