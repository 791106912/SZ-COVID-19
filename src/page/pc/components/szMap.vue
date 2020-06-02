<template>
    <div id="map-sz"></div>
</template>

<script>
    import _ from 'lodash'
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/component/geo'
    import 'echarts/map/js/world.js';

    import sz from '@/data/sz';
    import ComJSON from '@/data/community';

    export default {
        name: 'SzMap',
        methods: {
            initMap() {
                echarts.registerMap('shenzhen', sz);
                const communityData = this.initCommunity();
                const option = {
                    // backgroundColor: '#091c3d',
                    geo: {
                        show: true,
                        map: 'shenzhen',
                        label: {
                            normal: {
                                show: false
                            },
                            emphasis: {
                                show: false,
                            }
                        },
                        roam: true,
                        itemStyle: {
                            normal: {
                                areaColor: 'transparent',
                                borderColor: '#3fdaff',
                                borderWidth: 2,
                                shadowColor: 'rgba(63, 218, 255, 0.5)',
                                shadowBlur: 30
                            },
                            emphasis: {
                                areaColor: '#2B91B7',
                            }
                        },
                    },
                    series: [
                        {
                            name: 'commounity',
                            type: 'scatter',
                            coordinateSystem: 'geo',
                            data: communityData,
                            symbolSize: function (val) {
                                return val[2] / 10;
                            },
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: false
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: 'red'
                                }
                            }
                        },
                    ]
                };
                const myChart = echarts.init(document.getElementById('map-sz'), 'light');
                myChart.setOption(option);
            },
            initCommunity(){
                return _.chain(ComJSON)
                    .map(d => ({
                        name: d.name,
                        value: d.coord.concat(100),
                    }))
                    .value()
            }
        },
        mounted() {
            this.initMap();
        }
    }
</script>

<style lang="less" scoped>
    #map-sz{
        width: 80%;
    }
</style>