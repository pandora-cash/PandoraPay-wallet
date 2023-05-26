<template>
  <main class="main">

    <div class="row flex-center min-vh-100 py-6 text-center">
      <div class="col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
        <div class="d-flex flex-center mb-4">
          <img :src="require(`src/assets/logo-square${dark?'-inv':''}.png`).default" class="logo" :alt="name" width="128">
        </div>
        <div class="card">
          <div class="card-body p-4 p-sm-5">

            <h5 class="mt-0 mb-0">{{name}} wallet setup</h5>
            <small>configure your wallet before accessing the network.</small>

            <form class="mt-4 row g-0 mx-sm-4" style="text-align: left">

              <div class="form-check">
                <input class="form-check-input" type="radio" id="connect-tor" value="tor" v-model="connectionProxyType">
                <label class="form-label" for="connect-tor">Connect using Tor</label>
              </div>

              <div class="form-check">
                <input class="form-check-input" type="radio" id="connect-i2p" value="i2p" v-model="connectionProxyType">
                <label class="form-label" for="connect-i2p">Connect using I2P</label>
              </div>

              <div class="form-check">
                <input class="form-check-input" type="radio" id="connect-proxy" value="proxy" v-model="connectionProxyType">
                <label class="form-label" for="connect-proxy">Connect using custom proxy</label>
              </div>

              <input v-if="connectionProxyType==='proxy'" class="form-control mb-2" type="text" placeholder="custom proxy" aria-label="Custom proxy" aria-describedby="custom-proxy" v-model="connectionProxyAddress">

              <div class="form-check">
                <input class="form-check-input" type="radio" id="connect-no-proxy" value="no-proxy" v-model="connectionProxyType">
                <label class="form-label" for="connect-no-proxy">no proxy</label>
              </div>

              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="hide-setup-next-time" v-model="skipSetupNextTime">
                <label class="form-label" for="hide-setup-next-time">skip this menu next time</label>
              </div>

            </form>

            <button class="btn btn-primary px-3 mt-2 cursor-pointer" type="button" @click="submit">OK</button>

          </div>
        </div>
      </div>
    </div>

  </main>
</template>

<script>
import consts from "../../consts/consts";

export default {

  data(){
    return{
      dark: false,
      connectionProxyType:"no-proxy",
      connectionProxyAddress: "",
      skipSetupNextTime: false,
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

    if (typeof localStorage !== "undefined"){

      if (!localStorage.getItem('dark'))
        localStorage.setItem('dark', this.options.intro.defaultTheme)

      if ( localStorage.getItem('dark') === 'true') {
        document.getElementsByTagName("html")[0].classList.add('dark');
        this.dark = true
      }

      this.connectionProxyType = localStorage.getItem('setupConnectionProxyType') || "no-proxy"
      this.connectionProxyAddress = localStorage.getItem('setupConnectionProxyAddress') || ""
      this.skipSetupNextTime = localStorage.getItem('setupSkipSetupNextTime') === 'true'

    }

    if (this.skipSetupNextTime) return this.submit()

  },

  methods:{
    submit(){

      if (this.options.setup.resultCb){

        const data = {
          connectionProxyType: this.connectionProxyType,
          connectionProxyAddress: this.connectionProxyAddress,
          skipSetupNextTime: this.skipSetupNextTime,
        }

        this.options.setup.resultCb(data)

      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem('setupConnectionProxyType', this.connectionProxyType)
        localStorage.setItem('setupConnectionProxyAddress', this.connectionProxyAddress)
        localStorage.setItem('setupSkipSetupNextTime', this.skipSetupNextTime)
      }

      return PandoraPayWallet.showIntro()

    },
  },

}
</script>