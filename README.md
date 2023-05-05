# NodeJS Multithreading 03

Direct Thread Message

### Environment :
```
NodeJS minimal version: v12.x.x LTS (Erbium)
NodeJS recommended version: Latest LTS version
Dev Language: TypeScript (ES6)
Run Language: JavaScript
```
See [Latest NodeJS LTS version](https://nodejs.org/)

### How to run

#### First

Install packages

```
npm run i
```

#### Then

To run in Development
```
npm run start:dev
```

To run in Production
```
npm run start
```

## Explanations

If you need to instanciate multiple workers and need to communicate between them you will have to pass through the main thread.

But if you want to communicate between child threads directly, there is a solution.

This chapter may be the hardest to understand.

In this example we instanciate 2 workers, myWorkerA and myWorkerB.

On main thread, we waiting on them to receive their MessagePort.

Once we get a MessagePort from a thread, we transmit it to the other worker and vice versa.

### Main Thread Side

```ts
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
```

What is a MessagePort ?

A message port is an object used to execute communication operation on a thread.

For example, parentPort, that you can see in previous chapter is a MessagePort.

A special MessagePort that reference only parent thread.

You have to instanciate a MessageChannel on worker side.

In a MessageChannel you will found 2 MessagePort, 1 MessagePort for emission and 1 MessagePort for reception.

You transmit port2 to parent thread which will transmit it to the other worker.

port1 remain on this worker and will be used to listen on the port2 which is now on the other worker.

distantPort that you can see here is the MessagePort that receive the port2 of the other worker.

### Worker Thread Side

```ts
import { parentPort, MessageChannel } from "worker_threads";

(() => {
  console.log(`[Worker A] Running`);

  const channel: MessageChannel = new MessageChannel();
  parentPort.postMessage({
      port: channel.port2 },
    [channel.port2]
  );

  channel.port1.once('message', message => {
    console.log(`[Worker A] Receive message though direct thread communication: ${message.message}`);
  });

  let distantPort: MessagePort;
  parentPort.once('message', message => {
    if (message.port) {
      distantPort = message.port;

      distantPort.postMessage({ message: `Hello I'm Worker A` });
    }
  });
})();
```

I don't show you Worker B as the code is identical.

## Next Chapter

Multithreading 04 - Worker Data
https://github.com/thomaspiquet/nodejs-multithreading-04