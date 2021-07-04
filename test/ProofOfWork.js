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

    it("should allow salt to be set", async () => {
        expect(await PowContract.getSalt(user1.address)).to.equal('0x'.padEnd(66, '0'))

        const testSalt = new TextEncoder().encode('TestingSalt'.padEnd(32, '\0'))
        const testSaltHex = arrayToHex(testSalt)
        await PowContract.setSalt(testSalt)

        expect(await PowContract.getSalt(user1.address)).to.equal(testSaltHex)
        // TODO Verify event output
    })

    it("should allow difficulty to be set", async () => {
        expect(await PowContract.getTarget(user1.address)).to.equal(MAX_UINT256)
        await PowContract.setDifficulty(1)
        const maxWorkHash = BASE_DIFFICULTY
        const result = await PowContract.getTarget(user1.address)
        expect(result).to.equal(maxWorkHash)
        // TODO Verify event output
    })

    it("should allow size of genome to be set", async () => {
        expect(await PowContract.getGenomeBitSize(user1.address)).to.equal(0)
        await PowContract.setGenomeBitSize(5)
        expect(await PowContract.getGenomeBitSize(user1.address)).to.equal(5)
        // TODO Verify event output
    })

    it("should store a different parameters for each user", async () => {
        // Set parameters for user1
        const user1Salt = new TextEncoder().encode('My Salt'.padEnd(32, '\0'))
        const user1SaltHex = arrayToHex(user1Salt)
        await PowContract.setSalt(user1Salt)
        await PowContract.setDifficulty(10)
        await PowContract.setGenomeBitSize(50)

        // Set parameters for user2
        const user2Salt = new TextEncoder().encode('Your Salt'.padEnd(32, '\0'))
        const user2SaltHex = arrayToHex(user2Salt)
        await PowContract.connect(user2).setSalt(user2Salt)
        await PowContract.connect(user2).setDifficulty(20)
        await PowContract.connect(user2).setGenomeBitSize(100)

        // Check parameters for user1
        expect(await PowContract.getSalt(user1.address)).to.equal(user1SaltHex)
        expect(await PowContract.getTarget(user1.address)).to.equal(BASE_DIFFICULTY.div(10))
        expect(await PowContract.getGenomeBitSize(user1.address)).to.equal(50)

        // Check parameters for user2
        expect(await PowContract.getSalt(user2.address)).to.equal(user2SaltHex)
        expect(await PowContract.getTarget(user2.address)).to.equal(BASE_DIFFICULTY.div(20))
        expect(await PowContract.getGenomeBitSize(user2.address)).to.equal(100)
    })

    it("should verify work and return zero when parameters not set", async () => {
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1

        const result = await PowContract.checkWork(worker, blockNumber, new Uint8Array(32))
        expect(result).to.equal(MIN_UINT256)
    })

    it("should verify work and return non-zero when genome bits is set", async () => {
        await PowContract.setGenomeBitSize(64)
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1

        const result = await PowContract.checkWork(worker, blockNumber, new Uint8Array(32))

        // TODO confirm that correct bits are returned
        expect(result).not.to.equal(0)
    })

    it("should revert when a difficulty is specified no work is done", async () => {
        await PowContract.setDifficulty(1024)
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1
        expect(PowContract.checkWork(worker, blockNumber, new Uint8Array(32)))
            .to.be.revertedWith('not enough work')
    })

    it("should revert when the specified block is too old", async () => {
        const worker = user2.address
        const blockNumber = await ethers.provider.getBlockNumber() - 1

        // skip 255 blocks
        await waitNBlocks(255)
        // success
        await PowContract.checkWork(worker, blockNumber, new Uint8Array(32))

        // skip 1 more block
        await waitNBlocks(1)
        // Work too old
        expect(PowContract.checkWork(worker, blockNumber, new Uint8Array(32)))
            .to.be.revertedWith('Work expired')
    })

    xit("should revert when work is submitted from a different worker", async () => {
        // TODO How can this be tested without actual work???
    })
})

