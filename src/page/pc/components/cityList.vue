<template>
    <div>
        <el-table
            :data="data"
        >
            <el-table-column
                prop="name"
                label="地名"
            />
            <el-table-column
                prop="now"
                label="现有"
                sortable
            />
            <el-table-column
                prop="acc"
                label="累计"
                sortable
            />
        </el-table>
    </div>
</template>

<script>
    export default {
        name: 'CityList',
        props: ['data']
    }
</script>

<style lang="scss" scoped>

</style>