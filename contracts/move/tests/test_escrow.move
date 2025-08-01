#[test_only]
module swipe_addr::test_escrow {
    use std::vector;
    use std::signer;
    use std::string;
    use std::hash;
    use std::timestamp;
    use std::error;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::aptos_coin;
    use aptos_framework::aptos_account;

    use swipe_addr::escrow;

    const E_INVALID_ESCROW_COUNT: u64 = 101;
    const E_ESCROW_STORE_NOT_FOUND: u64 = 102;
    const E_INVALID_BALANCE: u64 = 103;
    const E_INVALID_CONTRACT_BALANCE: u64 = 104;

    #[test(alice = @0x1, bob = @0x2, aptos_framework = @aptos_framework)]
    public fun test_escrow(alice: &signer, bob: &signer, aptos_framework: &signer) {

        let alice_addr = signer::address_of(alice);

        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        let alice_coins = coin::mint(1_000_000_000_000_000, &mint_cap);
        let alice_address = signer::address_of(alice);
        let bob_address = signer::address_of(bob);
        let secret = string::utf8(b"test_secret");

        coin::deposit(alice_address, alice_coins);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        timestamp::set_time_has_started_for_testing(aptos_framework);

        escrow::init_module_for_test(alice);
        
        let secret = string::utf8(b"test_secret");
        let hash = hash::sha3_256(*string::bytes(&secret));

        let secret2 = string::utf8(b"test_secret2");
        let hash2 = hash::sha3_256(*string::bytes(&secret2));

        let timeout = timestamp::now_seconds() + 3600;

        let initial_balance = coin::balance<AptosCoin>(signer::address_of(alice));

        escrow::create_escrow(
            alice,
            signer::address_of(bob),
            hash,
            10_000,
            timeout,
            100,
        );

        escrow::create_escrow(
            alice,
            signer::address_of(bob),
            hash2,
            5_000,
            timeout,
            100,
        );

        // check escrow exist
        let storeLenth = escrow::GetStoreLength(alice);
        assert!(storeLenth == 2, E_INVALID_ESCROW_COUNT);

        // check claim
        let bob_initial_balance = coin::balance<AptosCoin>(bob_address);
        escrow::claim(bob, bob_address, alice_addr, secret);
        let bob_final_balance = coin::balance<AptosCoin>(bob_address);
        assert!(bob_final_balance - bob_initial_balance == 10_100, E_INVALID_BALANCE);

        // escrow::claim(bob, alice_addr, secret2); 
        timestamp::update_global_time_for_test(timestamp::now_microseconds() + 7200 * 1000000);

        let alice_initial_balance = coin::balance<AptosCoin>(alice_addr);
        escrow::cancel(bob, alice_addr);
        let alice_final_balance = coin::balance<AptosCoin>(alice_addr);
        assert!(alice_final_balance - alice_initial_balance == 5_000, E_INVALID_BALANCE);
    }
}