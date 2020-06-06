<template>
    <div ref="map" class="map"></div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/extension/bmap/bmap'
    import style from '@/data/mapStyle2'
    import ComJSON from '@/data/community';

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
                initMap () { 
                    const communityData = this.initCommunity();
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
                        },]
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