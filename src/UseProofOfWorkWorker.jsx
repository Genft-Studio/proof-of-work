/* eslint-disable no-restricted-globals */
import React, {useEffect, useRef, useState} from "react"

const useProofOfWorkWorker = ({
                                  address,
                                  lastHash,
                                  recentBlockHash,
                                  maxTargetHash,
                                  pause,
                                  onResult,
                                  onProgress,
                                  onError,
                                  onPaused
                              }) => {
    const workerRef = useRef()
    const [workerPaused, setWorkerPaused] = useState(false)
    const [workerState, setWorkerState] = useState({})

    const _postMessage = msg => {
        console.assert(workerRef.current, 'worker not started')
        workerRef.current.postMessage({...msg, dest: 'proof-of-work-worker'})
    }
    const _eventFilter = fn => ({data}) => {
        if (!data || !data.dest || !/^proof-of-work-client/gi.test(data.dest)) return
        fn(data)
    }
    const _messageHandler = _eventFilter(data => {
        const {result, progress, error, status} = data
        if (progress) {
            onProgress && onProgress(progress)
        }
        if (result) {
            onResult && onResult(result)
        }
        setWorkerState({...workerState, ...data}) // Remove me
    })

    useEffect(() => {
        workerRef.current = new Worker("./worker.js", {type: 'module'})
        workerRef.current.addEventListener('message', _messageHandler)
        workerRef.current.addEventListener('error', onError)
        workerRef.current.addEventListener('messageerror', onError)
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
        const visibilityChangeListener = ev => pauseWorker(document.hidden)
        window.addEventListener('visibilitychange', visibilityChangeListener)
        return () => window.removeEventListener('visibilitychange', visibilityChangeListener)
    }, [])

    useEffect(() => workerPaused && onPaused && onPaused(), [workerPaused])

    const pauseWorker = value => {
        if (workerRef.current) {
            _postMessage({pause: value})
            setWorkerPaused(value)
        }
    }


    useEffect(() => pauseWorker(pause), [pause])

    useEffect(() => {
        if (workerRef.current)
            _postMessage({address, lastHash, recentBlockHash, maxTargetHash})
    }, [address, lastHash, recentBlockHash, maxTargetHash]);
}

export default useProofOfWorkWorker