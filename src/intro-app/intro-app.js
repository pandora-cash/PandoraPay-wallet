import * as Vue from 'vue'
import Intro from './intro';


export default (options) => {

    const app = window.PandoraPayWalletIntro = Vue.createApp({
        render() {
            return Vue.h( Intro, {
                options,
            });
        }
    });

    app.mount(options.intro.appId)

    return app
}
