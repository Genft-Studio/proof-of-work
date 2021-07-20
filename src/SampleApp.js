import './SampleApp.css'
import useProofOfWorkWorker from "./UseProofOfWorkWorker"
import React, {useState} from "react"
import * as ethers from "ethers"
import {BigNumber} from "ethers"

const wl = ethers.wordlists.en

const testAddress =       '0x28e22396C45Ac478C70F3fdD438c56af2F8B50f9'
const testLastHash =      '0x0000000000000000000000000000000000000000000000000000000000000000'
const testBlockHash =     '0xc499146fd941b6a40f711004cea16fcbc1e0f62f938a4725344d45bf57a1afc0'
const testMaxTargetHash = '0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'


function SampleApp() {
    const [address, setAddress] = useState(testAddress)
    const [lastHash, setLastHash] = useState(testLastHash)
    const [blockHash, setBlockHash] = useState(testBlockHash)
    const [maxTargetHash, setMaxTargetAddress] = useState(testMaxTargetHash)

    const [workerPaused, setWorkerPaused] = useState(false)
    const [progress, setProgress] = useState({})
    const [results] = useState([])

    const onPause = ev => setWorkerPaused(true)
    const onResume = ev => setWorkerPaused(false)

    const resultHandler = r => {
        console.log(results.length, r, [...results, {...r}])
        results.push(r)
    }

    useProofOfWorkWorker({
        address, lastHash, recentBlockHash: blockHash, maxTargetHash,
        pause: workerPaused, onResult: resultHandler,
        onProgress: setProgress,
        onError: undefined,
        onPaused: undefined
    })

    const calcGuessesPerSecond = (guesses, time) => Math.round(guesses / time)

    const calcWordIndex = h => BigNumber.from('0x' + h).and('0x7ff')
    const calcHue = h => BigNumber.from('0x' + h).and('0xf000').shr(12)

    return (
        <div className="App">
            <header className="App-header">
                <button onClick={onPause} disabled={workerPaused}>Pause</button>
                <button onClick={onResume} disabled={!workerPaused}>Resume</button>
                <div>
                    <h3>Progress Report</h3>
                    <div>Elapsed time: {progress.time}</div>
                    <div>Guesses: {progress.hashes}</div>
                    <div>Guesses per second: {calcGuessesPerSecond(progress.hashes, progress.time)}</div>
                </div>
                <div>
                    <h3>Results!</h3>
                    <div className='image-list'>
                    {results.map((r, i) => (
                        <div key={i}>
                            <div className='word-hash'>{r.hash}</div>
                            <Renderer wordIndex={calcWordIndex(r.hash)} hueIndex={calcHue(r.hash)}/>
                        </div>
                    ))}
                    </div>
                </div>

            </header>
            <div>
                <input name='address' value={address} onChange={e => setAddress(e.target.value)}/>
            </div>
        </div>
    );
}

export default SampleApp;

const Renderer = ({wordIndex, hueIndex}) => {
    const word = wl.getWord(wordIndex)
    return (
        <div className='word-image' style={{backgroundColor: `hsl(${hueIndex * 22.5}, 100%, 50%)`}}>{word}</div>
    )
}