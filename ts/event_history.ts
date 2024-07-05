import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
const provider = new SuiClient({url: getFullnodeUrl("testnet")});
const Package = '0xabb29d54cb24de9572a10e10b21f420b4715a419cf1de88ae8ced28a52cf1f38';
const OrigPackage = '0xabb29d54cb24de9572a10e10b21f420b4715a419cf1de88ae8ced28a52cf1f38';
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