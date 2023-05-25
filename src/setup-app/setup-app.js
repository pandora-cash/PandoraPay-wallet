import * as Vue from 'vue'
import Setup from './setup';

export default (options) => {

    const app = window.PandoraPayWalletSetup = Vue.createApp({
        render() {
            return Vue.h(Setup, {
                options,
            });
        }
    });

    app.mount(options.intro.appId)

    return app
}
