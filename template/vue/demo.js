import Vue from "vue";
import App from "./main";

Vue.config.productionTip = false;
new Vue({
  render: (h) => h(App),
}).$mount("#app");
