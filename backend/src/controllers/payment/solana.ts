import axios from 'axios';
import * as bs58 from 'bs58';
import { decrypt } from '../base';
import { getOrCreateAssociatedTokenAccount, createTransferCheckedInstruction } from '@solana/spl-token';
import { Keypair, Transaction, Connection, PublicKey, clusterApiUrl, SystemProgram, LAMPORTS_PER_SOL, Cluster } from '@solana/web3.js';

let param: any;
let URL: any;
let connection: any;
let PRIVKEY: any;
let txWallet: any;

try {
    param = process.env.NETWORK_URL as Cluster;
    URL = clusterApiUrl(param);
    connection = new Connection(clusterApiUrl(param));
    PRIVKEY = decrypt(process.env.S_W_PRIVATE_ADDRESS as string);
    txWallet = Keypair.fromSecretKey(bs58.decode(PRIVKEY));
} catch (error) {
    console.log('Solana web3 error =>', error);
}

export const getTxnSolana = async (signature: string) => {
    const res = await axios(URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        data: {
            jsonrpc: '2.0',
            id: 'get-transaction',
            method: 'getTransaction',
            params: [signature]
        }
    });
    return res;
};

export const transferSOL = async (amount: string, destAddress: string) => {
    let transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: txWallet.publicKey,
            toPubkey: new PublicKey(destAddress),
            lamports: Math.floor(Number(amount) * LAMPORTS_PER_SOL)
        })
    );
    transaction.feePayer = txWallet.publicKey;
    const txhash = await connection.sendTransaction(transaction, [txWallet]);
    console.log(`txhash: ${txhash}`);
    return txhash;
};

export const transferSPL = async (tokenMintAddress: string, amount: string, destAddress: string) => {
    const mintPubkey = new PublicKey(tokenMintAddress);
    const destPubkey = new PublicKey(destAddress);
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, txWallet, mintPubkey, txWallet.publicKey);
    const tokenAccountBalance = await connection.getTokenAccountBalance(fromTokenAccount.address);
    if (tokenAccountBalance) {
        const decimals = tokenAccountBalance.value.decimals;
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, txWallet, mintPubkey, destPubkey);
        const transaction = new Transaction().add(
            createTransferCheckedInstruction(
                fromTokenAccount.address,
                mintPubkey,
                toTokenAccount.address,
                txWallet.publicKey,
                Math.floor(Number(amount) * 10 ** decimals),
                decimals
            )
        );
        const txhash = await connection.sendTransaction(transaction, [txWallet]);
        return txhash;
    }
    return false;
};

export const getSOLbalance = async (walletAddress: string, currency: any) => {
    const ownerPubkey = new PublicKey(walletAddress);
    let tokenBalance: any;
    try {
        if (currency.symbol === 'SOL') {
            tokenBalance = (await connection.getBalance(ownerPubkey)) / LAMPORTS_PER_SOL;
        } else {
            const mintPubkey = new PublicKey(currency.contractAddress);
            const ownerTokenAccount: any = await getOrCreateAssociatedTokenAccount(connection, txWallet, mintPubkey, ownerPubkey);
            const tokenAccountBalance: any = await connection.getTokenAccountBalance(ownerTokenAccount.address);
            tokenBalance = tokenAccountBalance.value.amount / 10 ** tokenAccountBalance.value.decimals;
        }
    } catch (error) {
        tokenBalance = 0;
    }
    return tokenBalance;
};
