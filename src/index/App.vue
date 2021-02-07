<template>
  <div>
    <Conf></Conf>
    <Tree></Tree>
  </div>
</template>

<script>
import Tree from "../components/Tree.vue";
import Conf from "../components/Conf.vue";

export default {
  components: {Conf, Tree},
  data() {
    return {

    }
  },
  mounted() {
    if(!localStorage['bm-robot-1st']) {
      this.$alert('使用前请先备份书签！开启自动分类将自动将同文件夹的书签放置到同一域名文件夹下 - Backup first!Toggle autoclassify will cause putting same domain bookmark into a directory.')
    }
    localStorage['bm-robot-1st'] = new Date() + ""
  }
}
</script>

<style lang="stylus">
</style>
