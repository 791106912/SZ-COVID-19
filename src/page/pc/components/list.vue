<template>
    <div class="table-container" ref="container">
        <el-table
            :data="data"
            :height="height"
        >
            <el-table-column
                prop="name"
                label="地区"
                min-width="15%"
            />
            <el-table-column
                prop="now"
                label="现有"
                min-width="15%"
            />
            <el-table-column
                prop="acc"
                label="累计"
                min-width="15%"
            />
            <el-table-column
                prop="chart"
                label="趋势"
                min-width="50%"
                class-name="scatter-chart"
            />
        </el-table>
    </div>
    
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
                data: [],
                height: 200,
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
                    lh_u: '罗湖', 
                    lh_ua: '龙华',
                    qt: '其他',
                }

                const final = _.chain(nameObj)
                    .keys()
                    .reduce((obj, d) => {
                        const dataArr = PartJSON.filter(d => d.jzsj === '24时')
                        .map((d1, i, arr) => {
                            const addCount = i === arr.length - 1
                                ? Number(d1[d])
                                : Number(d1[d]) - Number(arr[i + 1][d]);

                            return {
                                addCount,
                                count: Number(d1[d]),
                                time: d1.jzrq,
                            }
                        });
                        obj[d] = {
                            name: nameObj[d],
                            data: dataArr,
                            id: d,
                            acc: dataArr[0].count,
                            now: 0,
                        }
                        return obj;
                    }, {})
                    .values()
                    .value();

                const dataArr = final
                    .map(d => d.data)
                    .flat()
                    .map(d => d.addCount);
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
            this.$nextTick(() => {
                this.height = this.$refs.container.offsetHeight
            })
            this.initData()
        }
    }
</script>

<style lang="less">
    .table-container{
        height: 100%;
    }
    .el-table{
        background-color: rgba(0, 0, 0, 0);
        color: #869ea7 !important;
        .el-table__body-wrapper {
            // overflow: visible;
        }
        thead{
            color: #97c9ef !important;
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
        .scatter-chart {
            .cell {
                width: 100%;
                overflow: visible;
            }
        }
    }
</style>