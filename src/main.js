import JSONParse from 'src/utils/custom-json/json-parse'
import  JSONStringify from 'src/utils/custom-json/json-stringify'
import Decimal from "decimal.js";

class Main {

    constructor(){

        const decoder = new TextDecoder("utf-8")
        const encoder = new TextEncoder("utf-8")

        global.MyTextDecode = a => a ? decoder.decode(a) : null
        global.MyTextEncode = a => a ? encoder.encode(a) : null

        global.JSONStringify = JSONStringify
        global.JSONParse = JSONParse

        global.Buffer = Buffer
        global.Decimal = Decimal
        global.Decimal_0 = new Decimal(0)
        global.Decimal_1 = new Decimal(1)
        global.Decimal_2 = new Decimal(2)
        global.Decimal_10 = new Decimal(10)

        window.addEventListener("load", () => {
            this.initialize()
        } );

    }

    initialize(){

        if (typeof PandoraPayWalletOptions === "undefined") global.PandoraPayWalletOptions = {}

        global.FILES_VERSIONING = FILES_VERSIONING
        global.SRI_WEB_WORKER_WASM = SRI_WEB_WORKER_WASM
        global.SRI_WASM_MAIN = SRI_WASM_MAIN
        global.SIZE_WASM_MAIN = SIZE_WASM_MAIN
        global.SRI_WASM_HELPER = SRI_WASM_HELPER
        global.SIZE_WASM_HELPER = SIZE_WASM_HELPER

        const options = PandoraPayWalletOptions

        if (!options.router) options.router = {}
        if (typeof options.resPrefix === "undefined") options.resPrefix = '/'
        if (typeof options.compression === "undefined") options.compression = ""

        options.wallet = {
            appId: '#wallet',
            startAutomatically: true,
            ...(options.wallet||{}),
        }

        options.setup = {
            appId: "#wallet",
            enabled: false,
            ...(options.setup||{})
        }

        options.intro = {
            appId: '#wallet',
            startAutomatically: true,
            defaultTheme: 'true',
            loadWasmHelper: true,
            ...(options.intro||{}),
        }

        this.options = options

        /**
         * On Window Load
         */

        return this.start()

    }

    async start(){
        if (this.options.setup.enabled )
            this.setupAppVue = require('./setup-app/setup-app').default(this.options);
        else
            return this.showIntro()
    }

    async showIntro(){
        this.introAppVue = require('./intro-app/intro-app').default(this.options);
    }

    async loadApp(){

        if (this.introAppVue) {
            this.introAppVue.unmount()
            document.getElementById(this.options.intro.appId.slice(1)).textContent = ""
        }

        this.walletAppVue = await require('./app/main-vue').default(this.options);
    }

}

const main = new Main();

if ( typeof window !== 'undefined')
    window.PandoraPayWallet = main;

export default main;
