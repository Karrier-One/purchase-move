import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions"
import { fromB64 } from "@mysten/bcs";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config(); // This loads the environment variables from .env file

// you can find the raw private key in the file ~/.sui/sui_config/sui.keystore
// which is generated by the command `sui client new-address`
export const raw = fromB64(process.env.SUI_PRIVATE_KEY!); 
export const keypair = Ed25519Keypair.fromSecretKey(raw.slice(1));

// const packageId = "0x2bd4ae0f9c15728723cfd5a6208108b7c6bfa46622fcc0dd1519fe91d4a709ff"; // v1
// sui client upgrade --upgrade-capability 0xab06fc4f8bebddb5681ffb18762502c934d7020541c6fcfe3e73fe42b52d739d
const packageId = "0x4915c961d415efe8e46b0ccab5b4b11f30f3af47b9543fafbce870718bd78145"; // v2

async function purchase_sui() {
    const client = new SuiClient({url: getFullnodeUrl("testnet")});
    const txb = new Transaction();
    let coin = txb.splitCoins(txb.gas, [ 10_000_000 ]);
    
    txb.moveCall({
        target: `${packageId}::pay::payCoin`,
        arguments: [
        coin,
        txb.pure.string('name'),
        txb.pure.string('system sui')
        ],
        typeArguments: [
            '0x2::sui::SUI'
        ]
    });

    const tx = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: txb,
        options: {
            showObjectChanges: true,
        }        
    });
    const resp = await client.waitForTransaction({
        digest: tx.digest,
    });
    console.log(JSON.stringify(tx));
    const created = tx.objectChanges?.filter(change => change.type === "created") ?? [];
    logToFile(JSON.stringify(tx), 'purchase_sui_log.txt');
    logToFile(JSON.stringify(created), 'purchase_sui_log.txt');
    logToFile(JSON.stringify(resp), 'purchase_sui_log.txt');
}

async function purchase_kone() {
    const client = new SuiClient({url: getFullnodeUrl("testnet")});
    const txb = new Transaction();
    let coin = txb.splitCoins('0x94093db3b446c667d77fa3710ed96ccdf501ce13677717fac7a8f427dbecb1ee', [ 15_000_000 ]);
    txb.moveCall({
        target: `${packageId}::pay::payCoin`,
        arguments: [
            coin,
            txb.pure.string('fe2a075d-772e-4fd9-9bb7-56bf35d255ce'),
            txb.pure.string('system kone')
        ],
        typeArguments: [
            '0xe245a51bb36b4427fcc5153357a602d534354e33a24ef173e6e0dbc0542959e9::tko::TKO'
        ]
        });        

    const tx = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: txb,
        options: {
            showObjectChanges: true,
        }        
    });
    const resp = await client.waitForTransaction({
        digest: tx.digest,
    });
    console.log(JSON.stringify(tx));
    const created = tx.objectChanges?.filter(change => change.type === "created") ?? [];
    logToFile(JSON.stringify(tx), 'purchase_kone_log.txt');
    logToFile(JSON.stringify(created), 'purchase_kone_log.txt');
    logToFile(JSON.stringify(resp), 'purchase_kone_log.txt');    
}

async function purchase_nft() {
    const client = new SuiClient({url: getFullnodeUrl("testnet")});
    const txb = new Transaction();    
    txb.moveCall({
        target: `${packageId}::pay::knsVoucher`,
        arguments: [
          txb.object('0x4f14b72c12cf2a7d3981b3b434d60e19f91906d765753e86565cb37332ad878a'),
          txb.pure.string('name'),
          txb.pure.string('system nft')
        ],
      });         

        const tx = await client.signAndExecuteTransaction({
            signer: keypair,
            transaction: txb,
            options: {
                showObjectChanges: true,
            }        
        });
        const resp = await client.waitForTransaction({
            digest: tx.digest,
        });
        console.log(JSON.stringify(tx));
        const created = tx.objectChanges?.filter(change => change.type === "created") ?? [];
        logToFile(JSON.stringify(tx), 'purchase_nft_log.txt');
        logToFile(JSON.stringify(created), 'purchase_nft_log.txt');
        logToFile(JSON.stringify(resp), 'purchase_nft_log.txt');        
}

function logToFile(message : string, filename = 'transaction_log.txt') {
    console.log(message);
    const formattedMessage = `${new Date().toISOString()}: ${message}\n`;
    fs.appendFileSync(filename, formattedMessage);
}

purchase_sui();
//purchase_kone();
//purchase_nft();