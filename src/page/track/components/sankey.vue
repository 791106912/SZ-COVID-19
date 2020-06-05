<template>
    <div id="sankey">

    </div>
</template>

<script>
    import _ from 'lodash'
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/sankey'
    import TrackJSON from '@/data/track'

    const DIM = ['age_range', 'xb', 'tran', 'origin', 'fbrq']

    const ITEM_STYLE = {
        xb: {
            '男': {
                color: '#3a7ba5',
            },
            '女': {
                color: '#9d4da7',
            },
        }
    }

    export default {
        name: 'SanKey',
        methods: {
            getNodes(data) {
                return DIM.reduce((arr, key) => {
                    const styles = ITEM_STYLE[key] || {}
                    const tempArr =  _.chain(data)
                        .map(d => {
                            return {
                                name: d[key],
                                itemStyle: styles[d[key]],
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
                    data.forEach(d1 => {
                        const source = d1[d]
                        const target = d1[arr[i + 1]]
                const value = data.filter(d2 => d2[d] === source && d2[arr[i + 1]] === target).length
                        links.push({
                            source,
                            target,
                            value,
                        })
                    })
                })
                
                return _.uniqWith(links, _.isEqual)
            },
            initData() {
                const data = _.chain(TrackJSON)
                    // .slice(0, 400)
                    .map(d => {
                        const {track, nl} = d
                        const tran = track.length ? track[track.length - 1].tran : ''
                        const age_left = +nl - (nl % 5)
                        const age_range = `${age_left}岁-${age_left + 5}岁`
                        return _.pick({
                            ...d,
                            tran: tran || '不明',
                            age_range,
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
                        left: 10,
                        right: 50,
                        nodeGap: 6,
                        data: nodes, // 节点
                        links: links, // 节点之间的连线
                        draggable: false,
                        focusNodeAdjacency: "allEdges", // 鼠标划上时高亮的节点和连线，allEdges表示鼠标划到节点上点亮节点上的连线及连线对应的节点
                        label: {
                            fontSize: 10,
                            color: "#666"
                        },
                        lineStyle: {
                            color: 'source',
                            curveness: 0.5
                        },
                    }
                };

                const myChart = echarts.init(document.getElementById('sankey'), 'light');
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
        height: 600px;
    }
</style>