<template>
    <div ref="map" class="map"></div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/extension/bmap/bmap'
    import style from '@/data/mapStyle2'
    import ComJSON from '@/data/community';
    import OutPJSON from '@/data/outpatient'

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
                initMap () { 
                    const communityData = this.initCommunity();
                    const outpatientData = this.initOutpatient()
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
                            symbolSize: 10,
                            symbol: 'image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTkxMTY3Njk3MTU0IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDExNTIgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjMxODIiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjI1IiBoZWlnaHQ9IjIwMCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj48L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNMTA4OCAxOTJIODMyVjY0YzAtMzUuNC0yOC42LTY0LTY0LTY0SDM4NGMtMzUuNCAwLTY0IDI4LjYtNjQgNjR2MTI4SDY0Yy0zNS40IDAtNjQgMjguNi02NCA2NHY3MzZjMCAxNy42IDE0LjQgMzIgMzIgMzJoMTA4OGMxNy42IDAgMzItMTQuNCAzMi0zMlYyNTZjMC0zNS40LTI4LjYtNjQtNjQtNjR6TTMyMCA4NzJjMCAxMy4yLTEwLjggMjQtMjQgMjRoLTgwYy0xMy4yIDAtMjQtMTAuOC0yNC0yNHYtODBjMC0xMy4yIDEwLjgtMjQgMjQtMjRoODBjMTMuMiAwIDI0IDEwLjggMjQgMjR2ODB6IG0wLTI1NmMwIDEzLjItMTAuOCAyNC0yNCAyNGgtODBjLTEzLjIgMC0yNC0xMC44LTI0LTI0di04MGMwLTEzLjIgMTAuOC0yNCAyNC0yNGg4MGMxMy4yIDAgMjQgMTAuOCAyNCAyNHY4MHogbTMyMCAyNTZjMCAxMy4yLTEwLjggMjQtMjQgMjRoLTgwYy0xMy4yIDAtMjQtMTAuOC0yNC0yNHYtODBjMC0xMy4yIDEwLjgtMjQgMjQtMjRoODBjMTMuMiAwIDI0IDEwLjggMjQgMjR2ODB6IG0wLTI1NmMwIDEzLjItMTAuOCAyNC0yNCAyNGgtODBjLTEzLjIgMC0yNC0xMC44LTI0LTI0di04MGMwLTEzLjIgMTAuOC0yNCAyNC0yNGg4MGMxMy4yIDAgMjQgMTAuOCAyNCAyNHY4MHogbTMyLTM0MGMwIDYuNi01LjQgMTItMTIgMTJoLTUydjUyYzAgNi42LTUuNCAxMi0xMiAxMmgtNDBjLTYuNiAwLTEyLTUuNC0xMi0xMnYtNTJoLTUyYy02LjYgMC0xMi01LjQtMTItMTJ2LTQwYzAtNi42IDUuNC0xMiAxMi0xMmg1MlYxNzJjMC02LjYgNS40LTEyIDEyLTEyaDQwYzYuNiAwIDEyIDUuNCAxMiAxMnY1Mmg1MmM2LjYgMCAxMiA1LjQgMTIgMTJ2NDB6IG0yODggNTk2YzAgMTMuMi0xMC44IDI0LTI0IDI0aC04MGMtMTMuMiAwLTI0LTEwLjgtMjQtMjR2LTgwYzAtMTMuMiAxMC44LTI0IDI0LTI0aDgwYzEzLjIgMCAyNCAxMC44IDI0IDI0djgweiBtMC0yNTZjMCAxMy4yLTEwLjggMjQtMjQgMjRoLTgwYy0xMy4yIDAtMjQtMTAuOC0yNC0yNHYtODBjMC0xMy4yIDEwLjgtMjQgMjQtMjRoODBjMTMuMiAwIDI0IDEwLjggMjQgMjR2ODB6IiBwLWlkPSIzMTgzIiBmaWxsPSIjMzdBMkRBIj48L3BhdGg+PC9zdmc+',
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