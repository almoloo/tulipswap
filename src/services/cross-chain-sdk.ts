'use server';

import { PrivateKeyProviderConnector, SDK } from '@1inch/cross-chain-sdk';
import { type Web3Like } from '@1inch/fusion-sdk';
import Web3 from 'web3';

// const rpc = 'https://polygon-pokt.nodies.app';
const rpc = 'https://polygon-rpc.com';
const web3 = new Web3(rpc);
const authKey = process.env.API_KEY!;
const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY!;
const walletAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;

const sdk = new SDK({
	url: 'https://api.1inch.dev/fusion-plus',
	authKey,
	blockchainProvider: new PrivateKeyProviderConnector(
		privateKey,
		web3 as unknown as Web3Like
	),
});

export { sdk };
