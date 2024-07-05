module payments::kns_voucher {
    use std::string;
    use sui::package;
    use sui::display;
    use sui::event;

    public struct KNSVoucher has key, store {
        id: UID
    }
    /// One-Time-Witness for the module.
    public struct KNS_VOUCHER has drop {}

    /// AdminCap is used to control the airdrop function
    public struct AdminCap has key, store {
        id: UID,
    }

    public struct VoucherMinted has copy, drop {
        // The Object ID of the NFT
        object_id: ID,
    }

    fun init(otw: KNS_VOUCHER, ctx: &mut TxContext) {
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"image_url"),
            string::utf8(b"description"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
        ];

        let values = vector[
            // name
            string::utf8(b"Karrier Number System Voucher"),
            // image_url
            string::utf8(b"https://assets.karrier.one/kns-early-adopter/kns-voucher-nft.png"),
            // description
            string::utf8(b"One free activation of the Karrier Number System. (KNS)"),
            // Project URL is usually static
            string::utf8(b"https://kns-dev.karrier.one"),
            // Creator field can be any
            string::utf8(b"Karrier One Team")
        ];

        // Claim the `Publisher` for the package
        let publisher = package::claim(otw, ctx);

        // Get a new `Display` object for the `Hero` type.
        let mut display = display::new_with_fields<KNSVoucher>(
            &publisher, keys, values, ctx
        );
        display.update_version();

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
        transfer::public_transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));        
    }

    public fun airdrop(
        _: &AdminCap,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let nft = KNSVoucher { id: object::new(ctx) };
        event::emit(VoucherMinted {
            object_id: object::id(&nft)
        });
        transfer::public_transfer(nft, recipient);    
    }

    public fun airdrop_multi(
        admin: &AdminCap,
        mut recipients: vector<address>,
        ctx: &mut TxContext
    ) {
        let (mut i, len) = (0, vector::length(&recipients));
        while (i < len) {            
            let recipient = vector::pop_back(&mut recipients);
            airdrop(admin, recipient, ctx);
            i = i + 1;
        }
    }     

    public fun burn(nft: KNSVoucher, _: &mut TxContext) {
        let KNSVoucher { id } = nft;
        object::delete(id)
    }
}