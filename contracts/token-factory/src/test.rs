#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Env as _};
use soroban_sdk::{token, vec, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);

    client.initialize(&admin, &treasury, &70000000, &30000000);

    let state = client.get_state();
    assert_eq!(state.admin, admin);
    assert_eq!(state.treasury, treasury);
    assert_eq!(state.base_fee, 70000000);
    assert_eq!(state.metadata_fee, 30000000);
}

#[test]
fn test_create_token() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let creator = Address::generate(&env);

    client.initialize(&admin, &treasury, &70000000, &30000000);

    // Mock fee payment
    env.mock_auths(&[MockAuth {
        address: &creator,
        invoke: &MockAuthInvoke {
            contract: &contract_id,
            fn_name: "create_token",
            args: vec![&env, creator.clone(), String::from_str(&env, "Test Token"), String::from_str(&env, "TEST"), 7u32, 1000000000i128, 70000000i128],
            sub_invokes: &[],
        },
    }]);

    let token_address = client.create_token(&creator, &String::from_str(&env, "Test Token"), &String::from_str(&env, "TEST"), &7, &1000000000, &70000000);

    assert!(token_address.is_some());
}

#[test]
fn test_burn_amount_exceeds_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &treasury, &0, &0);

    // Deploy a token and mint a known balance to user
    let token_address = client.create_token(
        &admin,
        &String::from_str(&env, "Test Token"),
        &String::from_str(&env, "TEST"),
        &7,
        &0,
        &0,
    );
    let token_client = token::TokenClient::new(&env, &token_address);
    // Mint 100 tokens to user
    token::StellarAssetClient::new(&env, &token_address).mint(&user, &100);

    assert_eq!(token_client.balance(&user), 100);

    // Attempt to burn more than the balance
    let result = client.try_burn(&token_address, &user, &200);
    assert_eq!(result, Err(Ok(Error::BurnAmountExceedsBalance)));
}
