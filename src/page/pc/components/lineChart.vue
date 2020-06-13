<template>
    <div
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        id="lineChart"
    >

    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/line'
    import _ from 'lodash'

    let color = [
        "#0090FF",
        "#36CE9E",
        "#FFC005",
        "#FF515A",
        "#8B5CFF",
        "#00CA69"
    ];

    const hexToRgba = (hex, opacity) => {
        let rgbaColor = "";
        let reg = /^#[\da-f]{6}$/i;
        if (reg.test(hex)) {
            rgbaColor = `rgba(${parseInt("0x" + hex.slice(1, 3))},${parseInt(
        "0x" + hex.slice(3, 5)
        )},${parseInt("0x" + hex.slice(5, 7))},${opacity})`;
        }
        return rgbaColor;
    }

    const cityArr = [{
        name: '深圳市',
        key: 'city',
        showName: '深圳',
        show: true,
        data: [],
    }, {
        name: '北京市',
        key: 'province',
        showName: '北京',
        show: true,
        data: [],
    }, {
        name: '上海市',
        key: 'province',
        showName: '上海',
        data: [],
    },{
        name: '武汉市',
        key: 'city',
        showName: '武汉',
        data: [],
    }, {
        name: '广州市',
        key: 'city',
        showName: '广州',
        data: [],
    }]

    export default {
        name: 'LineChart',
        data() {
            return {
                loading: true,
            }
        },
        methods: {
            initChart() {
                const series = cityArr.map((d, i) => ({
                        name: d.showName,
                        type: 'line',
                        data: d.data,
                        smooth: true,
                        showSymbol: false,
                        lineStyle: {
                            normal: {
                                color: color[i],
                                shadowBlur: 3,
                                shadowColor: hexToRgba(color[i], 0.5),
                                shadowOffsetY: 8
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                        0,0,0,1,
                                        [{
                                                offset: 0,
                                                color: hexToRgba(color[i], 0.3)
                                            },
                                            {
                                                offset: 1,
                                                color: hexToRgba(color[i], 0.1)
                                            }
                                        ],
                                        false
                                    ),
                                    shadowColor: hexToRgba(color[i], 0.1),
                                    shadowBlur: 10
                            }
                        }
                }));
                const legend = cityArr.map((d, i) => ({
                    name: d.showName,
                    textStyle: {
                        color: color[i]
                    }
                }));
                const selected = cityArr.reduce((obj, d) => {
                    obj[d.showName] = (d.show || false);
                    return obj;
                }, {});
                const option = {
                    color,
                    tooltip: {
                        trigger: 'axis',
                    },
                    grid: {
                        bottom: 50,
                    },
                    xAxis: [{
                        type: 'category',
                        axisLine: {
                            show: true
                        },
                        splitArea: {
                            color: '#f00',
                            lineStyle: {
                                color: '#f00'
                            },
                        },
                        axisLabel: {
                            color: '#fff'
                        },
                        splitLine: {
                            show: false
                        },
                        boundaryGap: false,
                        data: [],

                    }],
                    yAxis: [{
                        type: 'value',
                        min: 0,
                        splitNumber: 4,
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: 'rgba(255,255,255,0.1)'
                            }
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                    }],
                    legend: {
                        data: legend,
                        selected,
                    },
                    dataZoom: [{
                        type: 'slider',
                        backgroundColor: 'rgba(31, 108, 117, .1)',
                        fillerColor: 'rgba(18, 38, 106, .6)',
                        height: 15,
                        bottom: 5,
                        left: 'center',
                        borderColor: 'rgba(18, 38, 106, .5)',
                        handleIcon: 'image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTkxOTQ4OTgzMzYzIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjMwMDAwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTUxMiAwYTUxMiA1MTIgMCAxIDAgNTEyIDUxMkE1MTIgNTEyIDAgMCAwIDUxMiAweiBtLTQ0LjQ4IDY1NmE0NC40OCA0NC40OCAwIDEgMS04OS4xMiAwVjM2OGE0NC40OCA0NC40OCAwIDEgMSA4OS4xMiAwdjI4OHogbTE3OC4wOCAwYTQ0LjQ4IDQ0LjQ4IDAgMSAxLTg5LjEyIDBWMzY4YTQ0LjQ4IDQ0LjQ4IDAgMSAxIDg5LjEyIDB2Mjg4eiIgZmlsbD0iIzFlM2ZmYSIgcC1pZD0iMzAwMDEiPjwvcGF0aD48L3N2Zz4=',
                        showDetail: false,
                    }],
                    series,
                };

                this.myChart = echarts.init(document.getElementById('lineChart'));
                this.myChart.setOption(option)
            },
            updateChart() {
                const sortByTime = _.sortBy(cityArr, d => d.data.length);
                const timeArr = sortByTime[0].data.map(d => d.date);
                const option = this.myChart.getOption();
                option.xAxis[0].data = timeArr;
                cityArr.forEach((d, i) => {
                    option.series[i].data = d.data.map((d1, i) => {
                        if (i === 0) {
                            return d1.confirmed;
                        }
                        return d1.confirmed - d.data[i-1].confirmed
                    });
                })
                this.myChart.setOption(option);
            },
            getData() {
                fetch('https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Wuhan-2019-nCoV.json')
                    .then(res =>res.json())
                    .then(res => {
                        _.chain(cityArr)
                            .forIn(d => {
                                let data = [];
                                const { key, name } = d;
                                if (key === 'city') {
                                    data = res.filter(d1 => d1.city === name)
                                } else {
                                    data = res.filter(d1 => d1.province === name && !d1.city)
                                }
                                d.data = data;
                            })
                            .value();
                        this.loading = false
                        this.updateChart()
                    });
            }
        },
        mounted() {
            this.initChart();
            this.getData();
        },
    }
</script>

<style lang="less" scoped>
    #lineChart{
        height: 100%;
        width: 100%;
    }
</style>