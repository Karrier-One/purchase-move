#!/bin/bash
current_date=$(date +%F)
sui client call --package 0x4915c961d415efe8e46b0ccab5b4b11f30f3af47b9543fafbce870718bd78145 --module kns_voucher --function airdrop --args "0xc10dfeb10829442503c851abf6c58a634a6bfac1d98c025f55f37adf6eaea525" '0x98703142a8aa8b5a479b6d7dfbe567bb02cfa15e26c4e02cb66780c93d452b9b' --gas-budget 5000000 | tee "airdrop_voucher.${current_date}.txt"
