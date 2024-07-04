import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
const provider = new SuiClient({url: getFullnodeUrl("testnet")});
const Package = '0x3f45e7e62b25812c7987192208d944adbcc6ad7712ca59d90835e041c9ad8634';
const OrigPackage = '0x2bd4ae0f9c15728723cfd5a6208108b7c6bfa46622fcc0dd1519fe91d4a709ff';
async function processEvents() {
  let events = await provider.queryEvents({
      query:{
        MoveEventType: `${OrigPackage}::pay::CoinReceived`
      },
      order: 'descending',
      limit: 1000
    }
  );
  console.log(events);

  let voucher_events = await provider.queryEvents({
    query:{
      MoveEventType: `${OrigPackage}::pay::KNSVoucherReceived`
    },
    order: 'descending',
    limit: 1000
  }
);
console.log(voucher_events);  
}

processEvents();