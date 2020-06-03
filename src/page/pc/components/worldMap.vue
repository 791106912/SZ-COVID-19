<template>
    <div id="world-map">
        
    </div>
</template>

<script>
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/component/geo'
    import 'echarts/map/js/world.js';
    import WorldLayout from '@/data/worldLayout'
    import WorldTrend from '@/data/worldTrend'

    export default {
        name: 'WorldMap',
        methods: {
            initMap() {
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
                    series: [{
                        type: 'custom',
                        coordinateSystem: 'geo',
                        geoIndex: 0,
                        renderItem: this.renderItemHexBin,
                        data: WorldLayout
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
               console.log(WorldTrend);
            }
        },
        mounted() {
            this.initMap()
            this.initWorldData()
        }
    }
</script>

<style lang="less" scoped>
    #world-map{
        height: 100%;
    }
</style>