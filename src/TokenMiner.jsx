/* eslint-disable no-restricted-globals */
import React, {useEffect, useRef, useState} from "react"
import {COMMAND_PAUSE, COMMAND_RUN, COMMAND_STOP, COMMAND_UPDATE_PARAMETERS} from "./worker";


// console.log(HashMiner)
const TokenMiner = ({address, lastHash, recentBlockHash, maxTargetHash, onSuccess, onError}) => {
    const workerRef = useRef(undefined)
    const [workerState, setWorkerState] = useState({})
    const {result, progress, error, status} = workerState

    const _postMessage = msg => {
        console.assert(workerRef.current, 'worker not set')
        console.log('+++++++++', workerRef.current.postMessage.toString())
        workerRef.current.postMessage({...msg, dest: 'proof-of-work-worker'})
    }
    const _eventFilter = fn => ({data}) => {
        if (!data || !data.dest || !/^proof-of-work-client/gi.test(data.dest)) return
        console.log('To client:', data)
        fn(data)
    }
    const _messageHandler = _eventFilter(data => setWorkerState({...workerState, ...data}))

    const startWorker = async ev => {
        workerRef.current = new Worker("worker-loader!./worker.js", {type: 'module'})
        console.log('worker->>',workerRef.current)

        workerRef.current.addEventListener('message', _messageHandler)
        workerRef.current.addEventListener('error', _messageHandler)
        workerRef.current.addEventListener('messageerror', _messageHandler)



        // addEventListener('message', _messageHandler)
        // addEventListener('error', _messageHandler)
        // addEventListener('messageerror', _messageHandler)

        _postMessage({address, lastHash, recentBlockHash, maxTargetHash})
    }

    useEffect(() => {
        // if (workerRef && workerRef.current) {
        //     console.log('posinting')
        //
        //     _postMessage({address, lastHash, recentBlockHash, maxTargetHash})
        // }
        return stopWorker
    }, [workerRef.current])

    const stopWorker = async ev => {
        if (workerRef.current) {
            console.log('stopping', workerRef.current)

            workerRef.current.removeEventListener('message', _messageHandler)
            workerRef.current.removeEventListener('error', _messageHandler)
            workerRef.current.removeEventListener('messageerror', _messageHandler)

            const exitCode = await workerRef.current.terminate()
            console.log('worker stopped:', exitCode)

            setWorkerState({})
            workerRef.current = undefined
        }
    }

    useEffect(() => {
        // console.log('>>>', workerState)
        // _postMessage({address, lastHash, recentBlockHash, maxTargetHash})
    }, [address, lastHash, recentBlockHash, maxTargetHash]);

    return (
        <>
            <button onClick={startWorker}>Start</button>
            <button onClick={stopWorker}>Stop</button>
            {error &&
            <div className='error'>
                Mining accident occured: {error.toString()}
            </div>
            }
            {result &&
            <div>Result: {JSON.stringify(result, undefined, 2)}</div>
            }
            {progress &&
            <>
                <div>Elapsed time: {progress.time} seconds</div>
                <div>Hashes completed: {progress.hashes}</div>
                <div>Average khps: {progress.khps}</div>
            </>
            }
            {status &&
            <div>Status: {status}</div>
            }
        </>
    )
}

export default TokenMiner