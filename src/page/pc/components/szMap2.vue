<template>
    <div ref="map" class="map"></div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/extension/bmap/bmap'
    import style from '@/data/mapStyle2'

    const linesData = [];

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
                initMap () { 
                    this.chart = echarts.init(this.$refs.map)
                    this.chart.setOption({
                        animation: false,
                        bmap: { 
                            center: [114.06455183658751, 22.548456637984177],
                            zoom: 12,
                            roam: true,
                            mapStyle: {
                                styleJson:  style
                            }
                        },
                        series: []
                    })
                    this.bmap = this.chart.getModel().getComponent('bmap').getBMap()
                    this.bmap.setMinZoom(11) // 设置地图最小缩放比例
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