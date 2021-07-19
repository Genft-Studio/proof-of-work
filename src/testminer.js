console.log(Worker)

const worker = new Worker("./worker.js", { type: 'module' })
worker.onmessage = ev => console.log('message from worker:', ev)

// worker.postMessage('do it!')
