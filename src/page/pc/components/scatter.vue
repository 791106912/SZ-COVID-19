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
                    .map(d => [d.time, d.count])
                    .reverse()

                const scale = scaleLinear()
                    .domain(this.extent)
                    .range([2, 15])

                const option = {
                    singleAxis: {
                        height: 0,
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
                                 type: 'dashed',
                                 color: 'yellow'
                            },
                        }
                    },
                    series: {
                        singleAxisIndex: 0,
                        coordinateSystem: 'singleAxis',
                        type: 'scatter',
                        data: useData,
                        symbolSize:  function(dataItem) {
                            return scale(dataItem[1])
                        }
                    }
                };
                const myChart = echarts.init(document.getElementById(this.id));
                myChart.setOption(option);
            }
        },
        mounted() {
            this.initMap();
        }
    }
</script>

<style lang="less" scoped>
    .scatterChart{
        height: 40px;
        width: 600px;
    }
</style>