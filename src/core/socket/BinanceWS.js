import { service } from '../../config';
import CoinAbstract from './CoinAbstract';

class BinanceWS extends CoinAbstract {
  constructor(option) {
    super(option);
    const mode = option.mode || 'production';
    // Setup coin server
    if (mode === 'production' || mode === 'uat') {
      this.uri = service['binance-coin'].livenet;
    } else {
      this.uri = service['binance-coin'].technet;
    }
  }

  getSubscribeMsg = async () => {
    const walletAddress = await this.getAdminWallet('warm');
    return JSON.stringify(
        { method: "subscribe", topic: "transfers", address: walletAddress.wallet_address }
    );
  };

  isTransaction = () => {
    let result = false;
    if (
      'stream' in this.data && 
      'data' in this.data &&
      'H' in this.data.data &&
      't' in this.data.data
    ) {
      result = true;
    }
    return result;
  };
}
export default BinanceWS;