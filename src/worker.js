/* eslint-disable no-restricted-globals */
const {Buffer} = require("buffer")
const ethers = require("ethers")

let resultCount = 0
let progress = {}
let result = []

const beNice = () => {
    return new Promise(resolve => setTimeout(resolve, 0));
}

const _postMessage = msg => self.postMessage({...msg, dest: 'proof-of-work-client' })

onmessage = async ev => {
    console.log('yo', ev.data)
    if (!/^proof-of-work-worker/gi.test(ev.data.dest)) return

    console.log('message received by worker:', ev.data)

    await run(ev.data)
}

addEventListener('exit', ev => console.log('bye'))

const run = async function({address, lastHash, recentBlockHash, maxTargetHash}) {
    let nonce, hash
    var count = 0
    let startTime = Date.now()

    console.log('starting loop')
    while (true) {
        console.log('in loop')
        nonce = randomBuffer();
        const hashHex = ethers.utils.solidityKeccak256(
            ['address', 'bytes32', 'bytes32', 'bytes32'],
            [address, lastHash, recentBlockHash, nonce]
        )
        hash = Buffer.from(hashHex.slice(2), 'hex')

        // update and report progress
        ++count
        const rawTime = (Date.now() - startTime)
        const duration = Math.floor(rawTime / 1000);
        const khps = Math.round(count / duration / 1000)

        if (ethers.BigNumber.from(hash).lte(maxTargetHash)) {
            console.log('sending result...')
            _postMessage({
                result: {
                    count: ++resultCount,
                    nonce: nonce.toString('hex'),
                },
                progress: {
                    time: duration,
                    hash: hash.toString('hex'),
                    hashes: count,
                    khps
                },
            })
            await beNice()
        } else if (!(rawTime % 1000)) {
            console.log('sending progress...')
            _postMessage({
                progress: {
                    time: duration,
                    hash: hash.toString('hex'),
                    hashes: count,
                    khps
                },
            })
            await beNice()
        }
    }
}

function randomBuffer() {
    var x = new Uint8Array(32);
    for (var i = 0; i < 32; i++) {
        x[i] = Math.floor(Math.random() * 256);
    }
    return Buffer.from(x)
}
