<template>
    <div :id="id" class="scatterChart"></div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/scatter'
    import { scaleLinear } from 'd3'
    
    export default {
        name: 'Scatter',
        props: ['data', 'id', 'extent'],
        methods: {
            initMap() {
                const useData = this.data
                    .map(d => [d.time, d.addCount])
                    .reverse()

                const scale = scaleLinear()
                    .domain(this.extent)
                    .range([2, 15])

                const option = {
                    singleAxis: {
                        height: 0,
                        left: 5,
                        top: 20,
                        type: 'category',
                        boundaryGap: false,
                        data: useData.map(d => d[0]),
                        axisLabel: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        splitLine: {
                            show: false  
                        },
                        axisLine: {
                            lineStyle: {
                                 type: 'dotted',
                                 color: 'gray'
                            },
                        }
                    },
                    tooltip: {
                        formatter: ({data}) => {
                            return `2020年${data[0]}<br />新增确诊人数：${data[1]}`
                        },
                        backgroundColor: 'rgba(32, 57, 112, .7)'
                    },
                    series: {
                        singleAxisIndex: 0,
                        coordinateSystem: 'singleAxis',
                        type: 'scatter',
                        data: useData,
                        symbolSize:  function(dataItem) {
                            return dataItem[1] ? scale(dataItem[1]) : 0
                        },
                        itemStyle: {
                            normal: {
                                color: '#c23e32'
                            }
                        }
                    }
                };
                const myChart = echarts.init(document.getElementById(this.id));
                myChart.setOption(option);
            }
        },
        mounted() {
            setTimeout(this.initMap)
        }
    }
</script>

<style lang="less" scoped>
    .scatterChart{
        height: 40px;
        width: 100%;
    }
</style>