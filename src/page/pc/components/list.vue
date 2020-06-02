<template>
    <el-table
        :data="data"
    >
        <el-table-column
            prop="name"
            label="地区"
        />
        <el-table-column
            prop="now"
            label="现有确诊"
        />
        <el-table-column
            prop="acc"
            label="累计确诊"
        />
        <el-table-column
            prop="crue"
            label="治愈"
        />
        <el-table-column
            prop="death"
            label="死亡"
        />
        <el-table-column
            width="600px"
            prop="chart"
            label="趋势"
        />
    </el-table>
</template>

<script>
    import _ from 'lodash'
    import PartJSON from '@/data/part'
    import Scatter from './scatter'
    import { extent } from 'd3'

    export default {
        name: 'List',
        data() {
            return {
                data: []
            }
        },
        methods: {
            initData() {
                const nameObj = {
                    ns: '南山',
                    gm: '光明',
                    dp: '大鹏',
                    ft: '福田',
                    lg: '龙岗',
                    yt: '盐田',
                    ba: '宝安',
                    ps: '坪山',
                    qt: '其他',
                    lh_u: '罗湖', 
                    lh_ua: '龙华',
                }

                const final = _.chain(nameObj)
                    .keys()
                    .reduce((obj, d) => {
                        const dataArr = PartJSON.map(d1 => {
                            return {
                                count: Number(d1[d]),
                                time: d1.jzrq,
                            }
                        });
                        obj[d] = {
                            name: nameObj[d],
                            data: dataArr,
                            id: d,
                            acc: dataArr[0].count
                        }
                        return obj;
                    }, {})
                    .values()
                    .value();

                const dataArr = final
                    .map(d => d.data)
                    .flat()
                    .map(d => d.count);

                _.forIn(final, d => {
                    d.chart = <Scatter
                        data={d.data}
                        extent = {extent(dataArr)}
                        id={d.id}
                    />
                });
                    
                this.data = final
            }
        },
        mounted() {
            this.initData()
        }
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
                border: none !important;
            }
            td{
                border: none !important;
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