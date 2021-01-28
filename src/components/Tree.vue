<template>
  <div>
    <el-row>
      <el-col>
      Domain Map:
      </el-col>
      <el-col :span="12">
        <el-input
          placeholder="input title or url"
          v-model="filterText">
        </el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-tree node-key="id" ref="tree" :filter-node-method="filterNode" class="filter-tree" :data="domainTree" :props="defaultProps"
               style="user-select : none" @node-click="handleNodeClick"></el-tree>
    </el-row>
  </div>
</template>

<script>

  import * as bm from "../js/bookmark"
  import utils from "../js/utils"

  export default {
    name: "Tree",
    watch: {
      filterText(val) {
        //console.log(this.$refs)
        this.$refs.tree.filter(val);
        if(!val){
          console.log('blank.collapse all')
          let nodes = this.$refs.tree.store._getAllNodes();
          console.log(nodes)
          this.$nextTick(()=>{
            for(let i in nodes){
              nodes[i].expanded=false;
            }
          })

        }
      }
    },
    data() {
      return {
        filterText: '',
        domainTree: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    },
    methods: {
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1 || (data.url && data.url.indexOf(value) !== -1);
      },
      handleNodeClick: function (node) {
        //console.log(node)
        if (node.url) {
          window.open(node.url)
        }
      }
    },
    mounted() {
      (async () => {
        let domain_map = {}
        await bm.get_domain_map(domain_map)
        for (let key in domain_map) {
          this.domainTree.push({
            id : utils.uuid(),
            label: key + "(" + domain_map[key].length + ")",
            children: domain_map[key].map(d => {
              return {  id : utils.uuid(), label: d.title, url: d.url}
            })
          })
        }
        this.domainTree.sort((a, b) => {
          return b.children.length - a.children.length
        })
        //console.log(domain_map)
      })()
    }
  }


</script>

<style scoped>

</style>
