<template>
    <div id="sankey">

    </div>
</template>

<script>
    import _ from 'lodash'
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/sankey'
    import TrackJSON from '@/data/track'
    // import { scaleLinear } from 'd3'


    const DIM = ['age_range', 'xb','fbrq','origin', 'tran', ]

    const ITEM_STYLE = {
        xb(){
            return {
                '男': {
                    color: '#3a7ba5',
                },
                '女': {
                    color: '#9d4da7',
                },
            }
        }
    }

    const TRAN_ORDER = {
        '私家/专车': 0,
        '出租车': 1,
        '3A109航船': 2,
        '深圳湾口岸': 3,
        '航空': 4,
        '不明': 5,
    }

    const SORT_FUN = {
        'age_range': data => {
            return _.orderBy(data, 'name')
        },
        'fbrq': data => {
            return data
        },
        'origin': data => {
            return data.sort(a => COUNTRY.indexOf(a.name) !== -1 ? 1 : -1)
        },
        'tran': data => {
            return _.orderBy(data, d => TRAN_ORDER[d.name])
        }
    }

    const COUNTRY = ["巴西", "法国", "柬埔寨", "澳门", "荷兰",
        "菲律宾", "俄罗斯", "新加坡", "西班牙", "瑞士", "泰国",
        "英国", "美国"]

    // const scale = scaleLinear()
    //     .domain([1, 200])
    //     .range(['#87cc7c', '#966d4b','#935740', '#69277e', '#9d4da7'])

    export default {
        name: 'SanKey',
        methods: {
            getNodes(data) {
                return DIM.reduce((arr, key) => {
                    const styles = ITEM_STYLE[key] && ITEM_STYLE[key]() || {}
                    let tempArr =  _.chain(data)
                        .map(d => {
                            return {
                                name: d[key],
                                itemStyle: styles[d[key]],
                            }
                        })
                        .uniqBy('name')
                        .value()
                        tempArr = SORT_FUN[key] ? SORT_FUN[key](tempArr) : tempArr
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
                        const value = data.filter(d2 => d2[d] === source
                            && d2[arr[i + 1]] === target
                            ).length
                        links.push({
                            source,
                            target,
                            value,
                            lineStyle: {
                                // color: scale(value),
                            },
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
                        let tran = track.length ? track[track.length - 1].tran : ''
                        tran = tran.indexOf('航班') !== -1 ? '航空' : tran
                        tran = /(私家)|(自驾)|(专车)|(商务车)/.test(tran) ? '私家/专车' : tran
                        tran = /(的士)|(出租车)/.test(tran) ? '出租车' : tran
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
                    color: ['#87cc7c', '#966d4b', '#935740', '#69277e', '#9d4da7'],
                    tooltip: {
                        trigger: "item",
                        triggerOn: "mousemove"
                    },
                    series: {
                        type: "sankey",
                        left: 10,
                        right: 50,
                        nodeGap: 1,
                        layoutIterations: 0,
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