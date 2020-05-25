<template>
    <el-menu
        :default-active="activeIndex"
        class="vis-menu"
        mode="horizontal"
        @select="handleSelect"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
    >
        <el-menu-item
            v-for="item in menu"
            :index="item.comName"
            :key="item.comName"
        >
            <span v-text="item.name"></span>
        </el-menu-item>
    </el-menu>
</template>

<style lang="less" scoped>
    .vis-menu{
        background: red;
    }
</style>

<script>
    import menu from '@/config/menu'

    export default {
        name: 'Nav',
        data() {
            return {
                activeIndex: 'pc',
                menu: menu,
            };
        },
        methods: {
            handleSelect(key, keyPath) {
                console.log(key, keyPath);
            }
        }
    };
</script>