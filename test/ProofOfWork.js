const {BigNumber} = require("ethers");
const { expect } = require("chai")

const MIN_UINT256 =     BigNumber.from("0x0")
const MAX_UINT256 =     BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
const BASE_DIFFICULTY = BigNumber.from("0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
const MAX_UINT64 =      BigNumber.from('0xffffffffffffffff')

describe("Proof of work contract", function() {
    let user1, user2, userDummy, PowContract

    const waitNBlocks = async n => Promise.all(
        // execute a random function that mines a block (is there a better way?)
        [...Array(n).keys()].map(async i => await PowContract.connect(userDummy).setDifficulty(0))
    )

    const arrayToHex = a => '0x' + [...a].map(x => x.toString(16).padStart(2, '0')).join('')

    beforeEach(async () => {
        [user1, user2, userDummy] = await ethers.getSigners();
        PowContract = await (await ethers.getContractFactory("ProofOfWork")).deploy();
        await PowContract.deployed()
    })

    it("should allow difficulty to be set", async () => {
        expect(await PowContract.getMaximumTarget(user1.address)).to.equal(MAX_UINT256)
        await PowContract.setDifficulty(1)
        expect(await PowContract.getMaximumTarget(user1.address)).to.equal(BASE_DIFFICULTY)
        // TODO Verify event output
    })

    it("should store a different parameters for each user", async () => {
        // Set parameters for user1
        await PowContract.setDifficulty(10)

        // Set parameters for user2
        await PowContract.connect(user2).setDifficulty(20)

        // Check parameters for user1
        expect(await PowContract.getMaximumTarget(user1.address)).to.equal(BASE_DIFFICULTY.div(10))

        // Check parameters for user2
        expect(await PowContract.getMaximumTarget(user2.address)).to.equal(BASE_DIFFICULTY.div(20))
    })

    it("should track the last reported work", async () => {
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1

        const lastHash = await PowContract.getLastHash(user1.address)
        await PowContract.reportWork(worker, blockNumber, new Uint8Array(32))
        expect(await PowContract.getLastHash(user1.address)).not.to.equal(lastHash)
    })

    it("should verify work", async () => {
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1
        const nonce = arrayToHex(new Uint8Array(32))

        await expect(PowContract.reportWork(worker, blockNumber, nonce))
            .to.emit(PowContract, 'WorkReported')
            // .withArgs(user1.address, worker, MIN_UINT256, blockHash, nonce, MIN_UINT256)
            // FIXME YUNOWORK?
    })

    xit("should verify work and return DNA", async () => {
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1
        const blockHash = (await ethers.provider.getBlock(blockNumber)).hash
        const nonce = arrayToHex(new Uint8Array(32))

        // TODO confirm that correct bits are returned
        await expect(PowContract.reportWork(worker, blockNumber, new Uint8Array(32)))
            .to.emit(PowContract, 'WorkReported')
        // .withArgs(user1.address, worker, MIN_UINT256, blockHash, nonce, MIN_UINT256)
        // FIXME YUNOWORK?
    })

    it("should revert when a difficulty is specified no work is done", async () => {
        await PowContract.setDifficulty(1024)
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1
        await expect(PowContract.reportWork(worker, blockNumber, new Uint8Array(32)))
            .to.be.revertedWith('Invalid work')
    })

    it("should revert when the specified block is too old", async () => {
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1

        // skip 255 blocks
        await waitNBlocks(254)
        // success
        await PowContract.reportWork(worker, blockNumber, new Uint8Array(32))

        // skip 1 more block
        await waitNBlocks(1)
        // Work too old
        await expect(PowContract.reportWork(worker, blockNumber, new Uint8Array(32)))
            .to.be.revertedWith('Work expired')
    })

    xit("should prevent multiple claims with the same nonce", async () => {
        // TODO Actual work is required for this test to work
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1

        // success
        const nonce = arrayToHex(new Uint8Array(32));
        await PowContract.reportWork(worker, blockNumber, nonce)
        await expect(PowContract.reportWork(worker, blockNumber, nonce))
            .to.be.revertedWith('Invalid work')
    })

    xit("should revert when work is submitted from a different worker", async () => {
        // TODO How can this be tested without actual work???
    })
})

