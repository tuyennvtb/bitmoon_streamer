import { Server } from 'stellar-sdk';

import { logger, tasks } from '../../config';

class StellarInterface {
	socket = null;
	streamApi = null;
	constructor(option) {
		if (!option.worker || !option.action) {
			throw new Error('Error to setup StellarInterface.');
		}
		// this.socket = new Server(option.action.getURI());
		this.streamApi = option.action.getURI();
		this.worker = option.worker;
		this.action = option.action;
	}

	initialize = async () => {
		const accountToStream = await this.action.getSubscribeMsg();
		const subscribeMsg = JSON.parse(accountToStream);
		if (subscribeMsg.accounts.wallet_address) {
			var self = this;
			this.socket = new Server(this.streamApi)
				.payments()
				.forAccount(subscribeMsg.accounts.wallet_address)
				.cursor('now')
				.stream({
					onmessage(messages) {
						self.catchTransaction(messages);
					},
				});
		} else {
			console.log(`create worker`);
			this.worker.createAndCleanWorker(
				`${tasks.subscribe} ${this.action.getCoinID().toUpperCase()}`,
				{
					coinCode: this.action.getCoinCode(),
				},
				1000 * 5,
				1000 * 10,
			);
		}
	};
	catchFailStream = async reason => {
		if (
			reason &&
			reason.type == 'error' &&
			reason.messages &&
			reason.messages.length > 0
		) {
			logger(
				`WARNING: XLM connection closed`,
				'StellarInterfaces.js - initialize() function.',
				reason,
			);
		}
	};
	catchTransaction = async dataString => {
		await this.action.setData(dataString);
		await this.action.processTransaction(this.worker);
	};

	subscribe = messages => {
		/*
    if (!messages) {
      throw new Error('Can not get wallets list for subscribe.');
    }
    if (Array.isArray(messages)) {
      console.log(
        `Subcribe ${this.action.getCoinCode()}: ${JSON.stringify(messages)}`,
      );
      messages.forEach(msg => {
        this.socket.subscribe(`address_doge_${msg}`);
      });
    } else {
      console.log(`Subcribe ${this.action.getCoinCode()}: ${messages}`);
      this.socket.subscribe(messages);
    }
    */
	};

	disconnect = async () => {};

	newMethod() {
		return this;
	}
}
export default StellarInterface;
