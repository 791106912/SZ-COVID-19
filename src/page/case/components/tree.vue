<template>
<div class="container">
    <div id="tree-chart" :class="{'invisible': isHidden}">

    </div>
    <NoData title="请选择病例关系" :class="{'d-none': !isHidden}" />
    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/tree'
    import 'echarts/lib/component/tooltip'
    import NoData from '@/components/noData'

    export default {
        name: 'Tree',
        props: ['data'],
        components: {NoData},
        data() {
            return {
                isHidden: true
            }
        },
        methods: {
            initChart() {
                var option = {
                    tooltip: {
                        trigger: 'item',
                        triggerOn: 'mousemove'
                    },
                    series:[
                        {
                            name: '病例号',
                            type: 'tree',

                            data: [this.data],

                            left: '2%',
                            right: '2%',
                            // top: '8%',
                            // bottom: '20%',

                            symbol: 'circle',

                            orient: 'vertical',

                            expandAndCollapse: true,
                            // symbol: 'circle',
                            symbolSize: 20,

                            lineStyle: {
                                curveness: 1,
                                // color: 'rgba(255, 0, 0, .45)',
                            },

                            itemStyle: {
                                color: 'rgba(255, 0, 0, .45)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 1)',
                            },

                            label: {
                                position: 'inside',
                                rotate: 0,
                                verticalAlign: 'middle',
                                align: 'center',
                                fontSize: 9,
                                color: '#fff',
                            },

                            leaves: {
                                label: {
                                    position: 'bottom',
                                    rotate: 0,
                                    verticalAlign: 'middle',
                                    align: 'center',
                                    color: '#fff',
                                    distance: 10,
                                }
                            },

                            animationDurationUpdate: 750,

                            tooltip: {
                                // formatter: '病例号：{b0}'
                                formatter: d => {
                                    let name = d.data.name.split('(')[0];
                                    return '病例号：' + name;
                                }
                            }
                        }
                    ]
                }

                this.myChart = echarts.init(document.getElementById('tree-chart'));

                this.myChart.setOption(option)
            }
        },
        watch: {
            data(newdata) {
                this.isHidden = !newdata.children
                this.myChart.resize()
                const options = this.myChart.getOption();
                options.series[0].data = [newdata];
                this.myChart.setOption(options)
            }
        },
        mounted() {
            this.initChart();
        }
    }
</script>

<style lang="less" scoped>
    .container {
        height: 100%;
        position: relative;
    }
    #tree-chart{
        height: 100%;
    }
    .noData {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }
    .invisible {
        opacity: 0;
    }
    .d-none {
        display: none;
    }
</style>