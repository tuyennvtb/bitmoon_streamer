/* eslint-disable no-console */
import WebSocket from 'ws';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { logger, tasks } from '../../config';

class WebSocketInterface {
	socket = null;
	constructor(option) {
		if (!option.worker || !option.action) {
			throw new Error('Error to setup WebSocketInterface.');
		}
		this.socket = new ReconnectingWebSocket(option.action.getURI(), null, {
			constructor: WebSocket,
			connectionTimeout: 12000,
			maxReconnectionDelay: 10000,
			minReconnectionDelay: 1000 + Math.random() * 4000,
			startClosed: false,
		});

		this.worker = option.worker;
		this.action = option.action;
	}

	initialize = async () => {
		this.socket.on('open', async () => {
			try {
				const socket = this.socket;
				const messages = await this.action.getSubscribeMsg();
				await this.subscribe(messages);
			} catch (error) {
				logger(`*** See error when open a connection to websocket ***`, error);
				this.disconnect();
				this.worker.createAndCleanWorker(
					`${tasks.subscribe} ${this.action.getCoinID().toUpperCase()}`,
					{
						coinCode: this.action.getCoinCode(),
					},
					1000 * 6,
					1000 * 10,
				);
			}
		});

		this.socket.on('message', async dataString => {
			this.action.setData(dataString);
			await this.action.processTransaction(this.worker);
		});

		this.socket.on('close', (code, reason) => {
			logger(
				`WARNING: ${this.action.getCoinCode().toUpperCase()} connection closed`,
				'WebSocketInterfaces.js - initialize() function.',
				`code: ${code} and reason: ${reason}`,
			);
		});

		this.socket.on('error', error => {
			logger(
				`Error: ${this.action.getCoinCode().toUpperCase()} connection death`,
				'WebSocketInterfaces.js - initialize() function.',
				error.message,
			);
		});
	};

	subscribe = messages => {
		if (!messages) {
			throw new Error('Can not get wallets list for subscribe.');
		}
		if (Array.isArray(messages)) {
			console.log(
				`Subcribe ${this.action.getCoinCode()}: ${JSON.stringify(messages)}`,
			);
			messages.forEach(msg => {
				this.socket.send(JSON.stringify(msg));
			});
		} else {
			console.log(`Subcribe ${this.action.getCoinCode()}: ${messages}`);
			try {
				this.socket.send(messages);
			} catch (e) {
				this.disconnect();
				this.worker.createIfNotExits(
					`${tasks.subscribe} ${this.action.getCoinID().toUpperCase()}`,
					{
						coinCode: this.action.getCoinCode(),
					},
					1000 * 60,
					1000 * 10,
				);
			}
		}
	};

	disconnect = async () => this.socket && this.socket.close();
}
export default WebSocketInterface;
