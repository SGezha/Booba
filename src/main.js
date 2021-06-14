import Vue from 'nativescript-vue'
import App from './components/App'
import VueDevtools from 'nativescript-vue-devtools'
import WebViewExt from '@nota/nativescript-webview-ext/vue'


if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
import store from './store'

require ("nativescript-local-notifications");

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start()
