module payments::pay {
    use std::string;
    use sui::coin;
    use sui::event;
    use payments::{kns_voucher::KNSVoucher};

    public struct PAY has drop {}
    
    //const PAYMENT_ADDRESS: address = @0x2567d98ad32168293b4da76f5a00c1662345181a762895d955a76d19cfb916f6;
    const PAYMENT_ADDRESS: address = @0x4c9fac90ac064bd6f8528ebcabab233131332ef47cb276d1cd2178af4fa044c6;

    public struct CoinReceived has copy, drop {
        ref: string::String,
        system: string::String,
        coin: std::ascii::String,
        amount: u64
    }

    public struct KNSVoucherReceived has copy, drop {
        ref: string::String,
        system: string::String
    }

    /// Accept payment
    public entry fun payCoin<T>(
        payment: coin::Coin<T>,
        ref: string::String,
        system: string::String
    ) {
        let amount = coin::value(&payment);
        let coin_type = std::type_name::get<T>();
        let coin_type_str = coin_type.into_string();
        transfer::public_transfer(payment, PAYMENT_ADDRESS);
        event::emit(CoinReceived {
            ref,
            system,
            coin: coin_type_str,
            amount: amount
        });
    }

    public entry fun knsVoucher(
        payment: KNSVoucher,
        ref: string::String,
        system: string::String,
        ctx: &mut TxContext
    ) {
        payments::kns_voucher::burn(payment, ctx);
        event::emit(KNSVoucherReceived {
            ref,
            system
        });
    }
}