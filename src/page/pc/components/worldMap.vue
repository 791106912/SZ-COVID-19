<template>
    <div id="world-map">
        
    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/component/geo'
    import 'echarts/map/js/world.js';
    import { extent, scaleLog } from 'd3'
    import _ from 'lodash'
    import WorldLayout from '@/data/worldLayout'
    import WorldTrend from '@/data/worldTrend'
    import NationGeo from '@/data/nationGeo'

    export default {
        name: 'WorldMap',
        methods: {
            initMap() {
                const data = this.initWorldData()
                const dataExtent = extent(data, d => d[2])
                const scaleSize = scaleLog()
                    .domain(dataExtent)
                    .range([8, 30])
                const option = {
                    geo: {
                        map: 'world',
                        zoom: 1.2,
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        roam: false, //是否允许缩放
                        itemStyle: {
                            normal: {
                                color: 'rgba(51, 69, 89, .5)', //地图背景色
                                borderColor: '#516a89', //省市边界线00fcff 516a89
                                borderWidth: 1
                            },
                            emphasis: {
                                color: 'rgba(37, 43, 61, .5)' //悬浮背景
                            }
                        }
                    },
                    visualMap: [{
                        type: 'continuous',
                        show: false,
                        min: dataExtent[0],
                        max: dataExtent[1],
                        dimension: 2,
                        seriesIndex: 1,
                        inRange: {
                            color: ['#bc6262', '#c63d3d', '#a50606'],
                            colorAlpha: [.4, .8],
                        }
                    }],
                    series: [{
                        type: 'custom',
                        coordinateSystem: 'geo',
                        geoIndex: 0,
                        renderItem: this.renderItemHexBin,
                        data: WorldLayout
                    },
                    {
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        data,
                        label: {
                            show: true,
                            formatter: ({data}) => {
                                return data[2] > 50000 ? data[3] : ''
                            },
                            fontSize: 9,
                            fontWeight: 'lighter',
                        },
                        symbolSize: data => {
                            return scaleSize(data[2])
                        }

                    }]
                };
                const myChart = echarts.init(document.getElementById('world-map'));
                myChart.setOption(option);
            },
            renderItemHexBin(params, api) {
                const hexagonRadiusInGeoSize = 1;
                var center = api.coord([api.value(0), api.value(1)]);
                var pointsBG = [];
                var maxViewRadius = api.size([hexagonRadiusInGeoSize, 0])[0];
                var angle = Math.PI / 6;
                for (var i = 0; i < 6; i++, angle += Math.PI / 3) {
                    pointsBG.push([
                        center[0] + maxViewRadius * Math.cos(angle),
                        center[1] + maxViewRadius * Math.sin(angle)
                    ]);
                }
                return {
                    type: 'group',
                    children: [{
                        type: 'polygon',
                        shape: {
                            points: pointsBG
                        },
                        style: {
                            stroke: null,
                            fill: 'red',
                            lineWidth: 0
                        },
                        z2: -19
                    }]
                };
            },
            initWorldData() {
                const data = WorldTrend.map(d => (
                    NationGeo[d.name]
                    ? NationGeo[d.name].concat([_.last(d.trend.list[0].data)], d.name)
                    : false
                ))
                return data
            }
        },
        mounted() {
            this.initMap()
        }
    }
</script>

<style lang="less" scoped>
    #world-map{
        height: 100%;
    }
</style>