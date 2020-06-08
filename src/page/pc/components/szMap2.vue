<template>
    <div ref="map" class="map"></div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/extension/bmap/bmap'
    import style from '@/data/mapStyle2'
    import ComJSON from '@/data/community';
    import OutPJSON from '@/data/outpatient'
    import { yiyuanStr, matouStr } from './../data'

    const addLocation = [{
        name: '深圳湾口岸',
        coord: ['113.944533', '22.499256'],
    }]

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
                            value: d.coord.concat(8),
                        }))
                },
                initOutpatient() {
                    return OutPJSON.map(d => ({
                        name: d.ORGAN_NAME,
                        value: [d.latitude1, d.longitude1, 100]
                    }))
                },
                initAddLocation() {
                    return addLocation.map(d => ({
                        name: d.name,
                        value: d.coord.concat(8),
                    }))
                },
                initMap () { 
                    const communityData = this.initCommunity();
                    const outpatientData = this.initOutpatient();
                    const addLocationData = this.initAddLocation();
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
                            formatter: function(a){
                                return  a.seriesName + '<br />' + a.marker + a.name
                            }
                        },
                        legend: {
                            orient: 'vertical',
                            y: 'bottom',
                            x: 'right',
                            data: ['确诊病例小区', '发热门诊'],
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
                                normal: {
                                    shadowBlur: 0,
                                }
                            },
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: false,
                                    color: '#c03636',
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                        }, {
                            name: '发热门诊',
                            type: 'scatter',
                            coordinateSystem: 'bmap',
                            data: outpatientData,
                            symbolSize: 12,
                            symbol: yiyuanStr,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: false,
                                    color: '#37A2DA',
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                        }, {
                            name: '码头',
                            type: 'scatter',
                            coordinateSystem: 'bmap',
                            data: addLocationData,
                            symbolSize: 10,
                            symbol: matouStr,
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