import { service } from '../../config';
import CoinAbstract from './CoinAbstract';

class DogecoinWS extends CoinAbstract {
  constructor(option) {
    super(option);
    const mode = option.mode || 'production';
    // Setup coin server
    if (mode === 'production' || mode === 'uat') {
      this.uri = service.dogecoin.livenet;
    } else {
      this.uri = service.dogecoin.technet;
    }
  }

  getSubscribeMsg = async () => {
    const wallets = await this.getWallets();

    const list = wallets.map(wallet => wallet.coin_address);
    list.push(this.hotWallet.wallet_address);
    return list;
  };

  isTransaction = () => {
    let result = false;
    if ('value' in this.data && 'tx' in this.data.value) {
      result = !!this.data.value.tx.txid;
    }
    return result;
  };
}
export default DogecoinWS;
