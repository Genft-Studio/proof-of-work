import 'jsdom-worker'

describe('Proof of work web worker', () => {
    let worker
    beforeEach(async () => {
        worker = new Worker("./worker.js", { type: 'module' })
        console.log(worker)
        worker.terminate = jest.fn()
    })

    it('responds', async () => {
        console.log('here')
        const msgHandler = jest.fn()

        worker.addEventListener('message', msgHandler)
        await worker.postMessage({text: 'say hello', source: 'proof-of-work-client'})
        expect(msgHandler).toBeCalled()
        expect(msgHandler).toBeCalledWith('hai')
    })

    // ev => {
    //     if (!/^proof-of-work/gi.test(ev.data.source)) return
    //     console.log('message from worker:', ev.data)
    // }

    afterEach(() => worker.terminate())
})