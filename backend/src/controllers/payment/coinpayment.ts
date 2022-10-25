import Coinpayments from 'coinpayments';
import { decrypt } from '../base';

const CoinpaymentsCredentials = {
    key: process.env.COINPAYMENT_KEY as string,
    secret: decrypt(process.env.COINPAYMENT_SECRET as string)
};
let client: any;
try {
    client = new Coinpayments(CoinpaymentsCredentials);
} catch (error) {
    console.log('Coinpayments error =>', error);
}

export const coinpayment = client;
