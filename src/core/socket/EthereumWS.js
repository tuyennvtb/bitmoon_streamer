import Web3 from 'web3-eth';
import { service, tasks, logger } from '../../config';
import CoinAbstract from './CoinAbstract';
import fetch from '../../core/fetch';

class EthereumWS extends CoinAbstract {
	constructor(option) {
		super(option);
		const mode = option.mode || 'production';
		// Setup coin server
		if (mode === 'production' || mode === 'uat') {
			this.uri = service.ethereum.livenet;
			this.apiUri = service.erc20.liveApi;
			this.web3 = new Web3(service.ethereum.livenet);
		} else {
			this.uri = service.ethereum.technet;
			this.apiUri = service.erc20.testApi;
			this.web3 = new Web3(service.ethereum.livenet);
		}
	}
	getSubscribeMsg = async () => {
		this.walletMap = {};
		const walletList = await this.getWallets();
		for (let i = 0; i < walletList.length; i += 1) {
			const wallet = walletList[i];
			if (wallet && wallet.coin_address) {
				this.walletMap[
					wallet.coin_address.toLowerCase()
				] = wallet.coin_address.toLowerCase();
			}
		}
		const message = `{"jsonrpc":"2.0", "id": 1, "method": "eth_subscribe", "params": ["newHeads"]}`;
		return message;
	};

	isTransaction = () => {
		let result = false;
		if (
			'params' in this.data &&
			'result' in this.data.params &&
			'hash' in this.data.params.result
		) {
			result = true;
		}
		return result;
	};

	processTransaction = async worker => {
		if (await this.isTransaction()) {
			const blockInfo = await this.web3.getBlock(
				this.data.params.result.hash,
				true, // request
			);
			let intervalDelay = 3000;
			if (
				Object.keys(this.walletMap).length &&
				blockInfo.transactions &&
				blockInfo.transactions.length > 0
			) {
				blockInfo.transactions.forEach(async singleTransaction => {
					if (singleTransaction.to) {
						if (this.walletMap[singleTransaction.to.toLowerCase()]) {
							await worker.createWorker(
								tasks.createTransaction,
								{
									coinCode: this.getCoinCode(),
									coinID: this.getCoinID(),
									transfer: singleTransaction,
								},
								intervalDelay,
								1000 * 30,
							);
							intervalDelay += 3;
						}
					}
				});
			}
		}
	};

	getLast400Block = async () => {
		let blockNumber = 'latest';
		try {
			const result = await fetch(`${this.apiUri}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					method: 'eth_blockNumber',
					params: [],
					id: '1',
					jsonrpc: '2.0',
				}),
			})
				.then(res => res.json())
				.catch(err => {
					throw new Error(err.message);
				});
			if (result && result.result) {
				const currentBlock = await this.getNumberFromHex(result.result);
				blockNumber = await this.getHexFromHumber(currentBlock - 400);
			}
		} catch (error) {
			logger(
				`Error to get current blocknumber`,
				'Bitcoin.js - Function getCurrentBlockNumber()',
				error,
			);
		}
		return blockNumber;
	};
	getNumberFromHex = async hex => parseInt(hex, 16);

	getHexFromHumber = async number => `0x${number.toString(16)}`;
}
export default EthereumWS;
