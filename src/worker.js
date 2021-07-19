/* eslint-disable no-restricted-globals */
const {Buffer} = require("buffer")
const ethers = require("ethers")

let resultCount = 0
let count = 0
let paused = false
let parameters = {}
let running = false
let elapsedTime = 0

const beNice = () => {
    return new Promise(resolve => setTimeout(resolve, 0));
}

const _postMessage = msg => self.postMessage({...msg, dest: 'proof-of-work-client'})

self.addEventListener('message', ev => {
    const {dest, pause, ..._rest} = ev.data
    if (!/^proof-of-work-worker/gi.test(dest)) return

    paused = typeof (pause) === "boolean" && pause
    parameters = {...parameters, ..._rest}

    if (!running && !paused) {
        run(parameters)
    }
})

self.addEventListener('exit', ev => console.log('bye'))

const run = async function ({address, lastHash, recentBlockHash, maxTargetHash}) {
    if (!address || !lastHash || !recentBlockHash || !maxTargetHash) return

    let nonce, hash
    let startTime = Date.now()

    running = true

    while (!paused) {
        nonce = randomBuffer();
        const hashHex = ethers.utils.solidityKeccak256(
            ['address', 'bytes32', 'bytes32', 'bytes32'],
            [address, lastHash, recentBlockHash, nonce]
        )
        hash = Buffer.from(hashHex.slice(2), 'hex')

        // update and report progress
        ++count
        const rawTime = Date.now() - startTime + elapsedTime

        if (ethers.BigNumber.from(hash).lte(maxTargetHash)) {
            _postMessage({
                result: {
                    count: ++resultCount,
                    nonce: nonce.toString('hex'),
                },
                progress: getProgress(rawTime),
            })
            await beNice()
        } else if (!(rawTime % 1000)) {
            _postMessage({
                progress: getProgress(rawTime),
            })
            await beNice()
        }
    }
    elapsedTime += Date.now() - startTime
    running = false
}

const getProgress = rawTime => {
    const duration = Math.floor(rawTime / 1000);
    const khps = Math.round(count / duration / 1000)
    return {
        time: duration,
        hashes: count,
        khps
    }
}

function randomBuffer() {
    var x = new Uint8Array(32);
    for (var i = 0; i < 32; i++) {
        x[i] = Math.floor(Math.random() * 256);
    }
    return Buffer.from(x)
}
