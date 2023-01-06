import { logger, walletAPI, tasks } from '../../config';
import fetch from '../../core/fetch';

class CoinAbstract {
	uri = '';

	coinCode = '';

	data = {};

	hotWallet = null;

	coldWallet = null;

	constructor(option) {
		this.coinCode = option.coinCode;
		this.coinID = option.coinID;
		this.hotWallet = null;
		this.coldWallet = null;
	}

	getURI = () => this.uri || '';

	getCoinCode = () => this.coinCode || '';

	getCoinID = () => this.coinID || '';

	getData = () => this.data || {};

	setData = data => {
		try {
			if (typeof data === 'string' || data instanceof String) {
				this.data = JSON.parse(data);
			} else {
				this.data = data;
			}
		} catch (e) {
			logger('Socket sync data failed.', 'RippleWS.js - setData()', data);
			this.data = {};
		}
	};

	getHotWallet = () => this.hotWallet || null;

	getColdWallet = () => this.coldWallet || null;

	getAdminWallet = async type => {
		let wallet = null;
		if (['hot', 'cold', 'warm'].indexOf(type) !== -1) {
			await fetch(`${walletAPI}/wallet/admin/${type}/${this.getCoinCode()}`)
				.then(async res => {
					const { success, data } = await res.json();
					if (success === true && data) {
						wallet = data;
					}
				})
				.catch(err => {
					logger(
						`Call service ${walletAPI}/wallet/admin/hot/${this.getCoinCode()} failed`,
						'CoinAbstract.js - getAdminWallet()',
						err,
					);
				});
		}
		return wallet;
	};

	verifyAdminWallet = async () => {
		this.hotWallet = await this.getAdminWallet('hot');
		this.coldWallet = await this.getAdminWallet('cold');
		if (!this.hotWallet || !this.coldWallet) {
			throw new Error(
				`Missing Admin Wallet for ${
					this.coinCode
				}.\nPlease check service ${walletAPI}/wallet/admin/[hot|cold]/${this.getCoinCode()}`,
			);
		}
	};

	getWallets = async () => {
		let wallets = [];
		await fetch(`${walletAPI}/wallet/list/${this.getCoinCode()}`)
			.then(async res => {
				const { success, data } = await res.json();
				if (success === true && data) {
					wallets = data;
				}
			})
			.catch(err => {
				logger(
					`Call service ${walletAPI}/wallet/list/${this.getCoinCode()} failed`,
					'CoinAbstract.js - getWallets()',
					err,
				);
			});
		return wallets;
	};

	processTransaction = async worker => {
		if (this.isTransaction()) {
			worker.createWorker(
				tasks.createTransaction,
				{
					coinCode: this.getCoinCode(),
					coinID: this.getCoinID(),
					transfer: this.data,
				},
				1,
				1000 * 30,
			);
		}
	};
}

export default CoinAbstract;
