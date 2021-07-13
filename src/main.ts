import { Worker } from 'worker_threads';

(() => {
  console.log(`[Main] Run in ${process.env.NODE_ENV} env`);

  // Instanciate worker A
  const myWorkerA: Worker = new Worker(
    process.env.NODE_ENV === 'production' ? './myWorkerA.js' : './src/proxyA.js',
  );

  myWorkerA.on('online', () => {
    console.log(`[Main] Worker A is online and executing code!`);
  });

  // Instanciate worker B
  const myWorkerB: Worker = new Worker(
    process.env.NODE_ENV === 'production' ? './myWorkerB.js' : './src/proxyB.js',
  );

  myWorkerB.on('online', () => {
    console.log(`[Main] Worker B is online and executing code!`);
  });

  myWorkerA.on('message', message => {
    if (message.port) {
      console.log(`[Main] Worker A send his port to Worker B`);
      myWorkerB.postMessage({port: message.port}, [message.port]);
    }
  });

  myWorkerB.on('message', message => {
    if (message.port) {
      console.log(`[Main] Worker B send his port to Worker A`);
      myWorkerA.postMessage({port: message.port}, [message.port]);
    }
  });

  console.log(`[Main] Ready to exchange worker's ports`);
})();

