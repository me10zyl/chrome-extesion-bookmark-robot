<template>
  <div>
    Domain Map:
    <el-tree :data="domainTree" :props="defaultProps" style="user-select : none" @node-click="handleNodeClick"></el-tree>
  </div>
</template>

<script>

  import * as bm from "../js/bookmark"

  export default {
    name: "Tree",
    data(){
      return{
        domainTree : [],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    },
    methods:{
      handleNodeClick : function(node){
        console.log(node)
        if(node.url){
          window.open(node.url)
        }
      }
    },
    mounted() {
      (async ()=> {
        let domain_map = {}
        await bm.get_domain_map(domain_map)
        for(let key in domain_map){
          this.domainTree.push({
            label : key + "(" + domain_map[key].length + ")",
            children : domain_map[key].map(d=>{return {label:d.title, url: d.url}})
          })
        }
        this.domainTree.sort((a,b)=>{
          return b.children.length - a.children.length
        })
        //console.log(domain_map)
      })()
    }
  }


</script>

<style scoped>

</style>
