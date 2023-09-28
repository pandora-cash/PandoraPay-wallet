<template>
  <layout>

    <layout-title icon="fas fa-wrench" title="Settings">
      Configure your web wallet for a better experience.
    </layout-title>

    <div class="card overflow-hidden">
      <div class="card-header card-header audience-chart-header p-0 bg-light scrollbar-overlay ">
        <ul class="nav nav-tabs border-0 chart-tab flex-nowrap">

          <li class="nav-item" role="presentation" @click="tab='ui'">
            <a :class="`nav-link mb-0 ${tab === 'ui' ? 'active' : ''}`">
              <div class="audience-tab-item p-2 pe-4 cursor-pointer">
                <h6 class="text-800 fs--2 text-nowrap">UI</h6>
                <h5 class="text-800 align-middle">
                  <i class="fas fa-sliders"></i>
                  UI Settings
                </h5>
              </div>
            </a>
          </li>

          <li class="nav-item" role="presentation" @click="tab='balanceDecrypter'">
            <a :class="`nav-link mb-0 ${tab === 'balanceDecrypter' ? 'active' : ''}`">
              <div class="audience-tab-item p-2 pe-4 cursor-pointer">
                <h6 class="text-800 fs--2 text-nowrap">Balance Decrypter</h6>
                <h5 class="text-800 align-middle">
                  <i class="fas fa-laptop-code"></i>
                  Decrypter
                </h5>
              </div>
            </a>
          </li>

          <li class="nav-item" role="presentation" @click="tab='expert'">
            <a :class="`nav-link mb-0 ${tab === 'expert' ? 'active' : ''}`">
              <div class="audience-tab-item p-2 pe-4 cursor-pointer">
                <h6 class="text-800 fs--2 text-nowrap">Expert</h6>
                <h5 class="text-800 align-middle">
                  <i class="fas fa-cogs"></i>
                  Expert settings
                </h5>
              </div>
            </a>
          </li>

        </ul>
      </div>
      <div class="card-body">
        <div class="tab-content">

          <div :class="`tab-pane ${tab === 'ui' ? 'active' : ''}`">
            <div class="row pt-2">
              <div class="col-12 col-sm-6">

                <div class="form-check" v-if="setupEnabled">
                  <input class="form-check-input" id="setupShow" type="checkbox" v-model="setupShow"/>
                  <label class="form-check-label" for="setupShow">Show Setup form</label>
                </div>

              </div>
            </div>
          </div>

          <div :class="`tab-pane ${tab === 'balanceDecrypter' ? 'active' : ''}`">
            <div class="row pt-2">
              <div class="col-12 col-sm-6">
                <label>Precomputed Table size: {{ balanceDecrypterTableSize }}
                  <i class="fas fa-question ms-1" v-tooltip.bottom="'Balance Decrypter Precomputed Init Table'"/>
                </label> <br/>
                <label>Scanner Performance: {{ balanceDecrypterPerformance[balanceDecrypterTableSize] }}/s
                  <i class="fas fa-question ms-1"
                     v-tooltip.bottom="'Balance Decrypter performance using this precomputed table'"/> </label>
                <input class="form-range" type="range" min="16" max="22" v-model="balanceDecrypterTableSize"/>
                <small :class="`fw-semi-bold rounded-pill badge-soft-${balanceDecrypterTableSize >= 20 ? 'danger' : 'warning'} p-1`">
                  <i class="fas fa-exclamation-triangle"/> High will require
                  {{ $strings.formatMilliseconds(balanceDecrypterTime[balanceDecrypterTableSize] * 1000) }} initialize
                  (bootstrap) time.
                </small>
              </div>
            </div>
          </div>

          <div :class="`tab-pane ${tab === 'expert' ? 'active' : ''}`">
            <div class="row pt-2">
              <div class="col-12 col-sm-6">
                <div class="form-check">
                  <input class="form-check-input" id="legacyNonHardening" type="checkbox" v-model="legacyNonHardening"/>
                  <label class="form-check-label" for="legacyNonHardening">Legacy Non Hardening</label>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div class="card-footer bg-light py-2">

        <alert-box v-if="error" class="w-100" type="error" :dismissible-timeout="10000" :dismissible-text="error" @onDismissible="error=''">
          {{ error }}
        </alert-box>
        <alert-box v-if="status" class="w-100" type="success" :dismissible-timeout="10000" :dismissible-text="status" @onDismissible="status=''">
          {{ status }}
        </alert-box>
        <alert-box v-if="info" class="w-100" type="info" :dismissible-timeout="10000" :dismissible-text="info" @onDismissible="status=''">
          {{info}}
        </alert-box>

        <div class="float-end">
          <loading-button text="Save settings" :submit="handleSave" icon="fas fa-save"/>
        </div>

      </div>
    </div>

  </layout>
</template>

<script>
import Layout from "src/components/layout/layout"
import LayoutTitle from "src/components/layout/layout-title";
import LoadingButton from "../../components/utils/loading-button";
import AlertBox from "src/components/utils/alert-box"

export default {

  components: {LoadingButton, Layout, LayoutTitle, AlertBox},

  data() {
    return {
      error: "",
      status: "",
      info: "",
      balanceDecrypterTableSize: 18,
      tab: "balanceDecrypter",
      legacyNonHardening: false,
      setupEnabled: PandoraPayWalletOptions.setup.enabled,
      setupShow: localStorage.getItem('setupSkipSetupNextTime') !== 'true',
    }
  },

  computed: {
    balanceDecrypterTime() {
      return {
        16: 8,
        17: 12,
        18: 30,
        19: 50,
        20: 120,
        21: 200,
        22: 600,
      }
    },
    balanceDecrypterPerformance() {
      return {
        16: 125,
        17: 250,
        18: 500,
        19: 1000,
        20: 2000,
        21: 4000,
        22: 8500,
      }
    }
  },

  methods: {

    handleSave() {
      this.status = ""

      if (this.tab === 'ui'){

        if (this.setupEnabled){
          localStorage.setItem('setupSkipSetupNextTime', this.setupShow === false )
          this.status = "Setup changed table stored"
        }

      }else if (this.tab === 'balanceDecrypter'){

        this.$store.commit('setBalanceDecrypterTableSize', this.balanceDecrypterTableSize)
        this.status = "Balance Decrypter table stored"

      }else if (this.tab === 'expert'){

        PandoraPay.wallet.manager.setWalletNonHardening(this.legacyNonHardening)
        this.status = "Wallet non hardening stored"

      }

      this.info = "Restart is required to have an effect"

    },

  },

  mounted() {
    this.balanceDecrypterTableSize = this.$store.state.settings.balanceDecrypterTableSize
  }

}
</script>