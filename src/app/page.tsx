'use client';

import {
	NewNetworkEnum,
	provider,
	srcEscrowFactory,
	tokens,
} from '@/lib/constants';
import { createOrder } from '@/lib/create-order';
import saveAddress from '@/lib/save-address';
import { Wallet } from '@/lib/wallet';
import { uint8ArrayToHex } from '@1inch/byte-utils';
import { SupportedChain, NetworkEnum, Address } from '@1inch/cross-chain-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { ethers, randomBytes } from 'ethers';
import { useEffect, useState } from 'react';
import { useWalletClient } from 'wagmi';

export default function Home() {
	const { data: walletClient } = useWalletClient();
	const { signMessage, account, connect, wallets } = useWallet();

	const [fromAmount, setFromAmount] = useState('');
	const [toAmount, setToAmount] = useState('');
	const [fromAddress, setFromAddress] = useState('');
	const [signer, setSigner] = useState<ethers.Signer | null>(null);

	useEffect(() => {
		if (!walletClient) return;
		const pr = new ethers.BrowserProvider(walletClient.transport);
		// const pr = new ethers.BrowserProvider();
		pr.getSigner().then((s) => setSigner(s));
	}, [walletClient]);

	async function handleEVMClick() {
		const srcToken = tokens.filter((t) => t.name === 'USDC')[0];
		const destToken = tokens.filter((t) => t.name === 'USDC')[0];
		const srcChainId = NetworkEnum.POLYGON;
		const dstChainId = NewNetworkEnum.APTOS as unknown as SupportedChain;

		const srcTokenAddress = new Address(srcToken.addressPolygon);
		const destTokenAddress = new Address(destToken.addressAptosFake);

		const srcChainUser = new Wallet(signer!, provider);
		// const destChainUser;
		// const srcChainResolver = new Wallet()
		// const destChainResolver;

		// const srcFactory = srcEscrowFactory;

		// APPROVE TOKEN ON SRC
		// await srcChainUser.approveToken(
		// 	srcToken.addressPolygon,
		// 	limitOrderProtocol.polygon,
		// 	MaxUint256
		// );

		// GENERATE SECRET
		const secret = uint8ArrayToHex(randomBytes(32)); // TODO: use crypto secure random number in real world

		// CREATE ORDER
		const order = await createOrder(
			'EVM',
			await srcChainUser.getAddress(),
			srcTokenAddress,
			destTokenAddress,
			srcChainId,
			dstChainId,
			secret
		);

		console.log('🎈', order);

		// SIGN ORDER
		const signature = await srcChainUser.signOrder(srcChainId, order);
		const orderHash = order.getOrderHash(srcChainId);

		console.log('🎈', signature, orderHash);
	}

	async function handleAPTOSClick() {
		if (!account) {
			connect(wallets[0].name);
		}
		const srcToken = tokens.filter((t) => t.name === 'USDC')[0];
		const destToken = tokens.filter((t) => t.name === 'USDC')[0];
		const srcChainId = NewNetworkEnum.APTOS as unknown as SupportedChain;
		const dstChainId = NetworkEnum.POLYGON;

		const srcTokenAddress = new Address(destToken.addressAptosFake);
		const destTokenAddress = new Address(srcToken.addressPolygon);

		const srcChainUser = saveAddress(account?.address!);
		console.log('🎈', account);

		// GENERATE SECRET
		const secret = uint8ArrayToHex(randomBytes(32)); // TODO: use crypto secure random number in real world

		// CREATE ORDER
		const order = await createOrder(
			'APTOS',
			srcChainUser?.toString() as string,
			srcTokenAddress,
			destTokenAddress,
			srcChainId,
			dstChainId,
			secret
		);

		console.log('🎈', order);

		// SIGN ORDER
		// const signature = await srcChainUser.signOrder(srcChainId, order);

		function canonicalJSONStringify(obj: any): string {
			if (typeof obj !== 'object' || obj === null)
				return JSON.stringify(obj);
			if (Array.isArray(obj))
				return `[${obj.map(canonicalJSONStringify).join(',')}]`;

			const keys = Object.keys(obj).sort();
			return `{${keys
				.map(
					(k) =>
						JSON.stringify(k) + ':' + canonicalJSONStringify(obj[k])
				)
				.join(',')}}`;
		}

		const typedData = order.getTypedData(srcChainId);
		const signature = await signMessage({
			message: canonicalJSONStringify(typedData.message),
			nonce: 'asdfsa',
		});
		const orderHash = order.getOrderHash(srcChainId);

		console.log('🎈', signature, orderHash);
	}
	return (
		<div className="m-5">
			<h1>Homepage</h1>
			{/* FROM */}
			<div className="border p-5">
				<h2>From EVM:</h2>
				<input
					type="text"
					placeholder="Amount"
					value={fromAmount}
					onChange={(e) => setFromAmount(e.target.value)}
					required
				/>
				<br />
				{/* <appkit-button /> */}
			</div>
			{/* TO */}
			<div className="border p-5">
				<h2>To APTOS:</h2>
				<input
					type="text"
					placeholder="Amount"
					value={toAmount}
					onChange={(e) => setToAmount(e.target.value)}
					required
				/>
			</div>
			<button
				className="bg-white text-black px-3 py-1"
				onClick={handleEVMClick}
			>
				Create and sign EVM
			</button>
			<button
				className="bg-white text-black px-3 py-1"
				onClick={handleAPTOSClick}
			>
				Create and sign APTOS
			</button>
		</div>
	);
}
