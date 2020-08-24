<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <div>这是传入的标题-{{title}}</div>
    <HelloWorld msg="这是测试啊看看你对不" />
  </div>
</template>

<script>
import HelloWorld from "./component/HelloWorld.vue";
export default {
  props: ['title'],
  name: "ceshi-component",
  data: () => {
      return {
          img: require('./assets/logo.png')
      }
  },
  components: {
    HelloWorld,
  },
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  background: rgba(0, 0, 0, 0.1);
}
</style>