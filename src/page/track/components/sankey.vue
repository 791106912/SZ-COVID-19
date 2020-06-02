<template>
    <div id="sankey">

    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/sankey'

    export default {
        name: 'SanKey',
        methods: {
            initChart() {
                const nodes = [{
                        name: "一层节点1",
                        itemStyle:{
                            color:"#6FA8F7"
                        }
                    },
                    {
                        name: "二层节点1",
                        itemStyle:{
                            color:"#5ECC8F"
                        }
                    },
                    {
                        name: "二层节点2",
                        itemStyle:{
                            color:"#FCC600"
                        }
                    },
                    {
                        name: "三层节点1",
                        itemStyle:{
                            color:"#00BCD4"
                        }
                    },
                    {
                        name: "三层节点2",
                        itemStyle:{
                            color:"#5B6DD1"
                        }
                    },
                    {
                        name: "四层节点1",
                        itemStyle:{
                            color:"#F27E7E"
                        }
                    },
                    {
                        name: "四层节点2",
                        itemStyle:{
                            color:"#93E1ED"
                        }
                    },
                    {
                        name: "四层节点3",
                        itemStyle:{
                            color:"#FFE056"
                        }
                    },
                    {
                        name: "四层节点4",
                        itemStyle:{
                            color:"#CB8762"
                        }
                    },
                    {
                        name: "四层节点5",
                        itemStyle:{
                            color:"#ADD76F"
                        }
                    },
                    {
                        name: "四层节点6",
                        itemStyle:{
                            color:"#6992C3"
                        }
                    },
                    {
                        name: "四层节点7",
                        itemStyle:{
                            color:"#897CBD"
                        }
                    },
                    {
                        name: "四层节点8",
                        itemStyle:{
                            color:"#F27EB2"
                        }
                    },
                    {
                        name: "四层节点9",
                        itemStyle:{
                            color:"#84D6B9"
                        }
                    },
                    {
                        name: "四层节点10",
                        itemStyle:{
                            color:"#AC78CD"
                        }
                    },
                ];
                const links = [{
                        source: "一层节点1",
                        target: "二层节点1",
                        value: 10
                    }, {
                        source: "一层节点1",
                        target: "二层节点2",
                        value: 10
                    },
                    {
                        source: "二层节点1",
                        target: "三层节点1",
                        value: 5
                    },
                    {
                        source: "二层节点1",
                        target: "三层节点2",
                        value: 5
                    },
                    {
                        source: "二层节点2",
                        target: "三层节点1",
                        value: 5
                    },
                    {
                        source: "二层节点2",
                        target: "三层节点2",
                        value: 5
                    },
                    {
                        source: "三层节点1",
                        target: "四层节点1",
                        value: 2
                    },
                    {
                        source: "三层节点1",
                        target: "四层节点2",
                        value: 2
                    },
                    {
                        source: "三层节点1",
                        target: "四层节点3",
                        value: 2
                    },
                    {
                        source: "三层节点1",
                        target: "四层节点4",
                        value: 2
                    },
                    {
                        source: "三层节点1",
                        target: "四层节点5",
                        value: 2
                    },
                    {
                        source: "三层节点2",
                        target: "四层节点6",
                        value: 2
                    },
                    {
                        source: "三层节点2",
                        target: "四层节点7",
                        value: 2
                    },
                    {
                        source: "三层节点2",
                        target: "四层节点8",
                        value: 2
                    },
                    {
                        source: "三层节点2",
                        target: "四层节点9",
                        value: 2
                    },
                    {
                        source: "三层节点2",
                        target: "四层节点10",
                        value: 2
                    },
                ];
                const option = {
                    tooltip: {
                        trigger: "item",
                        triggerOn: "mousemove"
                    },
                    series: {
                        type: "sankey",
                        layout: "none",
                        top: 50,
                        left: "3%",
                        right: "12%",
                        nodeGap: 14,
                        layoutIterations: 0, // 自动优化列表，尽量减少线的交叉，为0就是按照数据排列
                        data: nodes, // 节点
                        links: links, // 节点之间的连线
                        draggable: false,
                        focusNodeAdjacency: "allEdges", // 鼠标划上时高亮的节点和连线，allEdges表示鼠标划到节点上点亮节点上的连线及连线对应的节点
                        // tooltip: {
                        //   formatter: function(params) {
                        //     if (params.data.source) {
                        //       return `${params.data.source}：${params.data.value}`;
                        //     } else {
                        //       return `${params.name}：${params.value}`;
                        //     }
                        //   }
                        // },
                        levels: [{
                                depth: 0,
                                itemStyle: {
                                    color: "#F27E7E"
                                },
                                lineStyle: {
                                    color: "source",
                                    opacity: 0.2
                                }
                            },
                            {
                                depth: 1,
                                lineStyle: {
                                    color: "source",
                                    opacity: 0.2
                                }
                            },
                            {
                                depth: 2,
                                lineStyle: {
                                    color: "source",
                                    opacity: 0.2
                                }
                            },
                            {
                                depth: 3,
                                label: {
                                    fontSize: 12
                                }
                            }
                        ],
                        label: {
                            fontSize: 14,
                            color: "#666"
                        },
                        itemStyle: {
                            normal: {
                                borderWidth: 0
                            }
                        }
                    }
                };

                const myChart = echarts.init(document.getElementById('sankey'));

                myChart.setOption(option)
            }
        },
        mounted() {
            this.initChart();
        }
    }
</script>

<style lang="less" scoped>
    #sankey{
        height: 200px;
    }
</style>