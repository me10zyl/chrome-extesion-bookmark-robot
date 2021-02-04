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
          }
        },
        data(){
          return {
            enableAutoClassify : false
          }
        }
    }
</script>

<style scoped>

</style>
