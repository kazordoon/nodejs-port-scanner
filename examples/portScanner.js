const PortScanner = require('../lib/PortScanner');

const host = '127.0.0.1';
const ports = [22, 80, 443, 27017, 3306, 5432, 3000];

console.log({ host });

let promises = [];
ports.forEach(async (port) => {
  const portScanner = new PortScanner();
  const promise = await portScanner.getPortStatus(port, host);
  promises.push({ port, status: promise });
});

const showResolvedPromisesWhenReady = setInterval(() => {
  if (promises.length > 0) {
    Promise.all(promises).then(console.log);
    clearInterval(showResolvedPromisesWhenReady);
  }
}, 0);
