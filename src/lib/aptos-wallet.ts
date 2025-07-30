import { AptosClient, HexString, Types } from 'aptos';
import { WalletCore } from '@aptos-labs/wallet-adapter-core';

export class AptosWallet {
	public client: AptosClient;
	public wallet: WalletCore;

	constructor(wallet: WalletCore, nodeUrl: string) {
		this.wallet = wallet;
		this.client = new AptosClient(nodeUrl);
	}

	public async getAddress(): Promise<string> {
		return this.wallet.account?.address?.toString() ?? '';
	}

	public async tokenBalance(coinType: string): Promise<bigint> {
		const address = await this.getAddress();
		const resources = await this.client.getAccountResources(address);

		const coin = resources.find(
			(r) => r.type === `0x1::coin::CoinStore<${coinType}>`
		);

		if (!coin) return 0n;

		return BigInt((coin.data as any).coin.value);
	}

	public async transferToken(
		receiver: string,
		amount: bigint,
		coinType: string
	): Promise<string> {
		const tx = {
			type: 'entry_function_payload',
			function: '0x1::coin::transfer',
			type_arguments: [coinType],
			arguments: [receiver, amount.toString()],
		};

		const response = await this.wallet.signAndSubmitTransaction({
			data: tx,
		});
		return response.hash;
	}

	public async signOrder(data: any): Promise<string> {
		// Adapt this to your order signing structure
		const message = JSON.stringify(data);
		return this.wallet.signMessage({
			message,
			nonce: 'fusion',
		});
	}

	public async sendTransaction(
		tx: Types.TransactionPayload
	): Promise<string> {
		const response = await this.wallet.signAndSubmitTransaction(tx);
		return response.hash;
	}
}
