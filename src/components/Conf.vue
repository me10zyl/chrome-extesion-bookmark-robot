<template>
  <div style="margin-bottom: 20px">
    <el-switch v-model="enableAutoClassify"></el-switch> 启用同文件夹自动分类
  </div>
</template>

<script>
    export default {
        name: "Conf",
        watch : {
          enableAutoClassify : function(){
            chrome.runtime.sendMessage({enableAutoClassify: this.enableAutoClassify}, function(response) {
              if(response) {
                console.log(response.farewell);
              }
            });
            localStorage['enableAutoClassify'] = this.enableAutoClassify
          }
        },
        data(){
          return {
            enableAutoClassify : false
          }
        },
        created() {
          console.log('mounted')
          if('enableAutoClassify' in localStorage){
            this.$set(this, 'enableAutoClassify',JSON.parse(localStorage['enableAutoClassify']))
            console.log('set this.enableAutoClassify=' + this.enableAutoClassify)

          }
        }
    }
</script>

<style scoped>

</style>
