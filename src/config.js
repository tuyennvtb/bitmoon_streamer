import kue from 'kue';

export const queue = kue.createQueue({
	prefix: 'q',
	redis: {
		port: process.env.REDIS_PORT || 6379,
		host: process.env.REDIS_HOST || '127.0.0.1',
		auth: process.env.REDIS_PASSWORD || '',
	},
});

export const tasks = {
	subscribe: 'Socket - Subscribe',
	createTransaction: 'Socket - Catch New Transaction',
};

export const env = process.env.NODE_ENV || 'development';
export const port = process.env.PORT || 4000;
export const activeCoin = process.env.ACTIVE_COIN || 'usdterc20';
export const host = process.env.HOSTNAME || 'localhost';
export const walletAPI = process.env.WALLET_API || 'http://localhost:9000';
export const service = {
	ripple: {
		technet: 'wss://s.altnet.rippletest.net:51233',
		livenet: 'wss://s1.ripple.com',
		coinCode: 'xrp',
		socketType: 'WebSocket',
	},
	bitcoin: {
		technet: 'wss://testnet-ws.smartbit.com.au/v1/blockchain',
		livenet: 'wss://ws.smartbit.com.au/v1/blockchain',
		coinCode: 'btc',
		socketType: 'WebSocket',
	},
	litecoin: {
		technet:
			process.env.LTC_SOCKET || 'ws://livenet-litecoin-server.bitmoon.net:8989',
		livenet:
			process.env.LTC_SOCKET || 'ws://livenet-litecoin-server.bitmoon.net:8989',
		coinCode: 'ltc',
		socketType: 'SocketIO',
	},
	dogecoin: {
		technet: 'slanger1.sochain.com',
		livenet: 'slanger1.sochain.com',
		coinCode: 'doge',
		socketType: 'Pusher',
	},
	stellar: {
		technet: 'https://horizon-testnet.stellar.org',
		livenet: 'https://horizon.stellar.org',
		coinCode: 'xlm',
		socketType: 'EventSource',
	},
	ethereum: {
		technet: process.env.SOCKET_DEV_ETHEREUM || 'ws://195.154.81.121:8546',
		livenet: process.env.SOCKET_PRO_ETHEREUM || 'ws://195.154.81.121:8546',
		coinCode: 'eth',
		socketType: 'WebSocket',
	},
	'ethereum-classic': {
		technet:
			process.env.SOCKET_DEV_ETHEREUM_CLASSIC || 'ws://195.154.81.121:9546',
		livenet:
			process.env.SOCKET_PROD_ETHEREUM_CLASSIC || 'ws://195.154.81.121:9546',
		coinCode: 'etc',
		socketType: 'WebSocket',
	},
	usdterc20: {
		technet: process.env.SOCKET_DEV_ETHEREUM || 'ws://195.154.81.121:8546',
		livenet: process.env.SOCKET_PRO_ETHEREUM || 'ws://195.154.81.121:8546',
		coinCode: 'usdterc20',
		socketType: 'WebSocket',
	},
	erc20: {
		technet: process.env.SOCKET_DEV_ETHEREUM || 'ws://195.154.81.121:8546',
		livenet: process.env.SOCKET_PRO_ETHEREUM || 'ws://195.154.81.121:8546',
		liveApi: process.env.API_PRO_ERC20 || 'http://195.154.81.121:8545',
		testApi: process.env.API_UAT_ERC20 || 'http://195.154.81.121:8545',
	},
	'hakka-finance': {
		technet: process.env.SOCKET_DEV_ERC20 || 'ws://195.154.81.121:8546',
		livenet: process.env.SOCKET_PRO_ERC20 || 'ws://195.154.81.121:8546',
		coinCode: 'hakka',
		socketType: 'Web3',
	},
	'binance-coin': {
		technet: 'wss://testnet-dex.binance.org/api/ws',
		livenet: 'wss://dex.binance.org/api/ws',
		coinCode: 'bnb',
		socketType: 'WebSocket',
	},
};

export const options = {
	method: 'POST',
	hostname: host,
	port,
	headers: {
		'content-type': 'application/json',
		'cache-control': 'no-cache',
	},
};
export const serviceSeting = {
	delay: 3000, // Delay time for next call if the previous call failed
	limit: 3, // maximum amount of calls
};
export const logger = (content, line, issue) => {
	console.log('------------------------------------------');
	console.log(`File: ${line}`);
	console.log(`Time: ${new Date().toString()}`);
	console.log(content);
	if (issue) {
		console.log(issue);
	}
};
