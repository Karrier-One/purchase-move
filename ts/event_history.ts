import { getFullnodeUrl, SuiClient, SuiHTTPTransport } from '@mysten/sui.js/client';
const provider = new SuiClient({url: getFullnodeUrl("testnet")});
const Package = '0x9ee959f9b543aa883a48a9d1739ffbec2530602e7f594ebfa4a5c5c9b000a12b';

async function processEvents() {
  let events = await provider.queryEvents({
      query:{
        MoveEventType: `${Package}::pay::CoinReceived`
      },
      order: 'descending',
      limit: 1000
    }
  );
  console.log(events);

  let voucher_events = await provider.queryEvents({
    query:{
      MoveEventType: `${Package}::pay::KNSVoucherReceived`
    },
    order: 'descending',
    limit: 1000
  }
);
console.log(voucher_events);  
}

processEvents();