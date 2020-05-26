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
        padding: 0;
    }
    .el-main{
        height: calc(100vh) ;
        padding-top: 60px;
        background: radial-gradient(circle at 50% 200px, #185160, #011026);
    }
</style>