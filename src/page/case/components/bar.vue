<template>
    <div id="barChart">
    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/bar'
    import 'echarts/lib/chart/pictorialBar'
    import 'echarts/lib/component/axis'
    import 'echarts/lib/component/tooltip'
    import women from '@/assets/woman1.png'
    import men from '@/assets/man1.png'
    import womenBg from '@/assets/womanBg1.png'
    import menBg from '@/assets/manBg1.png'
    import TrackJSON from '@/data/track' 
    import _ from 'lodash' 

    export default {
        name: 'Bar',
        methods: {
            initData() {
                const data = _.chain(TrackJSON)
                    .reduce((obj, d) => {
                        const key =`${d.nlRange}_${d.xb}`;
                        obj[key] = {
                            sex: d.xb,
                            nlRange: d.nlRange,
                            count: obj[key] ? obj[key].count + 1 : 1,
                        }
                        return obj;
                    }, {})
                    .values()
                    .value();
                const menData = data
                    .filter(d => d.sex === '男');
                const womanData = data
                    .filter(d => d.sex === '女')
                womanData.forEach(d => d.count = 0 - d.count);
                return [menData, womanData];
            },
            calcualteLabel() {
                return _.chain(TrackJSON)
                    .map('nlRange')
                    .uniq()
                    .sort((b, a) => {
                        const arr = [a, b].map(d1 => Number(d1.split('~')[0]));
                        return arr[0] - arr[1];
                    })
                    .value();
            },
            initChart() {
                const symbleSize = 16;
                const [manData, womanData] = this.initData();
                const labelData = this.calcualteLabel();
                const manCount = labelData.map(d => {
                    return manData
                        .find(d1 => d1.nlRange === d)
                        .count
                })
                const womanCount = labelData.map(d => {
                    return womanData
                        .find(d1 => d1.nlRange === d)
                        .count
                })
                const option = {
                    xAxis: [{
                        type: 'value',
                        gridIndex: 0,
                        axisTick:{show: false},
                        axisLabel : {show: false},
                        axisLine: { show: false},
                        splitLine: {
                            show: false
                        }
                    }, {
                        type: 'value',
                        gridIndex: 1,
                        axisTick:{show: false}, //是否显示刻度
                        axisLine: {show: false},
                        axisLabel : {show: false},
                        splitLine: {show: false}
                    }],
                    yAxis: [{
                            type: 'category',
                            gridIndex: 0,
                            inverse: true,
                            data: labelData,
                            axisTick:{show:false},
                            axisLabel : {show:false},
                            axisLine: {show: false}
                        },{
                            type: 'category',
                            gridIndex: 1,
                            inverse: true,
                            data: labelData,
                            axisTick:{show:false},
                            axisLine: {show: false},
                            axisLabel: {
                                color: 'red',
                                align: 'center',
                                margin: 40,
                            }
                        }
                    ],
                    tooltip: {
                        trigger: "item",
                         formatter: function(a){
                            return  a.marker + a.seriesName + '<br />' + 
                                    a.name + ': ' + Math.abs(a.value);
                        }
                    },
                    grid: [
                        {
                            width: '40%',
                            top: "0%",
                            bottom: "0%",
                            left: '5%',
                            gridIndex: 0,
                            containLabel: true
                        }, {
                            width: '50%',
                            left: '45%',
                            top: "0%",
                            bottom: "0%",
                            gridIndex: 1,
                            containLabel: true
                    }],
                    series: [
                        {
                            tooltip: {
                                show: false
                            },
                            z: 4,
                            gridIndex: 0,
                            type: "pictorialBar",
                            symbolSize: symbleSize,
                            symbolRepeat: "fixed",
                            data: womanCount.map(() => ({
                                value: -100,
                                symbol: 'image://'+womenBg
                            }))
                        },
                       {
                            z: 6,
                            name: '女性',
                            gridIndex: 0,
                            type: "pictorialBar",
                            symbolSize: symbleSize,
                            animation: true,
                            symbolRepeat: "fixed",
                            symbolClip: true,
                            symbolPosition: "start",
                            symbolOffset: [0, 0],
                            data: womanCount.map(d => ({
                                value: d,
                                symbol: 'image://'+women
                            })),
                        },
                        {
                            tooltip: {
                                show: false
                            },
                            z: 4,
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            type: "pictorialBar",
                            symbolSize: symbleSize,
                            symbolRepeat: "fixed",
                            data: manCount.map(() => ({
                                value: 100,
                                symbol: 'image://'+menBg
                            }))
                        },
                        {
                            z: 6,
                            name: '男性',
                            type: "pictorialBar",
                            symbolSize: symbleSize,
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            animation: true,
                            symbolRepeat: "fixed",
                            symbolClip: true,
                            symbolPosition: "start",
                            symbolOffset: [0, 0],
                            data: manCount.map(d => ({
                                value: d,
                                symbol: 'image://'+men
                            })),
                        },
                    ]
                };
                const myChart = echarts.init(document.getElementById('barChart'));

                myChart.setOption(option)
            }
        },
        mounted() {
            this.initChart();
        }
    }
</script>

<style lang="less" scoped>
    #barChart{
        margin-top: 20px;
        height: 300px;
        width: 100%;
    }
</style>