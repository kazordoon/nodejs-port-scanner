const { Socket } = require('net');
const { EventEmitter } = require('events');

class PortScanner {
  #socket;
  #eventEmitter;
  #status = 'closed';
  _error = null;
  _timeout = 400;

  constructor() {
    this.#socket = new Socket();

    this.#eventEmitter = new EventEmitter();

    this.loadSocketEvents();
  }

  get timeout() {
    return this._timeout;
  }

  /**
   * @param {number} timeout
   */
  set timeout(timeout) {
    this._timeout = timeout;
    this.#socket.setTimeout(timeout);
  }

  get error() {
    return this._error;
  }

  /**
   * @param {Error} error
   */
  set error(error) {
    this._error = error;
  }

  loadSocketEvents() {
    this.#socket.on('connect', () => {
      this.#status = 'open';
      this.#socket.destroy();
    });

    this.#socket.on('timeout', () => {
      this.error = new Error(`Timeout of ${this._timeout}ms exceeded.`);
      this.#socket.destroy();
    });

    this.#socket.on('error', (exception) => {
      if (exception.code !== 'ECONNREFUSED') {
        this.error = exception;
      }
    });

    this.#socket.on('close', (exception) => {
      this.#eventEmitter.emit('finished');
    });
  }

  /**
   * @param {number} port
   * @param {string} host
   */
  getPortStatus(port, host) {
    return new Promise((resolve, reject) => {
      this.#socket.connect(port, host);
      this.#eventEmitter.on('finished', () => {
        if (this.error) {
          return reject(this.error);
        }

        resolve(this.#status);
      });
    });
  }
}

module.exports = PortScanner;
