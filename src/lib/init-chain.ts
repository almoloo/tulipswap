'use server';

import { NetworkEnum, Address } from '@1inch/cross-chain-sdk';
import { evmChainRpc, NewNetworkEnum, provider } from '@/lib/constants';
import { JsonRpcProvider, Wallet as SignerWallet } from 'ethers';
import { ContractFactory } from 'ethers';
import factoryContract from '../../contracts/solidity/out/TestEscrowFactory.sol/TestEscrowFactory.json';
import resolverContract from '../../contracts/solidity/out/Resolver.sol/Resolver.json';
import { computeAddress } from 'ethers';
import {
	Aptos,
	AptosConfig,
	Network,
	Account as AptosAccount,
	Hex,
	Ed25519PrivateKey,
	InputGenerateTransactionPayloadData,
} from '@aptos-labs/ts-sdk';
import fs from 'node:fs';
import path from 'node:path';

const config = {
	chain: {
		evm: {
			chainId: NetworkEnum.ETHEREUM,
			url: evmChainRpc,
			createFork: false,
			limitOrderProtocol: '0x111111125421ca6dc452d289314280a0f8842a65',
			wrappedNative: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
			ownerPrivateKey:
				'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
			tokens: {
				USDC: {
					address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
					donor: '0xd54F23BE482D9A58676590fCa79c8E43087f92fB',
				},
			},
		},
		aptos: {
			chainId: NewNetworkEnum.APTOS,
			url: 'fromEnv.DST_CHAIN_RPC',
			createFork: false,
			limitOrderProtocol: '0x111111125421ca6dc452d289314280a0f8842a65',
			wrappedNative: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
			ownerPrivateKey:
				'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
			tokens: {
				USDC: {
					address: '0x8965349fb649a33a30cbfda057d8ec2c48abe2a2',
					donor: '0x4188663a85C92EEa35b5AD3AA5cA7CeB237C6fe9',
				},
			},
		},
	},
} as const;

async function deployEVM(
	json: { abi: any; bytecode: any },
	params: unknown[],
	provider: JsonRpcProvider,
	deployer: SignerWallet
): Promise<string> {
	const deployed = await new ContractFactory(
		json.abi,
		json.bytecode,
		deployer
	).deploy(...params);
	await deployed.waitForDeployment();

	return await deployed.getAddress();
}

export default async function initChain(side: 'EVM' | 'APTOS'): Promise<{
	escrowFactory: string;
	resolver: string;
}> {
	if (side === 'EVM') {
		const deployer = new SignerWallet(
			process.env.SERVER_WALLET_PRIVATE_KEY!,
			provider
		);

		const escrowFactory = await deployEVM(
			factoryContract,
			[
				config.chain.evm.limitOrderProtocol,
				config.chain.evm.wrappedNative,
				Address.fromBigInt(0n).toString(),
				deployer.address,
				60 * 30,
				60 * 30,
			],
			provider,
			deployer
		);

		console.log(
			`EVM:`,
			`Escrow factory contract deployed to`,
			escrowFactory
		);

		// DEPLOY RESOLVER CONTRACT
		const resolver = await deployEVM(
			resolverContract,
			[
				escrowFactory,
				config.chain.evm.limitOrderProtocol,
				computeAddress(process.env.RESOLVER_WALLET_PRIVATE_KEY!),
			],
			provider,
			deployer
		);

		console.log(`EVM:`, `Resolver contract deployed to`, resolver);

		return { resolver, escrowFactory };
	} else {
		const aptosConfig = new AptosConfig({
			network: Network.TESTNET,
		});
		const aptos = new Aptos(aptosConfig);
		AptosAccount.generate();
		const privateKey = new Ed25519PrivateKey(
			process.env.APTOS_RESOLVER_WALLET_PRIVATE_KEY!
		);
		const account = AptosAccount.fromPrivateKey({
			privateKey,
		});

		const moduleDirectory = '../lib/APTOS'; // path to your build folder
		const metadata = fs.readFileSync(
			path.join(moduleDirectory, 'package-metadata.bcs')
		);
		const moduleFiles = fs.readdirSync(
			path.join(moduleDirectory, 'bytecode_modules')
		);

		const tx = await aptos.publishPackageTransaction({
			account: account.accountAddress.toString(),
			metadataBytes: metadata,
			moduleBytecode: moduleFiles,
		});

		const committedTxn = await aptos.waitForTransaction({
			transactionHash: tx.bcsToHex().toString(),
		});

		console.log('Modules published in tx:', tx.bcsToHex().toString());

		return {
			resolver: `${tx.bcsToHex().toString()}::`,
			escrowFactory: `${tx.bcsToHex().toString()}::`,
		};
	}
}
