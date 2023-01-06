import { service } from '../../config';
import CoinAbstract from './CoinAbstract';

class BitcoinWS extends CoinAbstract {
  constructor(option) {
    super(option);
    const mode = option.mode || 'production';
    // Setup coin server
    if (mode === 'production' || mode === 'uat') {
      this.uri = service.bitcoin.livenet;
    } else {
      this.uri = service.bitcoin.technet;
    }
  }

  getSubscribeMsg = async () => {
    const wallets = await this.getWallets();

    const list = wallets.map(wallet => ({
      type: 'address',
      address: wallet.coin_address,
    }));
    list.push({
      type: 'address',
      address: this.hotWallet.wallet_address,
    });
    return list;
  };

  isTransaction = () => {
    let result = false;
    if (
      'type' in this.data &&
      this.data.type === 'address' &&
      'payload' in this.data &&
      this.data.payload
    ) {
      result = 'transaction' in this.data.payload;
    }
    return result;
  };
}
export default BitcoinWS;
