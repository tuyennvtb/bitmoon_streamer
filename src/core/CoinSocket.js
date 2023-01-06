import RippleWS from './socket/RippleWS';
import BitcoinWS from './socket/BitcoinWS';
import LitecoinWS from './socket/LitecoinWS';
import DogecoinWS from './socket/DogecoinWS';
import StellarWS from './socket/StellarWS';
import EthereumWS from './socket/EthereumWS';
import EthereumClassicWS from './socket/EthereumClassicWS';
import TetherERC20WS from './socket/TetherERC20WS';
import WebSocketInterface from './interface/WebSocketInterface';
import SocketIOInterface from './interface/SocketIOInterface';
import PusherInterface from './interface/PusherInterface';
import StellarInterface from './interface/StellarInterface';
import BinanceWS from './socket/BinanceWS';
import HakkaFinanceWS from './socket/HakkaFinanceWS';

// Define a skeleton factory
class CoinSocket {
	// Our default instance
	instance = null;
	socket = null;
	socketType = null;

	// setup coin api factory
	constructor(options) {
		this.socketType = options.socketType || 'WebSocket';

		if (
			!['WebSocket', 'SocketIO', 'Pusher', 'EventSource', 'Web3'].includes(
				this.socketType,
			)
		) {
			throw new Error(
				'Only accept WebSocket / Pusher / SocketIO / EventSource / Web3 interface.',
			);
		}

		switch (options.coinCode) {
			case 'xrp':
				this.instance = new RippleWS(options);
				break;
			case 'btc':
				this.instance = new BitcoinWS(options);
				break;
			case 'ltc':
				this.instance = new LitecoinWS(options);
				break;
			case 'doge':
				this.instance = new DogecoinWS(options);
				break;
			case 'xlm':
				this.instance = new StellarWS(options);
				break;
			case 'eth':
				this.instance = new EthereumWS(options);
				break;
			case 'etc':
				this.instance = new EthereumClassicWS(options);
				break;
			case 'usdterc20':
				this.instance = new TetherERC20WS(options);
				break;
			case 'hakka':
				this.instance = new HakkaFinanceWS(options);
				break;
			case 'bnb':
				this.instance = new BinanceWS(options);
				break;
			default:
				this.instance = new RippleWS(options);
		}
	}

	initialize = async worker => {
		// Get Socket Logic and ensure that the Admin wallet of the coin already configured
		const action = this.getInstance();
		await action.verifyAdminWallet();
		if (!action.getHotWallet()) {
			throw new Error('Can not fetch the Hot Wallet info');
		}
		if (!action.getColdWallet()) {
			throw new Error('Can not fetch the Cold Wallet info');
		}
		// Setup socket server
		switch (this.socketType) {
			case 'SocketIO':
				this.socket = new SocketIOInterface({
					worker,
					action,
				});
				break;
			case 'Pusher':
				this.socket = new PusherInterface({
					worker,
					action,
				});
				break;
			case 'WebSocket':
				this.socket = new WebSocketInterface({
					worker,
					action,
				});
				break;
			case 'EventSource':
				this.socket = new StellarInterface({
					worker,
					action,
				});
				break;
			default:
				throw Error('Not found socket type');
		}
		await this.socket.initialize();
	};

	subscribe = async () => {
		if (this.socket && this.instance) {
			const messages = await this.instance.getSubscribeMsg();
			await this.socket.subscribe(messages);
		}
	};

	disconnect = async () => this.socket && this.socket.disconnect();

	getInstance = () => this.instance;
}

export default CoinSocket;
