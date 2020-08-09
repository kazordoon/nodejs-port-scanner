const assert = require('assert');
const net = require('net');
const PortScanner = require('../lib/PortScanner');

describe('PortScanner', () => {
  const defaultPort = 5050;
  const defaultHost = '127.0.0.1';

  it('should be defined', () => {
    assert.ok(PortScanner);
  });

  it('should get and set the socket timeout', () => {
    const portScanner = new PortScanner();

    const expected = 1000;
    portScanner.timeout = expected;

    const actual = portScanner.timeout;

    assert.deepStrictEqual(expected, actual);
  });

  it(`should the ${defaultPort} port be open`, async () => {
    const portScanner = new PortScanner();
    const server = net.createServer().listen(defaultPort);

    const expected = 'open';
    const actual = await portScanner.getPortStatus(defaultPort, defaultHost);

    server.close();

    assert.deepStrictEqual(expected, actual);
  });

  it(`should the ${defaultPort} port be closed`, async () => {
    const portScanner = new PortScanner();

    const expected = 'closed';
    const actual = await portScanner.getPortStatus(defaultPort, defaultHost);

    assert.deepStrictEqual(expected, actual);
  });

  context('should return an error', () => {
    it('when trying to check an invalid port', async () => {
      const invalidPort = 'invalid-port';
      const expected = `connect ENOENT ${invalidPort}`;

      try {
        const portScanner = new PortScanner();

        await portScanner.getPortStatus(invalidPort, defaultHost);

        const actual = portScanner.error.message;

        assert.deepStrictEqual(expected, actual);
      } catch (err) {
        const actual = err.message;
        assert.deepStrictEqual(expected, actual);
      }
    });

    it('when the timeout exceeds', async () => {
      const timeout = 1;
      const expected = `Timeout of ${timeout}ms exceeded.`;

      try {
        const portScanner = new PortScanner();
        portScanner.timeout = timeout;

        await portScanner.getPortStatus(defaultPort, defaultHost);
      } catch (err) {
        const actual = err.message;
        assert.deepStrictEqual(expected, actual);
      }
    });

    it('when a negative number is provided as a timeout', async () => {
      const timeout = -1;
      const expected = `The value of "msecs" is out of range. It must be a non-negative finite number. Received ${timeout}`;

      try {
        const portScanner = new PortScanner();
        portScanner.timeout = timeout;

        await portScanner.getPortStatus(defaultPort, defaultHost);
      } catch (err) {
        const actual = err.message;
        assert.deepStrictEqual(expected, actual);
      }
    });
  });
});
