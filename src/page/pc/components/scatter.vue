<template>
    <div :id="id" class="scatterChart"></div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import _ from 'lodash';
    import 'echarts/lib/chart/scatter'
    import { scaleLinear } from 'd3'
    
    export default {
        name: 'Scatter',
        props: ['data', 'id', 'extent'],
        methods: {
            initMap() {
                const useData = _.chain(this.data)
                    .map(d => [d.time, d.addCount])
                    .reverse()
                    .chunk(3)
                    .map(d => {
                        return [`${d[0][0]}-${_.last(d)[0]}`, _.sumBy(d, d1 => d1[1])] 
                    })
                    .value();

                const scale = scaleLinear()
                    .domain(this.extent)
                    .range([2, 20])

                const option = {
                    singleAxis: {
                        height: 0,
                        left: 25,
                        top: 20,
                        type: 'category',
                        boundaryGap: true,
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
                        confine: true,
                        formatter: ({data}) => {
                            return `${data[0]}<br />新增确诊人数：${data[1]}`
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