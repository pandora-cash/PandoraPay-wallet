// Import Vue
import Vue from 'vue';
import App from './app';

import store from "../store/store";
import router from "../router/router.index"

import VueClipboard from 'vue-clipboard2'
import Notification from 'vue-notification';
import VTooltip from 'v-tooltip'

Vue.use(VTooltip);
Vue.use(Notification);
Vue.use(VueClipboard);

import Consensus from "src/consensus/consensus"

export default (params)=> {

    const app = new Vue({
        el: '#app',
        store,
        router,
        render: (createElement) => {

            const app = createElement(App, {
                props: {
                    startAutomatically: params.startAutomatically,
                }
            });

            return app;

        }
    }).$mount('#app');

    window.PandoraWallet = app;
    window.PandoraConsensus = Consensus;

}
