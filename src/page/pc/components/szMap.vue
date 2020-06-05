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
    import OutPJSON from '@/data/outpatient'

    export default {
        name: 'SzMap',
        methods: {
            initMap() {
                echarts.registerMap('shenzhen', sz);
                const communityData = this.initCommunity();
                const outpatientData = this.initOutpatient()
                const option = {
                    // backgroundColor: '#091c3d',
                    visualMap: {
                        show: false,
                        min: 0,
                        max: 100,
                        seriesIndex: 0,
                        inRange: {
                            color: ['#eac736', 'red']
                        },
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    geo: {
                        show: true,
                        map: 'shenzhen',
                        zoom: 1.2,
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
                            name: '热图',
                            type: 'heatmap',
                            coordinateSystem: 'geo',
                            pointSize: 3,
                            blurSize: 4,
                            data: communityData,
                            z: 10,
                        },
                        {
                            name: 'outpatient',
                            type: 'scatter',
                            coordinateSystem: 'geo',
                            data: outpatientData,
                            symbolSize: function () {
                                return 12;
                            },
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
            },
            initOutpatient() {
                return OutPJSON.map(d => ({
                    name: d.ORGAN_NAME,
                    value: [d.latitude1, d.longitude1, 100]
                }))
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