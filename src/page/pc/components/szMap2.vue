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
                trainIcon: `path://M678.4 122.9c75.1-11.3 145.5 11.7 202.6 65.8 58 54.9 85.7 127.4 77.9 203.3-7.9 75-48.8 149-117.8 214.4-19.3 18.3-71 67.5-145.1 138.2-33.3 31.8-68.9 65.7-104.6 99.8l-34.8 33.1-13.8 13.2c-16.6 15.8-43 15.8-59.6 0L363.1 775.9l-25.4-24.2c-50.9-48.5-101.9-97-152.8-145.4C116 541 75 466.9 67.1 391.8c-7.9-76 19.9-148.3 77.9-203.3 57.1-54.1 127.6-77.1 202.6-65.8 55.8 8.5 112.3 35.4 165.4 78.5 53.2-43 109.7-70 165.4-78.3z`
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
                            legend: {
                            orient: 'vertical',
                            top: 30,
                            left: 30,
                            data: linesData.map(v => v.name),
                            textStyle: {
                                color: '#222222'
                            },
                            selectedMode: 'multiple'
                        },
                        bmap: { 
                        center: [114.06455183658751, 22.548456637984177],
                        roam: true,
                        mapStyle: {
                            styleJson:  style
                        }
                        },
                        series: []
                    })
                    this.bmap = this.chart.getModel().getComponent('bmap').getBMap()
                    this.bmap.setMinZoom(12) // 设置地图最小缩放比例
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