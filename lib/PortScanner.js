const { Socket } = require('net');

class PortScanner {
  #socket;
  #error = null;
  #status = 'closed';
  #finished = false;
  _timeout = 400;

  constructor() {
    this.#socket = new Socket();
    this.#socket.setTimeout(this._timeout);

    this.loadEvents();
  }

  get timeout() {
    return this._timeout;
  }

  /**
   * @param {number} timeout
   */
  set timeout(timeout) {
    this._timeout = timeout;
  }

  loadEvents() {
    let connectionRefused = false;

    this.#socket.on('connect', () => {
      this.#status = 'open';
      this.#socket.destroy();
    });

    this.#socket.on('timeout', () => {
      this.#error = new Error(`Timeout of ${this._timeout}ms exceeded.`);
      this.#socket.destroy();
    });

    this.#socket.on('error', (exception) => {
      if (exception.code !== 'ECONNREFUSED') {
        this.#error = exception;
      } else {
        connectionRefused = true;
      }
    });

    this.#socket.on('close', (exception) => {
      if (exception && !connectionRefused) {
        this.#error = this.#error || exception;
      }
      this.#finished = true;
    });
  }

  /**
   * @param {number} port
   * @param {string} host
   */
  getPortStatus(port, host) {
    return new Promise((resolve ,reject) => {
      if (this.#error) {
        return reject(this.#error);
      }

      this.#socket.connect(port, host);

      const resolveWhenFinished = setInterval(() => {
        if (this.#finished) {
          clearInterval(resolveWhenFinished);
          resolve(this.#status);
        }
      }, 0);
    });
  }
}

module.exports = PortScanner;