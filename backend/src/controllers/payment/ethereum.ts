import { parseUnits, formatUnits } from '@ethersproject/units';
import { Transaction as EthereumTx } from 'ethereumjs-tx';
import { Currencies } from '../../models';
import { decrypt, encrypt } from '../base';

const Web3 = require('web3');

const privKey = Buffer.from(decrypt(process.env.E_W_PRIVATE_ADDRESS as string), 'hex');

export const EthereumWeb3 = new Web3(process.env.E_WEB3_URL as string);

export const transferErc20 = async (senders: string, reciever: string, contractInfo: any, amount: string) => {
    return new Promise(async (resolve, reject) => {
        const contract = new EthereumWeb3.eth.Contract(contractInfo.abi, contractInfo.address, { from: senders });
        const decimals = await contract.methods.decimals().call();
        const amounti = parseUnits(String(amount), decimals);
        const balance = await contract.methods.balanceOf(senders).call();
        if (Number(formatUnits(balance, decimals)) < Number(amount)) {
            return reject('Insufficient funds!');
        } else {
            const nonce = await EthereumWeb3.eth.getTransactionCount(senders);
            const gasLimit = await contract.methods.transfer(reciever, amounti).estimateGas({ from: senders });
            const gasPrice = await EthereumWeb3.eth.getGasPrice();
            const transactionFee = Number(gasPrice) * gasLimit;
            const transactionFeeAmount = EthereumWeb3.utils.fromWei(String(transactionFee), 'ether');
            const ether = await Currencies.findOne({
                contractAddress: 'ether'
            });
            const etherFee = ether.price * Number(transactionFeeAmount) * 1.5;
            const erc20Amount = (contractInfo.price * Number(amount) - etherFee) / contractInfo.price;
            if (erc20Amount < 0) return reject('Insufficient transaction fee.');
            const erc20Amounti = parseUnits(Number(erc20Amount.toFixed(decimals)).toString(), decimals);
            const transactionObject = {
                from: senders,
                nonce,
                gasPrice: Number(gasPrice),
                gasLimit: 400000,
                to: contractInfo.address,
                data: contract.methods.transfer(reciever, erc20Amounti).encodeABI()
            };
            const transaction = new EthereumTx(transactionObject, {
                chain: process.env.E_WEB3_CHAIN_ID
            });
            transaction.sign(privKey);
            const serializedTransaction = `0x${transaction.serialize().toString('hex')}`;
            EthereumWeb3.eth.sendSignedTransaction(serializedTransaction, (error: any, txn_id: string) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(txn_id);
                }
            });
        }
    });
};

export const transferEthererum = async (senders: string, reciever: string, amount: string) => {
    return new Promise(async (resolve, reject) => {
        const nonce = await EthereumWeb3.eth.getTransactionCount(senders);
        EthereumWeb3.eth.getBalance(senders, async (error: any, result: any) => {
            if (error) {
                return reject();
            }
            const balance = EthereumWeb3.utils.fromWei(result, 'ether');
            if (Number(balance) < Number(amount)) {
                return reject('Insufficient funds!');
            } else {
                const gasPrice = await EthereumWeb3.eth.getGasPrice();
                const sendAmount = EthereumWeb3.utils.toHex(EthereumWeb3.utils.toWei(String(amount), 'ether'));
                let transactionObject = {
                    to: reciever,
                    gasPrice,
                    nonce: nonce
                } as any;
                const gasLimit = await EthereumWeb3.eth.estimateGas(transactionObject);
                const transactionFee = Number(gasPrice) * gasLimit * 1.5;
                transactionObject.gas = gasLimit;
                transactionObject.value = Number(sendAmount) - transactionFee;
                if (Number(sendAmount) - transactionFee < 0) return reject('Insufficient transaction fee.');
                const transaction = new EthereumTx(transactionObject, {
                    chain: 'mainnet'
                });
                transaction.sign(privKey);
                const serializedTransaction = `0x${transaction.serialize().toString('hex')}`;
                EthereumWeb3.eth.sendSignedTransaction(serializedTransaction, (error: any, txn_id: string) => {
                    if (error) {
                        return reject(error);
                    } else {
                        return resolve(txn_id);
                    }
                });
            }
        });
    });
};
