module payments::pay {
    use std::string::{String, utf8};
    use sui::object::{Self, UID};
    use sui::package;
    use sui::transfer;
    use sui::coin::{Self, Coin};    
    use sui::balance::{Self, Balance};          
    use sui::tx_context::{Self, sender, TxContext};    
    use sui::event;
    use sui::sui::SUI;    
    use karrier::tko::TKO;
    use karrier_voucher::kns_voucher_nft::KNSVoucherNFT;

    struct PAY has drop {}
    
    struct AdminCap has key, store {
        id: UID,
    }

    /// Store for any type T. Collects profits from all sold listings
    struct ItemStore has key {
        id: UID,
        balance_sui: Balance<SUI>,
        balance_kone: Balance<TKO>
    } 
    
    fun init(otw: PAY, ctx: &mut TxContext) {       
        let publisher = package::claim(otw, ctx);
        transfer::public_transfer(publisher, sender(ctx));
        transfer::share_object(ItemStore {
            id: object::new(ctx),
            balance_sui: balance::zero(),
            balance_kone: balance::zero()
        });        
        transfer::public_transfer(AdminCap { id: object::new(ctx) }, sender(ctx));     
    }

    /// Admin action - collect Profits from the `ItemStore`.
    public entry fun collect_profits(
        _: &AdminCap, store: &mut ItemStore, ctx: &mut TxContext
    ) {
        let sa = balance::value(&store.balance_sui);
        let sb = balance::split(&mut store.balance_sui, sa);
        let ka = balance::value(&store.balance_kone);
        let kb = balance::split(&mut store.balance_kone, ka);

        transfer::public_transfer(coin::from_balance(sb, ctx), tx_context::sender(ctx));
        transfer::public_transfer(coin::from_balance(kb, ctx), tx_context::sender(ctx))        
    }

    struct CoinReceived has copy, drop {
        ref: String,
        system: String,
        cur: String,
        amount: u64
    }

    struct KNSVoucherReceived has copy, drop {
        ref: String,
        system: String
    }

    /// Accept payment in SUI
    public entry fun sui(
        store: &mut ItemStore,
        payment: Coin<SUI>,
        ref: String,
        system: String,
        _ctx: &mut TxContext
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
        system: String,
        _ctx: &mut TxContext
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
        payment: KNSVoucherNFT,
        ref: String,
        system: String,
        ctx: &mut TxContext
    ) {
        karrier_voucher::kns_voucher_nft::burn(payment, ctx);
        event::emit(KNSVoucherReceived {
            ref,
            system
        });
    }
}