import Web3 from 'web3-eth';
import { service, tasks } from '../../config';
import CoinAbstract from './CoinAbstract';
import fetch from '../../core/fetch';

class TetherERC20WS extends CoinAbstract {
	constructor(option) {
		super(option);
		const mode = option.mode || 'production';
		// Setup coin server
		this.uri = service.ethereum.livenet;
		this.apiUri = service.erc20.liveApi;
		this.web3 = new Web3(service.ethereum.livenet);
		this.abiDecoder = require('abi-decoder'); // NodeJS
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

	getContractAbi = async () => {
		// return ABI of contract tokens to work with this tokens
		return [
			{
				constant: true,
				inputs: [],
				name: 'name',
				outputs: [{ name: '', type: 'string' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: false,
				inputs: [{ name: '_upgradedAddress', type: 'address' }],
				name: 'deprecate',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: false,
				inputs: [
					{ name: '_spender', type: 'address' },
					{ name: '_value', type: 'uint256' },
				],
				name: 'approve',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'deprecated',
				outputs: [{ name: '', type: 'bool' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: false,
				inputs: [{ name: '_evilUser', type: 'address' }],
				name: 'addBlackList',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'totalSupply',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: false,
				inputs: [
					{ name: '_from', type: 'address' },
					{ name: '_to', type: 'address' },
					{ name: '_value', type: 'uint256' },
				],
				name: 'transferFrom',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'upgradedAddress',
				outputs: [{ name: '', type: 'address' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [{ name: '', type: 'address' }],
				name: 'balances',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'decimals',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'maximumFee',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: '_totalSupply',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: false,
				inputs: [],
				name: 'unpause',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: true,
				inputs: [{ name: '_maker', type: 'address' }],
				name: 'getBlackListStatus',
				outputs: [{ name: '', type: 'bool' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [{ name: '', type: 'address' }, { name: '', type: 'address' }],
				name: 'allowed',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'paused',
				outputs: [{ name: '', type: 'bool' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [{ name: 'who', type: 'address' }],
				name: 'balanceOf',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: false,
				inputs: [],
				name: 'pause',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'getOwner',
				outputs: [{ name: '', type: 'address' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'owner',
				outputs: [{ name: '', type: 'address' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'symbol',
				outputs: [{ name: '', type: 'string' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: false,
				inputs: [
					{ name: '_to', type: 'address' },
					{ name: '_value', type: 'uint256' },
				],
				name: 'transfer',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: false,
				inputs: [
					{ name: 'newBasisPoints', type: 'uint256' },
					{ name: 'newMaxFee', type: 'uint256' },
				],
				name: 'setParams',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: false,
				inputs: [{ name: 'amount', type: 'uint256' }],
				name: 'issue',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: false,
				inputs: [{ name: 'amount', type: 'uint256' }],
				name: 'redeem',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: true,
				inputs: [
					{ name: '_owner', type: 'address' },
					{ name: '_spender', type: 'address' },
				],
				name: 'allowance',
				outputs: [{ name: 'remaining', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'basisPointsRate',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: true,
				inputs: [{ name: '', type: 'address' }],
				name: 'isBlackListed',
				outputs: [{ name: '', type: 'bool' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: false,
				inputs: [{ name: '_clearedUser', type: 'address' }],
				name: 'removeBlackList',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: true,
				inputs: [],
				name: 'MAX_UINT',
				outputs: [{ name: '', type: 'uint256' }],
				payable: false,
				stateMutability: 'view',
				type: 'function',
			},
			{
				constant: false,
				inputs: [{ name: 'newOwner', type: 'address' }],
				name: 'transferOwnership',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				constant: false,
				inputs: [{ name: '_blackListedUser', type: 'address' }],
				name: 'destroyBlackFunds',
				outputs: [],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				inputs: [
					{ name: '_initialSupply', type: 'uint256' },
					{ name: '_name', type: 'string' },
					{ name: '_symbol', type: 'string' },
					{ name: '_decimals', type: 'uint256' },
				],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'constructor',
			},
			{
				anonymous: false,
				inputs: [{ indexed: false, name: 'amount', type: 'uint256' }],
				name: 'Issue',
				type: 'event',
			},
			{
				anonymous: false,
				inputs: [{ indexed: false, name: 'amount', type: 'uint256' }],
				name: 'Redeem',
				type: 'event',
			},
			{
				anonymous: false,
				inputs: [{ indexed: false, name: 'newAddress', type: 'address' }],
				name: 'Deprecate',
				type: 'event',
			},
			{
				anonymous: false,
				inputs: [
					{ indexed: false, name: 'feeBasisPoints', type: 'uint256' },
					{ indexed: false, name: 'maxFee', type: 'uint256' },
				],
				name: 'Params',
				type: 'event',
			},
			{
				anonymous: false,
				inputs: [
					{ indexed: false, name: '_blackListedUser', type: 'address' },
					{ indexed: false, name: '_balance', type: 'uint256' },
				],
				name: 'DestroyedBlackFunds',
				type: 'event',
			},
			{
				anonymous: false,
				inputs: [{ indexed: false, name: '_user', type: 'address' }],
				name: 'AddedBlackList',
				type: 'event',
			},
			{
				anonymous: false,
				inputs: [{ indexed: false, name: '_user', type: 'address' }],
				name: 'RemovedBlackList',
				type: 'event',
			},
			{
				anonymous: false,
				inputs: [
					{ indexed: true, name: 'owner', type: 'address' },
					{ indexed: true, name: 'spender', type: 'address' },
					{ indexed: false, name: 'value', type: 'uint256' },
				],
				name: 'Approval',
				type: 'event',
			},
			{
				anonymous: false,
				inputs: [
					{ indexed: true, name: 'from', type: 'address' },
					{ indexed: true, name: 'to', type: 'address' },
					{ indexed: false, name: 'value', type: 'uint256' },
				],
				name: 'Transfer',
				type: 'event',
			},
			{ anonymous: false, inputs: [], name: 'Pause', type: 'event' },
			{ anonymous: false, inputs: [], name: 'Unpause', type: 'event' },
		];
	};

	getContractAddress = async () => {
		return '0xdAC17F958D2ee523a2206206994597C13D831ec7';
	};

	isTransaction = async () => {
		let result = false;
		try {
			if (
				'params' in this.data &&
				'result' in this.data.params &&
				'hash' in this.data.params.result
			) {
				result = true;
			}
		} catch (error) {
			result = false;
		}
		return result;
	};
	processTransaction = async worker => {
		if (await this.isTransaction()) {
			const contractAddress = await this.getContractAddress();
			const blockInfo = await this.web3.getBlock(
				this.data.params.result.hash,
				true, // request
			);
			if (
				Object.keys(this.walletMap).length &&
				blockInfo.transactions &&
				blockInfo.transactions.length > 0
			) {
				await blockInfo.transactions.forEach(async singleTransaction => {
					if (
						singleTransaction.to &&
						singleTransaction.to.toLowerCase() == contractAddress.toLowerCase()
					) {
						const abiValue = await this.getContractAbi();
						this.abiDecoder.addABI(abiValue);
						//decode the transaction and see value
						//decodeMethod
						const decodedMethodValue = await this.abiDecoder.decodeMethod(
							singleTransaction.input,
						);
						if (
							decodedMethodValue &&
							decodedMethodValue.name &&
							decodedMethodValue.name.toLowerCase() == 'transfer' &&
							decodedMethodValue.params &&
							decodedMethodValue.params.length > 0
						) {
							let intervalDelay = 3000;
							await decodedMethodValue.params.forEach(async transferData => {
								if (
									transferData.name.toLowerCase() == '_to' &&
									transferData.type.toLowerCase() == 'address'
								) {
									if (this.walletMap[transferData.value.toLowerCase()]) {
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
										intervalDelay += 3000;
									}
								}
							});
						}
					}
				});
			}
		}
	};
	getLast200Block = async () => {
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
				blockNumber = await this.getHexFromHumber(currentBlock - 200);
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
export default TetherERC20WS;
