import io from 'socket.io-client';
import { logger, tasks } from '../../config';

class SocketIOInterface {
  socket = null;
  constructor(option) {
    if (!option.worker || !option.action) {
      throw new Error('Error to setup WebSocketInterface.');
    }
    this.socket = io.connect(option.action.getURI(), {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
    this.worker = option.worker;
    this.action = option.action;
  }

  initialize = async () => {
    this.socket.on('connect', async () => {
      this.socket.nsp = '/';
      const messages = await this.action.getSubscribeMsg();
      await this.subscribe(messages);

      this.socket.on('bitcoind/addresstxid', async data => {
        this.action.setData(data);
        await this.action.processTransaction(this.worker);
      });
    });

    this.socket.on('disconnect', reason => {
      logger(
        `${this.action.getCoinCode().toUpperCase()} connection closed`,
        'SocketIOInterface.js - initialize() function.',
        reason,
      );
    });

    this.socket.on('error', error => {
      logger(
        `${this.action.getCoinCode().toUpperCase()} connection death`,
        'SocketIOInterface.js - initialize() function.',
        error,
      );
      this.disconnect();
      this.worker.createWorker(
        `${tasks.subscribe} ${this.action.getCoinID().toUpperCase()}`,
        {
          coinCode: this.action.getCoinCode(),
        },
        1000 * 5,
        1000 * 10,
      );
    });
    this.socket.on('connect_error', error => {
      logger(
        `${this.action.getCoinCode().toUpperCase()} connection error`,
        'SocketIOInterface.js - initialize() function.',
        error,
      );
      this.disconnect();
      this.worker.createWorker(
        `${tasks.subscribe} ${this.action.getCoinID().toUpperCase()}`,
        {
          coinCode: this.action.getCoinCode(),
        },
        1000 * 5,
        1000 * 10,
      );
    });
  };

  subscribe = messages => {
    if (!messages) {
      throw new Error('Can not get wallets list for subscribe.');
    }
    if (Array.isArray(messages)) {
      this.socket.emit('subscribe', 'bitcoind/addresstxid', messages);
    } else {
      throw new Error('The list of addresses should be in an array.');
    }
  };

  disconnect = async () => this.socket && this.socket.destroy();
}
export default SocketIOInterface;
