import BaseConsensus from "./consensus-base";

const {client} = global.blockchain.sockets.client;
const {BasicSocket} = global.blockchain.sockets.basic;
const {Helper} = global.protocol.helpers;

const {NodeConsensusTypeEnum} = global.blockchain.sockets.schemas.types;
const {BigNumber} = global.protocol.utils;
const {MarshalData} = global.protocol.marshal;

const {Block} = global.blockchain.blockchain.block;

class Consensus extends BaseConsensus{

    constructor(settings) {

        super(settings);

        this._settings.address = "http://127.0.0.1:4006";

        this._data = {

            start: 0,
            end: 0,
            hash: Buffer.alloc(32),
            kernelHash: Buffer.alloc(32),
            prevHash: Buffer.alloc(32),
            prevKernelHash: Buffer.alloc(32),
            chainwork: BigNumber(0),

            blocksInfo:{

            },

            blocks: {

            },

            transactions : {

            },

        };

    }

    async _started(){

        const sock = client( this._settings.address, {

            reconnection: true,
            maxHttpBufferSize: global.apacache._scope.argv.networkSettings.networkMaxSize,
            query: {
                handshake: JSON.stringify({
                    short: global.apacache._scope.argv.settings.applicationShort,

                    build: global.apacache._scope.argv.settings.buildVersion,

                    net: {
                        type: global.apacache._scope.argv.settings.networkType,
                    },

                    address: '',
                    consensus: NodeConsensusTypeEnum.CONSENSUS_RPC
                })
            }
        });

        this._client = new BasicSocket( global.apacache._scope, this._settings.address, sock, undefined );

        [ "connect", "disconnect"  ].map( fct => this._client[fct] = sock[fct].bind( sock ) );
        [ "emit", "on","once" ].map( fct => this._client['_'+fct] = sock[fct].bind( sock ) );

        this._client.on("connect", ()=> this.status = "online" );
        this._client.on("disconnect", ()=> this.status = "offline" );

        this._client.once("handshake", handshake =>{

            console.log("handshake.short", handshake.short);

            if (handshake.short === global.apacache._scope.argv.settings.applicationShort) {
                this.status = "syncing";
                this._client.emit("ready!", "go!");
            }
            else
                this._client.close();
        });

        this._client.on("blockchain-protocol/new-block", this._processBlockchainNewBlock.bind(this) );

        this._client.on("connect", ()=>{

            this._client.emit("blockchain/get-info", undefined, this._processBlockchain.bind(this) );

        })

    }

    async _processBlockchainNewBlock(data) {

        await this._processBlockchainInfo(data);

    }

    async _processBlockchain(data){

        await this._processBlockchainInfo(data);

        this.status = "sync";

    }

    async _processBlockchainInfo(data){

        this._data.end = data.blocks;
        this._data.start = data.start;
        this._data.hash = data.hash;
        this._data.prevHash = data.prevHash;
        this._data.prevKernelHash = data.prevKernelHash;

        this._data.chainwork = MarshalData.decompressBigNumber( data.chainwork );

        this.emit('consensus/blockchain-info-updated', this._data );

        return this._downloadLastBlocksHashes();

    }

    async _downloadLastBlocksHashes(){

        const starting = this.starting;
        const ending =  this.ending-1;

        let i, done = false;
        for (i = ending; i >= starting && !done ; i-- ){

            let error = false, blockInfo;

            while (!error) {
                blockInfo = await this._client.emitAsync("blockchain/get-block-info", {index: i});
                if (blockInfo) error = true;
                await Helper.sleep(500);
            }
            blockInfo.hash = Buffer.from(blockInfo.hash);
            blockInfo.kernelHash = Buffer.from(blockInfo.kernelHash);

            if (!this._data.blocksInfo[i] || !this._data.blocksInfo[i].hash.equals(blockInfo.hash)){
                this._data.blocksInfo[i] = blockInfo;
                this.emit('consensus/block-info-downloaded', blockInfo );
            }else {
                if (this._data.blocksInfo[i] && this._data.blocksInfo[i].hash.equals( blockInfo.hash) )
                    done = true;

            }
        }

        return true;

    }

    async _stopped(){

    }

    async getBlocksDetails(startingHeight, endingHeight){

    }

    async getBlock(height){

        if (this._data.blocks[height])
            return this._data.blocks[height];

        if (height >= this._data.end) return;

        const blockData = await this._client.emitAsync("blockchain/get-block-by-height", {index: i, type: "buffer"}  );

        const block = new Block(global.apacache._scope, undefined, blockData);

        this._data.blocks[height] = block;

        return blockData;

    }

    async getBlockTransactions(height){

    }

    async getTransaction(txId){

    }


    get starting(){
        return this._starting || this._data.end - 15;
    }

    get ending(){
        return this._ending || this._data.end;
    }

}

export default new Consensus({});