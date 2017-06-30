<template>
  <div id="test">
    <div> </div>
    <ul>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
const two = 'two'
console.log(Vue)

export default {
  name: 'test',
  data() {
    return {
      one: 'one',




    two}
  },
  methods: {
    going() {
      return () => {
      }
    }
  }
}
</script>

<style lang="less">
#test {
  position: relative;
  right: 0;
  left: 0;
        background-color: red;
  p {
    background: white;
  }
}
</style>