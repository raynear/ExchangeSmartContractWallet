const Assert = require('truffle-assertions');

const MasterWallet = artifacts.require("MasterWallet");


contract("MasterWallet", async accounts => {
    let factory, proxy, wallet;

    const master = accounts[0];
    const manager = accounts[1];
    const user = accounts[3];

    it("deploy test", async () => {
        factory = await MasterWallet.deployed();
    })

    it("setManager", async () => {
        let setManagerResult = await factory.setManager(manager, { from: master });
        Assert.eventNotEmitted(setManagerResult, 'Ownable.ManagerChanged', (ev) => {
            console.log(ev.param1, ev.param2.managerAddress);
            return ev.param1 === ev.param2.managerAddress;
        });

        await Assert.reverts(factory.setManager(user, { from: user }), "Ownable: caller is not the owner", "Ownable Failed");
    });

    it("delManager", async () => {
        let delManagerResult = await factory.delManager(manager, { from: master });
        Assert.eventNotEmitted(delManagerResult, 'Ownable.ManagerChanged', (ev) => { return false; });

        await Assert.reverts(factory.delManager(user, { from: user }), "Ownable: caller is not the owner", "Ownable Failed");
    });
});