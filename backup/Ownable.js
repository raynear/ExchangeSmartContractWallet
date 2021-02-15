const Assert = require('truffle-assertions');

const MasterWallet = artifacts.require("MasterWallet");


contract("MasterWallet", async accounts => {
    let factory;

    const master = accounts[0];
    const manager = accounts[1];
    const user = accounts[3];

    beforeEach("deploy", async () => {
        factory = await MasterWallet.new({from:master});
        await factory.initialize(master);
    })

    describe("setManager", () => {
        it("setManager from master", async () => {
            let setManagerResult = await factory.setManager(manager, { from: master });
            Assert.eventNotEmitted(setManagerResult, 'Ownable.ManagerChanged');
        });
        it("setManager from wrong user", async () => {
            await Assert.reverts(factory.setManager(user, { from: user }), "Ownable: caller is not the owner", "Ownable Failed");
        });
        it("delManager from master", async () => {
            let delManagerResult = await factory.delManager(manager, { from: master });
            Assert.eventNotEmitted(delManagerResult, 'Ownable.ManagerChanged', (ev) => { return false; });
        });
        it("delManager from check", async () => {
            let delManagerResult = await factory.isManager(manager, { from: master });
            assert.equal(delManagerResult, false, "manager not deleted");
        });
        it("delManager from user", async () => {
            await Assert.reverts(factory.delManager(user, { from: user }), "Ownable: caller is not the owner", "Ownable Failed");
        });
    });
});