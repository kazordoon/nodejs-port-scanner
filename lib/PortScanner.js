const { Socket } = require('net');

class PortScanner {
  #socket;
  #error = null;
  #connectionRefused = false;
  #status = 'closed';
  #timeout = 400;
  #finished = false;

  constructor() {
    this.#socket = new Socket();
    this.#socket.setTimeout(this.#timeout);

    this.loadEvents();
  }

  loadEvents() {
    this.#socket.on('connect', () => {
      this.#status = 'open';
      this.#socket.destroy();
    });

    this.#socket.on('timeout', () => {
      this.#error = new Error(`Timeout of ${this.#timeout}ms exceeded.`);
      this.#socket.destroy();
    });

    this.#socket.on('error', (exception) => {
      if (exception.code !== 'ECONNREFUSED') {
        this.#error = exception;
      } else {
        this.#connectionRefused = true;
      }
    });

    this.#socket.on('close', (exception) => {
      if (exception && !this.#connectionRefused) {
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
        throw new Error(this.#error);
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
