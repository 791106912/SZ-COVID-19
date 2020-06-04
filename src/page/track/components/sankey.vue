<template>
    <div id="sankey">

    </div>
</template>

<script>
    import _ from 'lodash'
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/sankey'
    import TrackJSON from '@/data/track'

    const DIM = ['xb', 'tran', 'fbrq']

    export default {
        name: 'SanKey',
        methods: {
            getNodes(data, itemStyle) {
                return DIM.reduce((arr, key) => {
                    const count = _.countBy(data, key)
                    const tempArr =  _.chain(data)
                        .map(d => {
                            const value = count[d[key]]
                            return {
                                name: d[key],
                                itemStyle,
                                value,
                            }
                        })
                        .uniqBy('name')
                        .value()
                    return arr.concat(tempArr)
                }, [])
            },
            getLinks(data) {
                const links = [];
                DIM.forEach((d, i, arr) => {
                    if (i === arr.length - 1) return
                    const count = _.countBy(data, arr[i + 1])
                    data.forEach(d1 => {
                const value = count[d1[arr[i + 1]]]
                        links.push({
                            source: d1[d],
                            target: d1[arr[i + 1]],
                            value,
                        })
                    })
                })
                return links
            },
            initData() {
                const data = _.chain(TrackJSON)
                    // .slice(0, 100)
                    .map(d => {
                        const {track} = d
                        const tran = track.length ? track[track.length - 1].tran : ''
                        return _.pick({
                            ...d,
                            tran: tran || '不明'
                        },
                        DIM
                        )
                    })
                    .value()
                
                const nodes = this.getNodes(data)
                const links = this.getLinks(data)
                return {nodes, links}
            },
            initChart() {
                const { nodes, links } = this.initData()
                
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
                        // layoutIterations: 0, // 自动优化列表，尽量减少线的交叉，为0就是按照数据排列
                        data: nodes, // 节点
                        links: links, // 节点之间的连线
                        draggable: true,
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
                        // levels: [{
                        //         depth: 0,
                        //         itemStyle: {
                        //             color: "#F27E7E"
                        //         },
                        //         lineStyle: {
                        //             color: "source",
                        //             opacity: 0.2
                        //         }
                        //     },
                        //     {
                        //         depth: 1,
                        //         lineStyle: {
                        //             color: "source",
                        //             opacity: 0.2
                        //         }
                        //     },
                        //     {
                        //         depth: 2,
                        //         lineStyle: {
                        //             color: "source",
                        //             opacity: 0.2
                        //         }
                        //     },
                        //     {
                        //         depth: 3,
                        //         label: {
                        //             fontSize: 12
                        //         }
                        //     }
                        // ],
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
            setTimeout(this.initChart);
        }
    }
</script>

<style lang="less" scoped>
    #sankey{
        height: 500px;
    }
</style>