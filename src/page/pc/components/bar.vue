<template>
    <div id="bar-chart">

    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/bar'

    export default {
        name: 'Bar',
        methods: {
            initChart() {
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
                    backgroundColor: 'rgb(20,28,52)',
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
                        data: ['大米', '玉米', '蔬菜', '鸡蛋', '坚果']
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
                        data: [50000000, 22000000, 10000000, 5000000, 2000000]
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
                            barWidth: 20,
                            data: [50000000, 22000000, 10000000, 5000000, 2000000]
                        },
                        {
                            name: '背景',
                            type: 'bar',
                            barWidth: 20,
                            barGap: '-100%',
                            data: [50000000, 50000000, 50000000, 50000000, 50000000],
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
        height: 200px;
    }
</style>