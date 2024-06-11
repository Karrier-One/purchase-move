module payments::pay {
    use std::string::{String, utf8};
    use sui::coin::{Self, Coin};    
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::sui::SUI;    
    use payments::{kns_voucher::KNSVoucher};
    use karrier::tko::TKO;

    public struct PAY has drop {}
    
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Store for any type T. Collects profits from all sold listings
    public struct ItemStore has key {
        id: UID,
        balance_sui: Balance<SUI>,
        balance_kone: Balance<TKO>
    } 
    
    fun init(_: PAY, ctx: &mut TxContext) {       
        transfer::share_object(ItemStore {
            id: object::new(ctx),
            balance_sui: balance::zero(),
            balance_kone: balance::zero()
        });        
        transfer::public_transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));     
    }

    /// Admin action - collect Profits from the `ItemStore`.
    public entry fun collect_profits(
        _: &AdminCap, store: &mut ItemStore, ctx: &mut TxContext
    ) {
        let sui = balance::withdraw_all(&mut store.balance_sui);        
        let kone = balance::withdraw_all(&mut store.balance_kone);
        transfer::public_transfer(coin::from_balance(sui, ctx), tx_context::sender(ctx));
        transfer::public_transfer(coin::from_balance(kone, ctx), tx_context::sender(ctx))        
    }

    public struct CoinReceived has copy, drop {
        ref: String,
        system: String,
        cur: String,
        amount: u64
    }

    public struct KNSVoucherReceived has copy, drop {
        ref: String,
        system: String
    }

    /// Accept payment in SUI
    public entry fun sui(
        store: &mut ItemStore,
        payment: Coin<SUI>,
        ref: String,
        system: String
    ) {
        let amount = coin::value(&payment);        
        coin::put(&mut store.balance_sui, payment);
        event::emit(CoinReceived {
            ref,
            system,
            cur: utf8(b"SUI"),
            amount: amount
        });            
    }

    /// Accept payment in SUI
    public entry fun kone(
        store: &mut ItemStore,
        payment: Coin<TKO>,
        ref: String,
        system: String
    ) {
        let amount = coin::value(&payment);
        coin::put(&mut store.balance_kone, payment);
        event::emit(CoinReceived {
            ref,
            system,
            cur: utf8(b"KONE"),
            amount: amount
        });            
    }

    public entry fun knsVoucher(
        payment: KNSVoucher,
        ref: String,
        system: String,
        ctx: &mut TxContext
    ) {
        payments::kns_voucher::burn(payment, ctx);
        event::emit(KNSVoucherReceived {
            ref,
            system
        });
    }
}