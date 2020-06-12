<template>
    <div id="tree-chart">

    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/tree'

    export default {
        name: 'Tree',
        props: ['data'],
        methods: {
            initChart() {
                var option = {
                    tooltip: {
                        trigger: 'item',
                        triggerOn: 'mousemove'
                    },
                    series:[
                        {
                            type: 'tree',

                            data: [this.data],

                            left: '2%',
                            right: '2%',
                            top: '8%',
                            bottom: '20%',

                            symbol: 'emptyCircle',

                            orient: 'vertical',

                            expandAndCollapse: true,

                            label: {
                                position: 'top',
                                rotate: -90,
                                verticalAlign: 'middle',
                                align: 'right',
                                fontSize: 9
                            },

                            leaves: {
                                label: {
                                    position: 'bottom',
                                    rotate: -90,
                                    verticalAlign: 'middle',
                                    align: 'left'
                                }
                            },

                            animationDurationUpdate: 750
                        }
                    ]
                }

                this.myChart = echarts.init(document.getElementById('tree-chart'));

                this.myChart.setOption(option)
            }
        },
        watch: {
            data(newdata) {
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
    #tree-chart{
        height: 400px;
    }
</style>