module swipe_addr::escrow {

    use std::error;
    use std::signer;
    use std::timestamp;
    use std::string::String;
    use std::string;
    use std::vector;
    use std::hash;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    struct Escrow has key, store, drop{
        sender: address,
        recipient: address,
        hashlock: vector<u8>, // hash of secret
        amount: u64,
        deadline: u64, // Unix timestamp
        claimed: bool,
        safety_deposit: u64,
    }

    struct CoinStore has key {
        coins: coin::Coin<AptosCoin>,
    }

    struct EscrowStore has key {
        escrows: vector<Escrow>,
    }

    // This function is only called once when the module is published for the first time.
    // init_module is optional, you can also have an entry function as the initializer.
    fun init_module(sender: &signer) {
        move_to(sender, EscrowStore {
            escrows: vector::empty(),
        });
        move_to(sender, CoinStore {
            coins: coin::zero<AptosCoin>(),
        });
    }

    // ======================== Write functions ========================

    public fun create_escrow(
        sender: &signer,
        recipient: address,
        hashlock: vector<u8>,
        amount: u64,
        deadline: u64,
        safety_deposit: u64
    ) acquires EscrowStore, CoinStore {
        assert!(deadline > timestamp::now_seconds(), error::invalid_argument(0));

        let total_amount = amount + safety_deposit;
        let withdrawCoin = coin::withdraw<AptosCoin>(sender, total_amount);

        let escrow = Escrow {
            sender: signer::address_of(sender),
            recipient,
            hashlock,
            amount,
            deadline,
            claimed: false,
            safety_deposit,
        };

        let store = borrow_global_mut<EscrowStore>(signer::address_of(sender));
        vector::push_back(&mut store.escrows, escrow);

        let sender_addr = signer::address_of(sender);
        let coin_store = borrow_global_mut<CoinStore>(sender_addr);
        coin::merge<AptosCoin>(&mut coin_store.coins, withdrawCoin);

    }

    public fun claim(
        collector: &signer,
        claimer_addr: address,
        sender_address: address,
        secret: String,
    ) acquires EscrowStore, CoinStore {
        let store = borrow_global_mut<EscrowStore>(sender_address);
        let now = timestamp::now_seconds();

        let i = 0;
        let len = vector::length(&store.escrows);

        let secret_bytes = *string::bytes(&secret);
        let hashCheck = hash::sha3_256(secret_bytes);

        while (i < len) {
            let escrow_ref = vector::borrow_mut(&mut store.escrows, i);
    
            if (
                escrow_ref.recipient == claimer_addr &&
                !escrow_ref.claimed &&
                now <= escrow_ref.deadline &&
                hashCheck == escrow_ref.hashlock
            ) {
                escrow_ref.claimed = true;

                let coin_store = borrow_global_mut<CoinStore>(sender_address);

                let withdrawCoin = coin::extract<AptosCoin>(&mut coin_store.coins, escrow_ref.amount);
                let withdrawCoinSafty = coin::extract<AptosCoin>(&mut coin_store.coins, escrow_ref.safety_deposit);
                coin::deposit<AptosCoin>(claimer_addr, withdrawCoin);
                coin::deposit<AptosCoin>(signer::address_of(collector), withdrawCoinSafty);
            
                vector::swap_remove(&mut store.escrows, i);
                return;
            };
            i = i + 1;
        };
        abort error::not_found(1);
    }

    public fun cancel (
        collector: &signer,
        sender_address: address,
    ) acquires EscrowStore, CoinStore {
        let store = borrow_global_mut<EscrowStore>(sender_address);
        let now = timestamp::now_seconds();

        let i = 0;
        let len = vector::length(&store.escrows);
        while (i < len) {
            let escrow_ref = vector::borrow_mut(&mut store.escrows, i);
            if (
                escrow_ref.sender == sender_address &&
                !escrow_ref.claimed &&
                now > escrow_ref.deadline
            ) {
                escrow_ref.claimed = true;

                let coin_store = borrow_global_mut<CoinStore>(escrow_ref.sender);

                let withdrawCoin = coin::extract<AptosCoin>(&mut coin_store.coins, escrow_ref.amount);
                let withdrawCoinSafty = coin::extract<AptosCoin>(&mut coin_store.coins, escrow_ref.safety_deposit);

                coin::deposit<AptosCoin>(escrow_ref.sender, withdrawCoin);
                coin::deposit<AptosCoin>(signer::address_of(collector), withdrawCoinSafty);

                vector::swap_remove(&mut store.escrows, i);

                return;
            };
            i = i + 1;
        };
        abort error::not_found(2);
    }

    // ======================== Read Functions ========================

    // ======================== Helper functions ========================

    // ======================== Unit Tests ========================


    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }

    #[test_only]
    public fun GetStoreLength(sender: &signer): u64 acquires EscrowStore {
        let store = borrow_global<EscrowStore>(signer::address_of(sender));
        return vector::length(&store.escrows)
    }
}
