const Migrations = artifacts.require("Migrations");

module.exports = function (deployer, a, accounts) {
  deployer.deploy(Migrations, accounts[1]);
};
