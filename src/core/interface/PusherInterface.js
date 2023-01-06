import Pusher from 'pusher-js';
import { logger, tasks } from '../../config';

class PusherInterface {
  socket = null;
  constructor(option) {
    if (!option.worker || !option.action) {
      throw new Error('Error to setup WebSocketInterface.');
    }
    this.socket = new Pusher('e9f5cc20074501ca7395', {
      encrypted: true,
      disabledTransports: ['sockjs'],
      disableStats: true,
      wsHost: option.action.getURI(),
      wsPort: 443,
      wssPort: 443,
    });
    this.worker = option.worker;
    this.action = option.action;
  }

  initialize = async () => {
    this.socket.connection.bind('connected', async () => {
      logger(
        `A connection to ${this.action.getURI()} opened.\n*** ${this.action
          .getCoinCode()
          .toUpperCase()} Socket Started ***`,
        'PusherInterface.js - initialize() function.',
      );
      const messages = await this.action.getSubscribeMsg();
      await this.subscribe(messages);
    });

    this.socket.bind_global(async (event, data) => {
      this.action.setData(data);
      await this.action.processTransaction(this.worker);
    });

    this.socket.connection.bind('disconnected', () => {
      logger(
        `WARNING: ${this.action.getCoinCode().toUpperCase()} connection closed`,
        'PusherInterface.js - initialize() function.',
      );
    });

    this.socket.connection.bind('error', async message => {
      logger(
        `Error: ${this.action.getCoinCode().toUpperCase()} connection death`,
        'PusherInterface.js - initialize() function.',
        message.error,
      );
      await this.disconnect();
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
      messages.forEach(msg => {
        this.socket.subscribe(`address_doge_${msg}`);
      });
    } else {
      this.socket.subscribe(messages);
    }
  };

  disconnect = async () => this.socket && this.socket.disconnect();
}
export default PusherInterface;
