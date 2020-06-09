<template>
    <div ref="map" class="map"></div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/extension/bmap/bmap'
    import style from '@/data/mapStyle2'
    import ComJSON from '@/data/community';
    import OutPJSON from '@/data/outpatient'
    import { yiyuanStr, matouStr, addLocation, huocheStr, feijiStr} from './../data'

    export default {
            name: 'SzMap',
            data () {
                return {
                    chart: echarts.ECharts,
                    bmap: {},
                    linesSeries: [],
                    scatterSeries: [],
                    effectScatterSeries: [],
                    mapZoom: 6,
                }
            },
            mounted () {
                this.initMap()
            },
            methods: {
                initCommunity(){
                    return ComJSON
                        .map(d => ({
                            name: d.name,
                            value: d.coord.concat(5),
                        }))
                },
                initOutpatient() {
                    return OutPJSON.map(d => ({
                        name: d.ORGAN_NAME,
                        value: [d.latitude1, d.longitude1, 100]
                    }))
                },
                initAddLocation(data) {
                    return data.map(d => ({
                        name: d.name,
                        value: d.coord.concat(8),
                    }))
                },
                initMap () { 
                    const communityData = this.initCommunity();
                    const outpatientData = this.initOutpatient();
                    this.chart = echarts.init(this.$refs.map)
                    this.chart.setOption({
                        animation: false,
                        bmap: { 
                            center: [114.06455183658751, 22.598456637984177],
                            zoom: 12,
                            roam: true,
                            mapStyle: {
                                styleJson:  style
                            }
                        },
                        tooltip : {
                            trigger: 'item',
                            formatter: d => {
                                let final = '';
                                switch (d.seriesName) {
                                    case '码头':
                                    case '火车站':
                                    case '机场':
                                        final = `
                                                ${d.marker}${d.name}<br />
                                                客流量: &nbsp;&nbsp;&nbsp;<br />
                                                核酸检测人数: &nbsp;&nbsp;&nbsp;<br />
                                                发现疑似病例: &nbsp;&nbsp;&nbsp;
                                            `
                                        break;
                                    case '确诊病例小区': 
                                        final = `
                                            ${d.seriesName}<br />
                                            ${d.marker}${d.name}
                                        `
                                        break;
                                    case '发热门诊': 
                                        final = `
                                                ${d.marker}${d.name}<br />
                                                累计接诊: &nbsp;&nbsp;&nbsp;<br />
                                                出院人数: &nbsp;&nbsp;&nbsp;<br />
                                                现有病例: &nbsp;&nbsp;&nbsp;
                                            `
                                        break;
                                    default:
                                        break;
                                }
                                return final;
                            }
                        },
                        legend: {
                            orient: 'vertical',
                            y: 'bottom',
                            x: 'right',
                            data: ['确诊病例小区', '发热门诊', '码头', '火车站', '机场'],
                            textStyle: {
                                color: '#fff'
                            },
                            itemHeight: 14,
                            itemWidth : 14,
                        },
                        series: [{
                            name: '确诊病例小区',
                            type: 'effectScatter',
                            coordinateSystem: 'bmap',
                            symbolSize: d => d[2],
                            data: communityData,
                            showEffectOn: 'render',
                            rippleEffect: {
                                brushType: 'stroke'
                            },
                            hoverAnimation: true,
                            zlevel: 1,
                            itemStyle: {
                                // color: 'blue',
                                shadowBlur: 0,
                            },
                        }, {
                            name: '发热门诊',
                            type: 'scatter',
                            coordinateSystem: 'bmap',
                            data: outpatientData,
                            symbolSize: 12,
                            symbol: yiyuanStr,
                            zlevel: 1,
                        }, {
                            name: '码头',
                            type: 'scatter',
                            coordinateSystem: 'bmap',
                            data: this.initAddLocation(addLocation.filter(d => d.type==="码头")),
                            symbolSize: 13,
                            symbol: matouStr,
                            zlevel: 2,
                            tooltip: {
                                formatter: a => {
                                    console.log(a);
                                    return  a.seriesName + '<br />' + a.marker + a.name
                                }
                            },
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: true,
                                    color: 'gray',
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                        }, {
                            name: '火车站',
                            type: 'scatter',
                            coordinateSystem: 'bmap',
                            data: this.initAddLocation(addLocation.filter(d => d.type==="火车站")),
                            symbolSize: 13,
                            symbol: huocheStr,
                            zlevel: 2,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: true,
                                    color: 'gray',
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                        }, {
                            name: '机场',
                            type: 'scatter',
                            coordinateSystem: 'bmap',
                            data: this.initAddLocation(addLocation.filter(d => d.type==="机场")),
                            symbolSize: 13,
                            symbol: feijiStr,
                            zlevel: 2,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: true,
                                    color: 'gray',
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                        }
                        ]
                    })
                    this.bmap = this.chart.getModel().getComponent('bmap').getBMap()
                    this.bmap.setMinZoom(10) // 设置地图最小缩放比例
                    this.bmap.setMaxZoom(15) // 设置地图最大缩放比例
                },
            }
        }
</script>

<style lang="less" scoped>
    .map{
        width: 80%;
    }
</style>