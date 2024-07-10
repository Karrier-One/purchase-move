import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions"
import { bcs } from "@mysten/sui/bcs";
import { fromB64 } from "@mysten/bcs";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import * as fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import dotenv from 'dotenv';
dotenv.config(); // This loads the environment variables from .env file

interface CsvEntry {
    Address: string;
    'Number of NFTs': number;
}

export const raw = fromB64(process.env.SUI_PRIVATE_KEY!); 
export const keypair = Ed25519Keypair.fromSecretKey(raw.slice(1));

const packageId = "0x4915c961d415efe8e46b0ccab5b4b11f30f3af47b9543fafbce870718bd78145";
const adminCapId = "0xc10dfeb10829442503c851abf6c58a634a6bfac1d98c025f55f37adf6eaea525";
const recipientMaster = [
    "0xf87ea7d2d19df780f45519845f2772eab35b6dcdfbfcd504f6d28931bdb50aac",
    "0xf87ea7d2d19df780f45519845f2772eab35b6dcdfbfcd504f6d28931bdb50aac",
    // "0x2567d98ad32168293b4da76f5a00c1662345181a762895d955a76d19cfb916f6",
    // "0x2567d98ad32168293b4da76f5a00c1662345181a762895d955a76d19cfb916f6",
    // "0xb1ddeabd526ec4c67f21070ed458eb62ff160cb35637ddce0bbfee7e40cb522a",
    // "0xb1ddeabd526ec4c67f21070ed458eb62ff160cb35637ddce0bbfee7e40cb522a",
    // "0xf87ea7d2d19df780f45519845f2772eab35b6dcdfbfcd504f6d28931bdb50aac",
    // "0xf87ea7d2d19df780f45519845f2772eab35b6dcdfbfcd504f6d28931bdb50aac",
    // "0xf87ea7d2d19df780f45519845f2772eab35b6dcdfbfcd504f6d28931bdb50aac",
    // "0x18d5cec50377310e179117e7e7012edc72b1e63e9255f56e9fe345ca3d2a3528",
    // "0x638f6a27afac548a9a9aabf33393f3238251f0bcd39a1697f5f653304bafcb54", // AE    
    //"0xcc0e58831f17605aaa94823d8a4ffc557d47dab83adf763773ea9ced9bbd7c08", // NM
    //"0x98703142a8aa8b5a479b6d7dfbe567bb02cfa15e26c4e02cb66780c93d452b9b", // AB    
];

async function airdropSimulation(recipientsMaster: string[], batchNumber:number, batchSize:number) {
    const recipients: string[] = [];

    for (let i = 1; i <= batchSize; i++) {
        let ln = batchNumber * 100 + i;
        recipients.push(recipientsMaster[ln % recipientsMaster.length]);    
    }
    console.log(recipients); // Array of 10000 entries with recipientsMaster cycling every 3 entries     
    await airdrop(recipients);
}

interface CsvRecord {
    recipient: string;
    transactionId: string;
  }
  
  async function appendToCsv(filePath: string, records: CsvRecord[]) {
    const fileExists = fs.existsSync(filePath);
    let shouldAppend = fileExists && fs.statSync(filePath).size > 0;    
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'recipient', title: 'Recipient' },
        { id: 'transactionId', title: 'Transaction ID' },
      ],
      append: shouldAppend, // Set to true to append to the file instead of overwriting it
    });
  
    try {
      await csvWriter.writeRecords(records);
      console.log('CSV file updated successfully');
    } catch (error) {
      console.error('Error writing to CSV file:', error);
    }
  }

    interface ObjectChangeRecord {
        type: string;
        sender: string;
        digest: string;
        objectId: string;
        objectType: string;
        owner: string;
        transactionId: string;
    }
    async function appendToObjectChangeCsv(filePath: string, objectChanges: any[], transactionId: string) {
        const fileExists = fs.existsSync(filePath);
        let shouldAppend = fileExists && fs.statSync(filePath).size > 0;          
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'type', title: 'Type' },
                { id: 'sender', title: 'Sender' },
                { id: 'digest', title: 'Digest' },
                { id: 'objectId', title: 'Object ID' },
                { id: 'objectType', title: 'Object Type' },
                { id: 'owner', title: 'Owner' },
                { id: 'transactionId', title: 'Transaction ID' },
            ],
            append: shouldAppend, // Set to true to append to the file instead of overwriting
        });
    
        const records: ObjectChangeRecord[] = objectChanges.map(change => ({
            type: change.type,
            sender: change.sender,
            digest: change.digest,
            objectId: change.objectId,
            objectType: change.objectType,
            owner: change.owner?.AddressOwner ?? '',
            transactionId: transactionId,
        }));
    
        try {
            await csvWriter.writeRecords(records);
            console.log('Object change CSV file updated successfully');
        } catch (error) {
            console.error('Error writing object changes to CSV file:', error);
        }
    }

async function airdrop(recipients: string[]) {
    const client = new SuiClient({url: getFullnodeUrl("testnet")});
    const txb = new Transaction();

    // This will hold all the VecMaps for each recipient
    const vecMaps: TransactionObjectArgument[] = [];
    txb.moveCall({
        target: `${packageId}::kns_voucher::airdrop_multi`,
        arguments: [
            txb.object(adminCapId),            
            txb.pure(bcs.vector(bcs.Address).serialize(recipients))
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
    const created = tx.objectChanges?.filter(change => change.type === "created") ?? [];
    // const createdObjectIds = created?.map(change => {
    //     if ('objectId' in change) {
    //         return change.objectId;
    //     }
    //     return '';
    // }) ?? [];
    console.log(tx);
    console.log(created);
    console.log(resp);
    // Prepare the data to append to the CSV
    const csvData: CsvRecord[] = recipients.map((recipient, index) => ({
        recipient,
        transactionId: tx.digest, // Assuming tx.digest is the transaction ID
    }));

    // Append to the CSV after the successful transaction
    await appendToCsv('airdrop_records.csv', csvData);
    // New call to append object IDs to a separate CSV file
    await appendToObjectChangeCsv('airdrop_objectids.csv', created, tx.digest);
    //objectId: createdObjectIds?.[index] ?? '',
}

async function airdropFromCsv(filePath: string, batchSize: number) {
    const recipients: string[] = [];
    // Read the CSV file and populate the recipients and nftCounts arrays
    const results: CsvEntry[] = await new Promise((resolve, reject) => {
        const data: CsvEntry[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row: CsvEntry) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', (error: Error) => reject(error));
    });

    // Process the CSV data
    for (const row of results) {
        let count = row['Number of NFTs'];
        for (let k = 0; k < count; k++) {
            recipients.push(row.Address);
        }
    }

    // Here you would call your airdrop function with the data from the CSV
    // For this example, we're just logging the output
    console.log('Recipients:', recipients);

    let totalBatches = Math.ceil(recipients.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = start + batchSize;
        const batchRecipients = recipients.slice(start, end);
        console.log(batchRecipients); // Array of 10000 entries with recipientsMaster cycling every 3 entries     
        await airdrop(batchRecipients);
    }    
}

// Replace 'output.csv' with the path to your actual CSV file
// airdropFromCsv('output2.csv', 15).catch(console.error);
airdropSimulation(recipientMaster, 0, 2).catch(console.error);