<template>
    <div id="trackMap">

    </div>
</template>

<script>
    import _ from 'lodash';
    import { extent } from 'd3'
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/component/geo'
    import 'echarts/map/js/world.js';
    import StationGeo from '@/data/station'
    import TrackJSON from '@/data/track'

    const PERIOD = 2;

    const DEFAULT_CENTER = [114.279, 30]

    const DEFAULT_ZOOM = 9

    export default {
        name: 'Map',
        methods: {
            initMap() {
                const series = this.initSeries();
                const {options, timelineData} = this.initOptions()
                var option = {
                    baseOption: {
                        timeline: {
                            orient: 'vertical',
                            top: '10',
                            left: '90%',
                            right: '20',
                            bottom: '10',
                            axisType: 'category',
                            symbol: 'rect',
                            symbolSize: [10, 6],
                            itemStyle: {
                                color: '#152a68',
                            },
                            checkpointStyle: {
                                symbol: 'roundRect',
                                color: '#3c8af1',
                                symbolSize: [10, 6],
                                borderWidth: 0,
                            },
                            controlStyle: {
                                itemSize: 15,
                            },
                            emphasis: {
                                itemStyle: {
                                    color: '#3c8af1',
                                },
                                label: {
                                    color: '#3c8af1',
                                },
                                controlStyle: {
                                    color: '#3c8af1',
                                    borderColor: '3c8af1',
                                    borderWidth: 2,
                                },
                            },
                            label: {
                                position: 10,
                                interval: 1,
                                color: '#aaa',
                                fontSize: 10,
                                formatter: value => {
                                    const date = new Date(value)
                                    return [date.getFullYear(),
                                        date.getMonth() + 1,
                                        date.getDate()]
                                            .join('-')
                                }
                            },
                            loop: true,
                            autoPlay: true,
                            playInterval: PERIOD * 1000,
                            data: timelineData
                        },
                        tooltip: {
                            trigger: 'item',
                            backgroundColor: 'rgba(166, 200, 76, 0.82)',
                            borderColor: '#FFFFCC',
                            showDelay: 0,
                            hideDelay: 0,
                            enterable: true,
                            transitionDuration: 0,
                            extraCssText: 'z-index:100',
                        },
                        visualMap: { //图例值控制
                            show: false,
                            seriesIndex: 1,
                            min: 0,
                            max: 1,
                            calculable: true,
                            // color: ['#f44336', '#fc9700', '#ffde00', '#ffde00', '#00eaff'],
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        geo: {
                            map: 'world',
                            zoom: DEFAULT_ZOOM,
                            center: DEFAULT_CENTER,
                            label: {
                                emphasis: {
                                    show: false
                                }
                            },
                            roam: true, //是否允许缩放
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
                        series: series
                    },
                    options,
                };
                const myChart = echarts.init(document.getElementById('trackMap'), 'light');
                myChart.setOption(option);
                this.myChart = myChart
                window.dddChart = myChart
            },
            initData() {
                const trackObj = _.chain(TrackJSON)
                    .filter(d => d.track.length > 0)
                    .map(d => {
                        const { track, blh } = d;
                        const startstation = track[0];
                        const endstation = track[track.length - 1];
                        const trackItem = [{
                            name: startstation.from,
                            time: startstation.time,
                            value: 1,
                            coord: StationGeo[startstation.from],
                        }, {
                            name: endstation.to,
                            time: startstation.time,
                            value: 1,
                            coord: StationGeo[endstation.to],
                        }]
                        return {
                            blh,
                            track: trackItem,
                        }
                    })
                    .reduce((o, d) => {
                        const key = d.track[0].time
                        if (o[key]) {
                            o[key].push(d)
                        } else {
                            o[key] = [d]
                        }
                        return o
                    }, {})
                    .pickBy('length')
                    .value()
                return trackObj;
            },
            getScatterData(data) {
                return _.chain(data)
                    .flattenDeep()
                    .reduce((obj, d) => {
                        if(d.name === '深圳') return obj;
                        let value = d.coord.concat(d.value);
                        if(obj[d.name]) {
                            value[2] += 1;
                        }
                        obj[d.name] = {
                            name: d.name,
                            value,
                        }
                        return obj;
                    }, {})
                    .values()
                    .value();
            },
            initOptions() {
                const timeTrack = this.initData()
                const options = _.chain(timeTrack)
                    .orderBy(d => new Date(d[0].track[0].time).getTime())
                    .map((d, i, arr) => {
                        const trackData = d.map(d1 => d1.track)
                        const addTrackData = _.chain(arr)
                            .slice(0, i + 1)
                            .flatten()
                            .map(d1 => d1.track)
                            .value()
                        const scatterData = this.getScatterData(trackData)
                        const addScatterData = this.getScatterData(addTrackData)
                        return {
                            series: [{
                                data: trackData,
                            },
                            {
                                data: scatterData,
                            },
                            {
                                data: addTrackData,
                            },
                            {
                                data: addScatterData
                            }]
                        }
                    })
                    .value()

                const timelineData = _.chain(timeTrack)
                    .keys()
                    .orderBy(d => new Date(d).getTime())
                    .value()
                return {options, timelineData}
            },
            initSeries() {
                const series = [];
                series.push(
                    {
                        type: "lines",
                        zlevel: 2,
                        effect: {
                            show: true,
                            period: PERIOD - .5, //箭头指向速度，值越小速度越快
                            trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
                            symbol: "arrow", //箭头图标
                            symbolSize: 5, //图标大小
                            loop: false,
                        },
                        lineStyle: {
                            normal: {
                                width: 1, //尾迹线条宽度
                                opacity: 0.4, //尾迹线条透明度
                                curveness: 0.3 //尾迹线条曲直度
                            }
                        },
                    },
                    {
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 1,
                        rippleEffect: { //涟漪特效
                            period: 4, //动画时间，值越小速度越快
                            brushType: 'stroke', //波纹绘制方式 stroke, fill
                            scale: 4 //波纹圆环最大限制，值越大波纹越大
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right', //显示位置
                                offset: [5, 0], //偏移设置
                                formatter: function(params){//圆环显示文字
                                    return params.data.name;
                                },
                                fontSize: 10
                            },
                            emphasis: {
                                show: true
                            }
                        },
                        symbol: 'circle',
                        symbolSize: function(val) {
                            return val[2] * 3 >= 6 ? 5 : val[2] * 3; //圆环大小
                        },
                        itemStyle: {
                            normal: {
                                show: false,
                                color: '#f00'
                            }
                        },
                    },
                    {
                        id: 'allLines',
                        type: "lines",
                        zlevel: 2,
                        effect: {
                            show: false,
                            color: '#37A2DA',
                            period: 0, //箭头指向速度，值越小速度越快
                            trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
                            symbol: "arrow", //箭头图标
                            symbolSize: 5, //图标大小
                            loop: false,
                        },
                        lineStyle: {
                            normal: {
                                color: '#37A2DA',
                                width: 1, //尾迹线条宽度
                                opacity: 0.8, //尾迹线条透明度
                                curveness: 0.3 //尾迹线条曲直度
                            }
                        },
                        animation: false,
                    },
                    {
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        zlevel: 1,
                        label: {
                            normal: {
                                show: true,
                                position: 'right', //显示位置
                                offset: [5, 0], //偏移设置
                                formatter: function(params){//圆环显示文字
                                    return params.data.name;
                                },
                                fontSize: 10
                            },
                            emphasis: {
                                show: true
                            }
                        },
                        symbol: 'circle',
                        symbolSize: function(val) {
                            return val[2] * 3 >= 6 ? 5 : val[2] * 3; //圆环大小
                        },
                        itemStyle: {
                            normal: {
                                show: false,
                                color: '#f00',
                                opacity: .4,
                            }
                        },
                        animation: false,
                    },
                    {
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            period: 4,
                            brushType: 'stroke',
                            scale: 4
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                //offset:[5, 0],
                                color: '#0f0',
                                formatter: '{b}',
                                textStyle: {
                                    color: "#0f0"
                                }
                            },
                            emphasis: {
                                show: true,
                                color: "#f60"
                            }
                        },
                        symbol: 'pin',
                        symbolSize: 20,
                        z: 10,
                        data: [{
                            name: '深圳',
                            value: StationGeo['深圳'].concat([10]),
                        }],
                    },
                );
                return series;
            },
            hanleTimelinechanged() {
                this.myChart.on('timelinechanged', () => {
                    const { series } = this.myChart.getOption()
                    const geoArr = _.chain(series[3].data)
                        .map(d => d.value.slice(0, 2))
                        .value()
                    const lngExtent = extent(geoArr, d => +d[0]).map((d, i) => +d + (i === 0 ? (-1) : 1))
                    const latExtent = extent(geoArr, d => +d[1]).map((d, i) => +d + (i === 0 ? (-10) : 10))

                    const lngCenter = Number.isNaN(lngExtent[0]) ? DEFAULT_CENTER[0] : (lngExtent[0] + lngExtent[1]) / 2
                    const latCenter = Number.isNaN(latExtent[0]) ? DEFAULT_CENTER[1] : (latExtent[0] + latExtent[1]) / 2
                    const center = [lngCenter, latCenter]
                    const zoom = Number.isNaN(lngExtent[0]) ? DEFAULT_ZOOM
                        : _.min([1 / ((lngExtent[1] - lngExtent[0]) / 360), 1 / ((latExtent[1] - latExtent[0]) / 180)])

                    this.myChart.setOption({
                        geo: {
                            zoom,
                            center,
                        }
                    }, this)
                })
            }
        },
        mounted() {
            this.initMap()
            this.hanleTimelinechanged()
        }
    }
</script>

<style lang="less" scoped>
    #trackMap{
        width: 70%;
        height: 100%;
    }
</style>