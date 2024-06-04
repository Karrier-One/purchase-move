import { getFullnodeUrl, SuiClient, SuiHTTPTransport } from '@mysten/sui.js/client';
import { WebSocket } from 'ws';
 

const provider = new SuiClient({
	transport: new SuiHTTPTransport({
		url: getFullnodeUrl('testnet'),
		WebSocketConstructor: WebSocket as never,
	}),
});
const Package = '0x9ee959f9b543aa883a48a9d1739ffbec2530602e7f594ebfa4a5c5c9b000a12b';

const MoveEventType = '0x9ee959f9b543aa883a48a9d1739ffbec2530602e7f594ebfa4a5c5c9b000a12b::pay::CoinReceived';
let unsubscribe: any = null;
let Sender: string = '0x2567d98ad32168293b4da76f5a00c1662345181a762895d955a76d19cfb916f6';
async function processEvents() {
  console.log('processEvents', Package);
    unsubscribe = await provider.subscribeEvent({        
        filter: {
          //Sender: Sender
          MoveEventType: `${Package}::pay::KNSVoucherReceived`
          //Package: Package,
        },        
        onMessage: async (event:any) => {
            console.log('subscribeEvent', JSON.stringify(event, null, 2));
        },
    });
    process.on('SIGINT', async () => {
      console.log('Interrupted...');
      if (unsubscribe) {
        await unsubscribe();
        unsubscribe = undefined;
      }
    });
}

processEvents();