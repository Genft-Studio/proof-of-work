/* eslint-disable no-restricted-globals */
import React, {useEffect, useRef, useState} from "react"

const TokenMiner = ({address, lastHash, recentBlockHash, maxTargetHash, onSuccess, onError}) => {
    const workerRef = useRef()
    const [workerPaused, setWorkerPaused] = useState(false)
    const [workerState, setWorkerState] = useState({})
    const {result, progress, error, status} = workerState

    const _postMessage = msg => {
        console.assert(workerRef.current, 'worker not started')
        workerRef.current.postMessage({...msg, dest: 'proof-of-work-worker'})
    }
    const _eventFilter = fn => ({data}) => {
        if (!data || !data.dest || !/^proof-of-work-client/gi.test(data.dest)) return
        fn(data)
    }
    const _messageHandler = _eventFilter(data => setWorkerState({...workerState, ...data}))

    useEffect(() => {
        workerRef.current = new Worker("./worker.js", {type: 'module'})
        workerRef.current.addEventListener('message', _messageHandler)
        workerRef.current.addEventListener('error', _messageHandler)
        workerRef.current.addEventListener('messageerror', _messageHandler)
        _postMessage({address, lastHash, recentBlockHash, maxTargetHash})

        return ev => {
            if (workerRef.current) {
                workerRef.current.removeEventListener('message', _messageHandler)
                workerRef.current.removeEventListener('error', _messageHandler)
                workerRef.current.removeEventListener('messageerror', _messageHandler)

                workerRef.current.terminate()

                setWorkerState({})
                workerRef.current = undefined
            }
        };
    }, [])

    useEffect(() => {
        const visibilityChangeListener = ev => setPause(document.hidden)
        window.addEventListener('visibilitychange', visibilityChangeListener)
        return () => window.removeEventListener('visibilitychange', visibilityChangeListener)
    }, [])

    const setPause = value => {
        if (workerRef.current) {
            _postMessage({pause: value})
            setWorkerPaused(value)
        }
    }

    const onPause = ev => setPause(true)
    const onResume = ev => setPause(false)

    useEffect(() => {
        if (workerRef.current)
            _postMessage({address, lastHash, recentBlockHash, maxTargetHash})
    }, [address, lastHash, recentBlockHash, maxTargetHash]);

    return (
        <>
            <button onClick={onPause} disabled={workerPaused}>Pause</button>
            <button onClick={onResume} disabled={!workerPaused}>Resume</button>
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