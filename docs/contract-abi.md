# Contract ABI Documentation — Token Factory

## Overview

This document describes the full interface of the Token Factory contract, including function signatures, parameters, return values, errors, and data structures.

---

## Data Structures

### TokenInfo

Represents metadata about a deployed token.

| Field        | Type    | Description                    |
| ------------ | ------- | ------------------------------ |
| name         | String  | Token name                     |
| symbol       | String  | Token symbol                   |
| decimals     | u32     | Number of decimal places       |
| creator      | Address | Address that created the token |
| created_at   | u64     | Ledger timestamp when created  |
| burn_enabled | bool    | Whether burning is allowed     |

---

### FactoryState

| Field        | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| admin        | Address | Contract administrator      |
| paused       | bool    | Whether contract is paused  |
| locked       | bool    | Reentrancy guard            |
| treasury     | Address | Fee receiver                |
| fee_token    | Address | Token used for fee payments |
| base_fee     | i128    | Fee for token creation/mint |
| metadata_fee | i128    | Fee for metadata setting    |
| token_count  | u32     | Total tokens created        |

---

## Functions

### initialize

```
initialize(env: Env, admin: Address, treasury: Address, fee_token: Address, base_fee: i128, metadata_fee: i128) -> Result<(), Error>
```

Initializes contract state.

**Errors**

* AlreadyInitialized

---

### create_token

```
create_token(env: Env, creator: Address, salt: BytesN<32>, token_wasm_hash: BytesN<32>, name: String, symbol: String, decimals: u32, initial_supply: i128, fee_payment: i128) -> Result<Address, Error>
```

Deploys and initializes a new token.

**Errors**

* InvalidParameters
* InsufficientFee
* Reentrancy
* ArithmeticOverflow

---

### set_metadata

```
set_metadata(env: Env, token_address: Address, admin: Address, metadata_uri: String, fee_payment: i128) -> Result<(), Error>
```

Sets metadata for a token (only once).

**Errors**

* TokenNotFound
* Unauthorized
* MetadataAlreadySet
* InsufficientFee

---

### mint_tokens

```
mint_tokens(env: Env, token_address: Address, admin: Address, to: Address, amount: i128, fee_payment: i128) -> Result<(), Error>
```

Mints new tokens.

**Errors**

* InvalidParameters
* Unauthorized
* TokenNotFound
* InsufficientFee

---

### burn

```
burn(env: Env, token_address: Address, from: Address, amount: i128) -> Result<(), Error>
```

Burns tokens.

**Errors**

* InvalidBurnAmount
* BurnAmountExceedsBalance
* BurnNotEnabled

---

### set_burn_enabled

```
set_burn_enabled(env: Env, token_address: Address, admin: Address, enabled: bool) -> Result<(), Error>
```

Enable/disable burning.

**Errors**

* Unauthorized
* TokenNotFound

---

### pause / unpause

```
pause(env: Env, admin: Address) -> Result<(), Error>
unpause(env: Env, admin: Address) -> Result<(), Error>
```

Controls contract state.

**Errors**

* Unauthorized

---

### update_fees

```
update_fees(env: Env, admin: Address, base_fee: Option<i128>, metadata_fee: Option<i128>) -> Result<(), Error>
```

Updates fees.

---

### upgrade

```
upgrade(env: Env, admin: Address, new_wasm_hash: BytesN<32>) -> Result<(), Error>
```

Upgrades contract WASM.

---

### migrate

```
migrate(env: Env, admin: Address) -> Result<(), Error>
```

Reserved for future migrations.

---

### transfer_admin

```
transfer_admin(env: Env, admin: Address, new_admin: Address) -> Result<(), Error>
```

Transfers ownership.

---

### get_state

```
get_state(env: Env) -> Result<FactoryState, Error>
```

Returns contract state.

---

### get_base_fee

```
get_base_fee(env: Env) -> Result<i128, Error>
```

---

### get_metadata_fee

```
get_metadata_fee(env: Env) -> Result<i128, Error>
```

---

### get_token_info

```
get_token_info(env: Env, index: u32) -> Result<TokenInfo, Error>
```

---

### get_tokens_by_creator

```
get_tokens_by_creator(env: Env, creator: Address) -> Vec<u32>
```

---

## Errors

| Error                    | Description                  |
| ------------------------ | ---------------------------- |
| InsufficientFee          | Fee provided is too low      |
| Unauthorized             | Caller is not allowed        |
| InvalidParameters        | Invalid input values         |
| TokenNotFound            | Token does not exist         |
| MetadataAlreadySet       | Metadata already set         |
| AlreadyInitialized       | Contract already initialized |
| BurnAmountExceedsBalance | Burn > balance               |
| BurnNotEnabled           | Burning disabled             |
| InvalidBurnAmount        | Amount ≤ 0                   |
| ContractPaused           | Contract paused              |
| Reentrancy               | Reentrant call detected      |
| ArithmeticOverflow       | Overflow occurred            |
| StateNotFound            | Contract state missing       |

---

## XDR Encoding Notes

| Type       | Encoding                   |
| ---------- | -------------------------- |
| Address    | 32-byte account identifier |
| BytesN<32> | Fixed 32-byte binary       |
| String     | UTF-8 encoded              |
| i128       | 128-bit signed integer     |
| u32/u64    | Unsigned integers          |
| Vec<T>     | Variable-length list       |

---

## Integration Notes

* All operations are **atomic per transaction**
* Fees must be **pre-approved via token contract**
* Contract enforces **reentrancy protection**
* Metadata is **write-once**
* Burning is **configurable per token**

---
