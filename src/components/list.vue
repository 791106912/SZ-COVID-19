<template>
    <el-table
        :data="data"
    >
        <el-table-column
            prop="date"
            label="日期"
            width="180">
        </el-table-column>
        <el-table-column
            prop="name"
            label="姓名"
            width="180">
        </el-table-column>
        <el-table-column
            prop="address"
            label="地址">
        </el-table-column>
    </el-table>
</template>

<script>
    export default {
        name: 'List',
        props: ['data'],
    }
</script>

<style lang="less">
    .el-table{
        background-color: rgba(0, 0, 0, 0);
        color: green !important;
        thead{
            color: green !important;
        }
        tr{
            background-color: rgba(0, 0, 0, 0) !important;
            th{
                background-color: rgba(0, 0, 0, 0) !important;
                border-bottom: solid 1px green !important;
            }
            td{
                border-bottom: solid 1px green !important;
            }
            &:hover{
                td{
                    background-color: rgba(0, 0, 0, 0) !important;
                }
                
            }
        }
        &::before{
            content: none;
        }
    }
</style>