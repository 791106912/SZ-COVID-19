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


    const DIM = ['age_range', 'xb','period','origin', 'tran', ]

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
            return _.orderBy(data, d => {
                switch(d.name) {
                    case '婴幼儿/青少年(0~15)': return 0
                    case '青年(16~30)': return 1
                    case '中青年(30~45)': return 2
                    case '中年(45~60)': return 3
                    case '老年(>60)': return 4
                }
            })
        },
        'origin': data => {
            return data.sort(a => COUNTRY.indexOf(a.name) !== -1 ? 1 : -1)
        },
        'tran': data => {
            return _.orderBy(data, d => TRAN_ORDER[d.name])
        },
        'period': data => {
            return _.orderBy(data, d => {
                switch(d.name) {
                    case '疫情初期(~1/23)': return 0
                    case '发展期(1/23~2/6)': return 1
                    case '国内二次传播期(2/6~2/20)': return 2
                    case '国外输入期(2/20~)': return 3
                }
            })
        }
    }

    const COUNTRY = ["巴西", "法国", "柬埔寨", "澳门", "荷兰",
        "菲律宾", "俄罗斯", "新加坡", "西班牙", "瑞士", "泰国",
        "英国", "美国"]

    const getAgeCategory = age => {
        if (age >= 0 && age <= 15) {
            return '婴幼儿/青少年(0~15)'
        }
        if (age > 15 && age <= 30) {
            return '青年(16~30)'
        }
        if (age > 30 && age <= 45) {
            return '中青年(30~45)'
        }
        if (age > 45 && age <= 60) {
            return '中年(45~60)'
        }
        if (age > 60) {
            return '老年(>60)'
        }
    }

    const ChinaPeriod = ['2020/1/23', '2020/2/6', '2020/2/20']
        .map(d => new Date(d).getTime())

    const getPeriod = date => {
        const newDate = new Date(date).getTime()
        if (newDate <= ChinaPeriod[0]) {
            return '疫情初期(~1/23)'
        }
        if (newDate > ChinaPeriod[0] && newDate < ChinaPeriod[1]) {
            return '发展期(1/23~2/6)'
        }
        if (newDate > ChinaPeriod[1] && newDate < ChinaPeriod[2]) {
            return '国内二次传播期(2/6~2/20)'
        }
        if (newDate >= ChinaPeriod[2]) {
            return '国外输入期(2/20~)'
        }
        
    }

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
                    .filter(d => d.track.length)
                    .map(d => {
                        const {track, nl} = d
                        let tran = track.length ? track[track.length - 1].tran : ''
                        tran = tran.indexOf('航班') !== -1 ? '航空' : tran
                        tran = /(私家)|(自驾)|(专车)|(商务车)/.test(tran) ? '私家/专车' : tran
                        tran = /(的士)|(出租车)/.test(tran) ? '出租车' : tran
                        const age_range = getAgeCategory(+nl)
                        return _.pick({
                            ...d,
                            tran: tran || '不明',
                            age_range,
                            period: getPeriod(d.track[d.track.length - 1].time)
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
                            color: "rgba(255,255,255,.8)"
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