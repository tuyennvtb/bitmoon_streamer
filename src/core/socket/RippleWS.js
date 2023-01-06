import { service } from '../../config';
import CoinAbstract from './CoinAbstract';

class RippleWS extends CoinAbstract {
  constructor(option) {
    super(option);
    const mode = option.mode || 'production';
    // Setup coin server
    if (mode === 'production' || mode === 'uat') {
      this.uri = service.ripple.livenet;
    } else {
      this.uri = service.ripple.technet;
    }
  }

  getSubscribeMsg = async () => {
    const warmWallet =  await this.getAdminWallet('warm');
    if (!warmWallet) {
      logger(
        `Call getSubscribeMsg failed. Missing warm wallet`,
        'RippleWS.js - getSubscribeMsg()',
        err,
      );
      return
    }
    const list =[warmWallet.wallet_address];
    list.push(this.hotWallet.wallet_address);

    return JSON.stringify({
      id: 'bitmoon',
      command: 'subscribe',
      accounts: list,
    });
  };

  isTransaction = () =>
    this.data.engine_result_code === 0 && 'transaction' in this.data;
}
export default RippleWS;
