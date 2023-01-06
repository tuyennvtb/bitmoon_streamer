import { Server, Network } from 'stellar-sdk';
import { service } from '../../config';
import CoinAbstract from './CoinAbstract';

class StellarWS extends CoinAbstract {
	constructor(option) {
		super(option);
		// const mode = option.mode || 'production';
		const mode = 'production';
		// Setup coin server
		if (mode === 'production' || mode === 'uat') {
			this.uri = service.stellar.livenet;
			Network.usePublicNetwork();
			this.api = new Server(service.stellar.livenet);
		} else {
			this.uri = service.stellar.livenet;
			//Network.useTestNetwork();
			Network.usePublicNetwork();
			this.api = new Server(service.stellar.technet);
		}
	}

	getSubscribeMsg = async () => {
		const walletAddress = await this.getAdminWallet('warm');
		return JSON.stringify({
			id: 'bitmoon',
			command: 'subscribe',
			accounts: walletAddress,
		});
	};
	setData = async data => {
		try {
			this.data = data;
		} catch (err) {
			console.log(err);
		}
	};

	isTransaction = () =>
		this.data.asset_type &&
		this.data.asset_type.toLowerCase() === 'native' &&
		this.data.type &&
		this.data.type.toLowerCase() === 'payment';
}
export default StellarWS;
