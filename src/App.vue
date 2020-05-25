<template>
    <el-container>
        <el-header>
            <Nav></Nav>
        </el-header>
        <el-main>
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import Nav from './components/Nav'

export default {
  name: 'App',
  components: {
    Nav
  }
}
</script>

<style lang="less" scoped>
    .el-header{
        position: fixed;
        top: 0;
        width: 100%;
    }
    .el-main{
        height: calc(100vh - 60px) ;
        margin-top: 60px;
        border: solid 1px red;
    }
</style>