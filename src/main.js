import Vue from "nativescript-vue";
import App from "./components/App";
import VueDevtools from "nativescript-vue-devtools";
import ImageZoomPlugin from "@happones/nativescript-image-zoom/vue";

if (TNS_ENV !== "production") {
  Vue.use(VueDevtools);
}
import store from "./store";

require("nativescript-local-notifications");
Vue.use(ImageZoomPlugin);
Vue.registerElement(
  "PullToRefresh",
  () => require("@nstudio/nativescript-pulltorefresh").PullToRefresh
);

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = TNS_ENV === "production";

new Vue({
  store,
  render: (h) => h("frame", [h(App)]),
}).$start();
