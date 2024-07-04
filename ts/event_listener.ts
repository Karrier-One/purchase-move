import { getFullnodeUrl, SuiClient, SuiHTTPTransport } from '@mysten/sui/client';
import { WebSocket } from 'ws';
 

const provider = new SuiClient({
	transport: new SuiHTTPTransport({
		url: getFullnodeUrl('testnet'),
    websocket: {
      reconnectTimeout: 1000, // Using 'any' for TypeScript compatibility
    },
    WebSocketConstructor: WebSocket as any,
	}),
});
const Package = '0x3f45e7e62b25812c7987192208d944adbcc6ad7712ca59d90835e041c9ad8634';
const OrigPackage = '0x2bd4ae0f9c15728723cfd5a6208108b7c6bfa46622fcc0dd1519fe91d4a709ff';
const MoveEventType = '0x2bd4ae0f9c15728723cfd5a6208108b7c6bfa46622fcc0dd1519fe91d4a709ff::pay::CoinReceived';
let unsubscribe: any = null;
let Sender: string = '0x2567d98ad32168293b4da76f5a00c1662345181a762895d955a76d19cfb916f6';
async function processEvents() {
  console.log('processEvents', Package);
    unsubscribe = await provider.subscribeEvent({        
        filter: {
          //Sender: Sender
          MoveEventType: `${OrigPackage}::pay::KNSVoucherReceived`
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