import _Vue from "vue";
import App from "./App.vue";
/**
 * @author: tangyu
 * @Date: 2020-08-12 15:15:26
 * @description: install提供全局注册方式
 * @param {type}
 * @return {type}
 */

App.install = (Vue) => {
  if (!Vue) {
    window.Vue = Vue = _Vue;
  }
  Vue.component(App.name, App);
};

export default App;
