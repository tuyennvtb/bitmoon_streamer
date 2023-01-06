import { service } from '../../config';
import CoinAbstract from './CoinAbstract';

class LitecoinWS extends CoinAbstract {
  constructor(option) {
    super(option);
    const mode = option.mode || 'production';
    // Setup coin server
    if (mode === 'production' || mode === 'uat') {
      this.uri = service.litecoin.livenet;
    } else {
      this.uri = service.litecoin.technet;
    }
  }

  setData = data => {
    this.data = data;
  };

  getSubscribeMsg = async () => {
    const wallets = await this.getWallets();

    const list = [];
    wallets.forEach(wallet => list.push(wallet.coin_address));
    list.push(this.hotWallet.wallet_address);
    return list;
  };

  isTransaction = () => {
    let result = false;
    if (this.data && this.data.address && this.data.txid) {
      result = true;
    }
    return result;
  };
}
export default LitecoinWS;
