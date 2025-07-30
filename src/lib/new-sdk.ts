import { Address } from '@1inch/cross-chain-sdk';
import { add0x } from '@1inch/byte-utils';
import assert from 'assert';
import { isAddress } from 'ethers';

function isAptosAddress(val: string): boolean {
	return /^0x[0-9a-fA-F]{64}(::[a-zA-Z_][a-zA-Z0-9_]*::[a-zA-Z_][a-zA-Z0-9_]*)?$/.test(
		val
	);
}

export class NewAddress {
	private readonly value: string;

	static NATIVE_CURRENCY = new NewAddress(
		'0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
	);

	static ZERO_ADDRESS = new NewAddress(
		'0x0000000000000000000000000000000000000000'
	);

	constructor(val: string) {
		assert(typeof val === 'string', `Address must be a string`);

		if (isAddress(val) || isAptosAddress(val)) {
			// Valid EVM address
			this.value = val.toLowerCase();
		} else {
			throw new Error(`Invalid address format: ${val}`);
		}
	}

	static fromBigInt(val: bigint): NewAddress {
		return new NewAddress(add0x(val.toString(16).padStart(40, '0')));
	}

	static fromFirstBytes(bytes: string): NewAddress {
		return new NewAddress(bytes.slice(0, 66)); // Max 32 bytes (64 hex chars + 0x)
	}

	public toString(): string {
		return this.value;
	}

	public equal(other: NewAddress): boolean {
		return this.value === other.value;
	}

	public isNative(): boolean {
		return this.equal(NewAddress.NATIVE_CURRENCY);
	}

	public isZero(): boolean {
		return this.equal(NewAddress.ZERO_ADDRESS);
	}

	public lastHalf(): string {
		return add0x(this.value.slice(-20)); // this is a bit EVM-specific
	}

	public isEvm(): boolean {
		return isAddress(this.value);
	}

	public isAptos(): boolean {
		return /^0x[0-9a-fA-F]{64}$/.test(this.value) && !this.isEvm();
	}
}
