<template>
  <div>
    Tree
  </div>
</template>

<script>

  import * as bm from "../js/bookmark"

  export default {
    name: "Tree",
    mounted() {
      (async ()=> {
        let domain_map = {}
        bm.get_domain_map(domain_map)
        console.log(domain_map)
      })()
    }
  }


</script>

<style scoped>

</style>
