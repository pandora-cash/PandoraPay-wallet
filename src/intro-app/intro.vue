<template>
  <div>

    <main class="main">

      <div class="row flex-center min-vh-100 py-6 text-center">
        <div class="col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
          <div>
            <div>
              <img :src="require(`src/assets/logo-square${dark?'-inv':''}.png`).default" class="logo" :alt="name">

              <div class="text-center">
                <svg width="200px" height="200px" viewBox="0 0 33 33">
                  <polygon class="triangle" fill="none" stroke="#fff" stroke-width="1" points="16,1 32,32 1,32"/>
                </svg>
              </div>

              <h1 class="text-center">{{ name.toUpperCase() }}</h1>

              <div class="loading-text-div">
                <alert-box v-if="error" type="error">{{ error }}</alert-box>
                <span v-else class="loading-text">
                <i v-if="isDownloading" class="fas fa-spinner fa-spin"></i>
                {{ progressStatus }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </main>

  </div>
</template>

<script>

import consts from "consts/consts"
import AlertBox from "src/components/utils/alert-box"
import WasmWebworkerIntegration from './wasm-webworker-integration'

export default {

  components: {AlertBox},

  data() {
    return {
      progressStatus: "Initialized",
      isDownloading: false,
      error: "",
      dark: false,
    }
  },

  props: {
    options: {default: null},
  },

  computed: {
    name() {
      return consts.name
    }
  },

  mounted() {

    if (typeof window === "undefined") return;

    if (typeof localStorage !== "undefined" && !localStorage.getItem('dark'))
      localStorage.setItem('dark', this.options.intro.defaultTheme)

    if (typeof localStorage !== "undefined" && localStorage.getItem('dark') === 'true') {
      document.getElementsByTagName("html")[0].classList.add('dark');
      this.dark = true
    }

    if (this.options.intro.startAutomatically) return this.start()

  },

  methods: {

    async start() {

      try {

        this.isDownloading = true;

        const wasmMainSri = global.SRI_WASM_MAIN || ''
        const wasmMainFileSize = global.SIZE_WASM_MAIN || 0

        const integration = new WasmWebworkerIntegration("PandoraPay", this.options.resPrefix + "wasm/pandora-main.wasm?" + wasmMainSri, wasmMainSri, wasmMainFileSize, consts.goArgv, this.options.resPrefix + "workers/pandora-webworker-wasm.js", (status) => {
          console.log("Main status:", status)
          this.progressStatus = status
        }, async () => {

          await PandoraPay.helpers.helloPandora()
          this.progressStatus = "WASM is working!"

          if (this.options.intro.loadWasmHelper) {
            let helperPromiseResolved = false
            global.PandoraPayHelperPromise = new Promise((resolver) => {

              //for debugging only
              //return resolver(true)

              global.PandoraPayHelperLoader = async () => {

                if (helperPromiseResolved) return //already resolved
                helperPromiseResolved = true

                const wasmHelperSri = global.SRI_WASM_HELPER || ''
                const wasmHelperFileSize = global.SIZE_WASM_HELPER || 0

                const integrationHelper = new WasmWebworkerIntegration("PandoraPayHelper", this.options.resPrefix + "wasm/pandora-helper.wasm?" + wasmHelperSri, wasmHelperSri, wasmHelperFileSize, consts.goArgv, this.options.resPrefix + "workers/pandora-webworker-wasm.js", (status) => {
                  console.log("Helper status:", status)
                }, async () => {

                  let promiseDecoderResolve, promiseDecoderReject
                  global.PandoraPayHelper.decoderPromise = new Promise((resolve, reject) => {
                    promiseDecoderResolve = resolve
                    promiseDecoderReject = reject
                  })

                  await PandoraPayHelper.helloPandoraHelper()
                  console.log("Helper WASM is working")

                  resolver(true)

                  const balanceDecrypterTableSize = Number.parseInt(localStorage.getItem('balanceDecrypterTableSize') || '18');

                  const promise = PandoraPayHelper.wallet.initializeBalanceDecrypter(MyTextEncode(JSONStringify({tableSize: 1 << balanceDecrypterTableSize})), status => {
                    if (PandoraPayHelper.balanceDecoderCallback) PandoraPayHelper.balanceDecoderCallback(status)
                  })

                  promise
                      .then(answ => promiseDecoderResolve(answ))
                      .catch(err => promiseDecoderReject(err))

                  await promise
                })


                const data = await integrationHelper.downloadWasm(status => console.log("helper:", status))
                await integrationHelper.createWorker()
                integrationHelper.initialize(data)
              }

            })


          }

          await PandoraPayWallet.loadApp()

        })

        const data = await integration.downloadWasm(status => this.progressStatus = status)

        this.progressStatus = "Web Worker created"
        await integration.createWorker()

        this.progressStatus = "WASM instantiating..."
        integration.initialize(data)

      } catch (err) {
        this.error = err.toString()
      }

    }
  },

  //based on https://codepen.io/alexrmota/pen/NWqwGyJ

}
</script>

<style scoped>

h1 {
  font-size: 30px;
  padding-top: 20px;
  color: #16b6dc;
}

.logo {
  max-width: 55px;
  position: absolute;
  margin-top: 100px;
  margin-left: -30px;
}

.dark .logo {
  -webkit-filter: drop-shadow(0px 0px 20px rgba(255, 255, 255, 1));
  filter: drop-shadow(0px 0px 20px rgba(255, 255, 255, 1));
}

.loading-text-div {
  text-align: center;
  margin-top: 20px
}

.loading-text {
  font-family: sans-serif;
  font-size: 12px;
  animation: blink .9s ease-in-out infinite;
}

.dark .loading-text {
  -webkit-filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.5));
  filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.5));
}

.triangle {
  stroke: #0EB4DB;
  stroke-dasharray: 17;
  animation: dash 2.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) infinite;
}

.dark .logo {
}

@keyframes dash {
  to {
    stroke-dashoffset: 136;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

</style>
