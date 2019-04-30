var MessagesAndCodes = artifacts.require('./libraries/MessagesAndCodes')
var IndivisibleTokenMock = artifacts.require('./mocks/IndivisibleTokenMock')
var BasicWhitelistTokenMock = artifacts.require('./mocks/BasicWhitelistTokenMock')
var ManagedWhitelistTokenMock = artifacts.require('./mocks/ManagedWhitelistTokenMock')
var MaxOwnershipStakeTokenMock = artifacts.require('./mocks/MaxOwnershipStakeTokenMock')
var MaxNumShareholdersTokenMock = artifacts.require('./mocks/MaxNumShareholdersTokenMock')
var IndividualOwnershipStakeTokenMock = artifacts.require('./mocks/IndividualOwnershipStakeTokenMock')
var ST20ExampleMock = artifacts.require('./mocks/ST20ExampleMock')
var MyERC1404 = artifacts.require("./token/ERC1404/MyERC1404.sol");

module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {
    try {
      // deploy and link MessagesAndCodes lib for MessagedERC1404's
      await deployer.deploy(MessagesAndCodes)
      await deployer.link(MessagesAndCodes, [
        IndivisibleTokenMock,
        BasicWhitelistTokenMock,
        ManagedWhitelistTokenMock,
        MaxOwnershipStakeTokenMock,
        MaxNumShareholdersTokenMock,
        IndividualOwnershipStakeTokenMock,
        ST20ExampleMock
      ])
      const ownerAddress = accounts[0];
      await deployer.deploy(MyERC1404, "myERC1404Token", "MYT1404", ownerAddress, '50000000000000000000');
    } catch (err) {
      console.log(('Failed to Deploy Contracts', err))
    }
  })
}
