import { parentPort, MessageChannel } from "worker_threads";

(() => {
  console.log(`[Worker B] Running`);

  const channel: MessageChannel = new MessageChannel();
  parentPort.postMessage({
      port: channel.port2 },
    [channel.port2]
  );

  channel.port1.once('message', message => {
    console.log(`[Worker B] Receive message though direct thread communication: ${message.message}`);
  });

  let distantPort: MessagePort;
  parentPort.once('message', message => {
    if (message.port) {
      distantPort = message.port;

      distantPort.postMessage({ message: `Hello I'm Worker B` });
    }
  });
})();
