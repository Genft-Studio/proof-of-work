require("@nomiclabs/hardhat-waffle")
require("solidity-coverage")
require('hardhat-contract-sizer')
require("hardhat-gas-reporter")
require('hardhat-log-remover')
require('hardhat-docgen')
require("hardhat-tracer")

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  }
}