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
                    bmap: {
                        enableMapClick: false,
                    },
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
                            center: [114.16455183658751, 22.628456637984177],
                            zoom: 11,
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
                            data: ['码头', '火车站', '机场', '发热门诊', '确诊病例小区'],
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
                                color: 'rgba(239, 83, 80, 0.54)',
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
                            symbolSize: 16,
                            symbol: matouStr,
                            zlevel: 2,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: true,
                                    color: '#fff',
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
                            symbolSize: 16,
                            symbol: huocheStr,
                            zlevel: 2,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: true,
                                    color: '#fff',
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
                            symbolSize: 16,
                            symbol: feijiStr,
                            zlevel: 2,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: true,
                                    color: '#fff',
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                        }
                        ]
                    })
                    // this.bmap = new window.BMap.Map("allmap")
                    this.bmap = this.chart.getModel().getComponent('bmap').getBMap()
                    this.bmap.setMinZoom(10) // 设置地图最小缩放比例
                    this.bmap.setMaxZoom(15) // 设置地图最大缩放比例
                    const name = ['南山', '光明', '大鹏', '福田', '龙岗', '盐田', '宝安', '坪山', '罗湖', '龙华']
                    name.map(d => {
                        this.drawLine(`广东省深圳市${d}区`,  {
                                strokeWeight: 2,
                                strokeColor: 'gray',
                                fillColor: 'rgba(0,0,0,0)',
                            });
                    })
                    this.drawLine(`广东省深圳市`,  {
                        strokeWeight: 2,
                        strokeStyle: 'dashed',
                        strokeColor: '#23caed',
                        fillColor: 'rgba(0,0,0,0)',
                        strokeOpacity: 1,
                    });
                },
                drawLine (name, style) {
                    var bdary = new window.BMap.Boundary();
                    bdary.get(name, rs => {//获取行政区域
                        // this.bmap.clearOverlays();//清除地图覆盖物
                        var count = rs.boundaries.length; //行政区域的点有多少个
                        var pointArray = [];
                        for (var i = 0; i < count; i++) {
                            var ply = new window.BMap.Polygon(rs.boundaries[i], style); //建立多边形覆盖物
                            this.bmap.addOverlay(ply);  //添加覆盖物
                            pointArray = pointArray.concat(ply.getPath());
                        }    
                        // this.bmap.setViewport(pointArray);    //调整视野  
                    });   
                }
            }
        }
</script>

<style lang="less" scoped>
    .map{
        width: 80%;
    }
</style>