import and from 'bitwise-buffer/src/and.js'
import lshift from 'bitwise-buffer/src/leftShift.js'
// import { exposeWorker } from 'react-hooks-worker';
import {Buffer} from "buffer";
import {BigNumber, utils as EtherUtils} from "ethers";

function randomBuffer(){
    var x = new Uint8Array(32);
    for(var i = 0; i < 32; i++){
        x[i] = Math.floor(Math.random() * 256);
    }
    return Buffer.from(x);
}

function isZero(b) {
    let i = b.length
    let result = 0;

    while (i--) {
        result |= b[i];
    }
    return !result
}

const mine = ([address, salt, blockHash, target, genomeBits]) => {
    const dnaMask = Buffer.from(new Uint8Array(32))
    lshift.mutate(dnaMask, genomeBits, 1)

    let nonce, hash;
    var count = 0;
    var startTime = Date.now();
    while (true){
        ++count;
        // if (!((count) % 1000)) console.log(count)
        nonce = randomBuffer();

        const hashHex = EtherUtils.solidityKeccak256(
            ['address', 'bytes32', 'bytes32', "bytes32"],
            [address, salt, blockHash, nonce]
        )
        hash = Buffer.from(hashHex.slice(2), 'hex')
        if (BigNumber.from(hash).lte(target)) {
            break
        }
    }
    var rawTime = (Date.now() - startTime) / 1000
    var time = Math.floor(rawTime);
    var khs = Math.round(count / rawTime / 1000);
    var dna = Buffer.from(and.pure(nonce, dnaMask).slice(-Math.ceil(genomeBits / 8)))
    return {
        nonce: nonce.toString('hex'),
        dna: dna.toString('hex'),
        time,
        hash: hash.toString('hex'),
        hashes: count,
        khs
    }
}

// exposeWorker(mine)

const testAddress = '0x534Eb19E729E955308e5A9c37c90d4128e0F450F'
const testSalt =  '0x244f574c00000000000000000000000000000000000000000000000000000000'
const blockHash = '0x0803ea346224e704c43e35cb9506bd0dd8ceecbe0e932ae9ef6de78a4a717b03'
// const target = '0x0000003fffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const target = '0x00000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const genomeBits = 64

let result = mine([testAddress, testSalt, blockHash, target, genomeBits])

console.log(result)

// seed: e6b2d7a64491e7544051cb9906851bdc2258944d8651c7fbd2b90a2eae8c6600
// hash: 000092402e1010955f5fbdde21834684afa23a0dcaf065b704e12a581d09d748
// dna: 1d09d748
// address: 534Eb19E729E955308e5A9c37c90d4128e0F450F
// difficulty bits: 16
// dna bits: 32
// salt: $OWL