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

export default {
  name: 'test',
  data() {
    return {
      one: 'one',
      two: 'two'

    }
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
  left: 0;
  right: 0;
  background-color: red;
  p {
    background: white;
  }
}
</style>