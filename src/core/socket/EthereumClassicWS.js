import Web3 from 'web3-eth';
import { service, tasks, logger } from '../../config';
import CoinAbstract from './CoinAbstract';

class EthereumClassicWS extends CoinAbstract {
	constructor(option) {
		super(option);
		const mode = option.mode || 'production';
		// Setup coin server
		if (mode === 'production' || mode === 'uat') {
			this.uri = service[`ethereum-classic`].livenet;
			this.web3 = new Web3(service[`ethereum-classic`].livenet);
		} else {
			this.uri = service[`ethereum-classic`].technet;
			this.web3 = new Web3(service[`ethereum-classic`].technet);
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
		if (this.isTransaction()) {
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
}
export default EthereumClassicWS;
