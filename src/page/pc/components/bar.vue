<template>
    <div id="bar-chart">

    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/bar'
    import _ from 'lodash'

    import WorldJSON from '@/data/worldTrend'

    export default {
        name: 'Bar',
        methods: {
            initData() {
                const data = _.chain(WorldJSON)
                    .map(d => (
                        [_.last(d.trend.list[0].data), d.name]
                    ))
                    .orderBy(d => d[0], 'desc')
                    .slice(0, 10)
                    .value()
                    
                const axisData = data.map(d => d[1])
                return { data, axisData }
            },
            initChart() {
                const { data, axisData } = this.initData()
                const maxValue = _.maxBy(data, d => d[0])
                const option = {
                    grid: {
                        left: '5%',
                        right: '5%',
                        bottom: '5%',
                        top: '10%',
                        containLabel: true
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'none'
                        },
                        formatter: function(params) {
                            return params[0].name + '<br/>' +
                                "<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:rgba(36,207,233,0.9)'></span>" +
                                params[0].seriesName + ' : ' + Number((params[0].value.toFixed(4) / 10000).toFixed(2)).toLocaleString() + ' 万元<br/>'
                        }
                    },
                    xAxis: {
                        show: false,
                        type: 'value'
                    },
                    yAxis: [{
                        type: 'category',
                        inverse: true,
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#fff'
                            },
                        },
                        splitLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        },
                        data: axisData
                    }, {
                        type: 'category',
                        inverse: true,
                        axisTick: 'none',
                        axisLine: 'none',
                        show: true,
                        axisLabel: {
                            textStyle: {
                                color: '#ffffff',
                                fontSize: '12'
                            },
                            formatter: function(value) {
                                if (value >= 10000) {
                                    return (value / 10000).toLocaleString() + '万';
                                } else {
                                    return value.toLocaleString();
                                }
                            },
                        },
                        data: data.map(d => d[0])
                    }],
                    series: [{
                            name: '金额',
                            type: 'bar',
                            zlevel: 1,
                            itemStyle: {
                                normal: {
                                    barBorderRadius: 30,
                                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                                        offset: 0,
                                        color: 'rgb(57,89,255,1)'
                                    }, {
                                        offset: 1,
                                        color: 'rgb(46,200,207,1)'
                                    }]),
                                },
                            },
                            barWidth: 10,
                            data,
                        },
                        {
                            name: '背景',
                            type: 'bar',
                            barWidth: 10,
                            barGap: '-100%',
                            data: new Array(10).fill(maxValue),
                            itemStyle: {
                                normal: {
                                    color: 'rgba(24,31,68,1)',
                                    barBorderRadius: 30,
                                }
                            },
                        },
                    ]
                };
                const myChart = echarts.init(document.getElementById('bar-chart'));

                myChart.setOption(option)
            }
        },
        mounted() {
            this.initChart()
        }
    }
</script>

<style lang="less" scoped>
    #bar-chart{
        height: 100%;
    }
</style>