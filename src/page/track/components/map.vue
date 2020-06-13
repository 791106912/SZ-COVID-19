<template>
    <div class="lines-map-container">
        <div class="map-tool">
            <el-switch
                v-model="isAll"
                active-text="累计"
                inactive-text="新增"
                inactive-color="#b2d4f3"
                @change="handleAllChange"
            />
        </div>
        <div class="map-title">{{currentDate}}</div>
        <div id="trackMap">

        </div>
    </div>
</template>

<script>
    import eventBus from '../eventBus';
    import _ from 'lodash';
    import { extent } from 'd3'
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/component/geo'
    import 'echarts/map/js/world.js';
    import StationGeo from '@/data/station'
    import TrackJSON from '@/data/track'
    import CountryMappingJSON from '@/data/countryMapping'
    import CountryI18n from '@/data/countryI18n'

    const PERIOD = 2;

    const DEFAULT_CENTER = [114.279, 30]

    const DEFAULT_ZOOM = 9

    export default {
        name: 'Map',
        data() {
            return {
                isAll: true,
                currentDate: '',
            }
        },
        methods: {
            initMap() {
                const series = this.initSeries();
                const {options, timelineData} = this.initOptions()
                var option = {
                    baseOption: {
                        timeline: {
                            currentIndex: this.timelineIndex || 0,
                            orient: 'vertical',
                            top: '20',
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
                        visualMap: [
                        {
                            id: 'heatmap',
                            show: true,
                            seriesIndex: 5,
                            min: 0,
                            max: 10000,
                            left: 10,
                            itemGap: 4,
                            itemSymbol: 'circle',
                            textStyle: {
                                color: '#aaa',
                            },
                            pieces: [{
                                gt: 10000,
                                label: "> 10000 人",
                                color: "rgba(57, 111, 255)"
                            }, {
                                gte: 5000,
                                lte: 10000,
                                label: "5000 - 10000 人",
                                color: "rgba(50, 97, 222)"
                            }, {
                                gte: 200,
                                lt: 5000,
                                label: "200 - 5000 人",
                                color: "rgba(42, 82, 189)"
                            }, {
                                gt: 0,
                                lt: 200,
                                label: "0 - 200人",
                                color: "rgba(35, 68, 156)"
                            }, {
                                value: 0,
                                color: "rgba(51, 69, 89, .5)"
                            }],
                        }],
                        geo: {
                            map: 'world',
                            zoom: DEFAULT_ZOOM,
                            center: DEFAULT_CENTER,
                            label: {
                                emphasis: {
                                    show: false
                                }
                            },
                            scaleLimit: {
                                min: 1,
                                max: 12
                            },
                            roam: true, //是否允许缩放
                            itemStyle: {
                                normal: {
                                    color: 'rgba(51, 69, 89, .5)', //地图背景色
                                    borderColor: '#516a89', //省市边界线00fcff 516a89
                                    borderWidth: 1
                                },
                                emphasis: {
                                    color: 'rgba(51, 69, 89, .5)' //悬浮背景
                                }
                            }
                        },
                        series: series
                    },
                    options,
                };
                this.myChart.setOption(option, true);
            },
            initHeatData() {
                return fetch('d/format_timeseries.json')
                    .then(res => res.json())
                    .then(res => {
                        this.heatData = _.pickBy(res, (d, k) => CountryMappingJSON[k])
                    })
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
                            time: endstation.time,
                            value: 1,
                            coord: StationGeo[endstation.to],
                        }]
                        return {
                            blh,
                            track: trackItem,
                        }
                    })
                    .reduce((o, d) => {
                        const key = d.track[1].time
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
                        if (!obj[d.name]) {
                            obj[d.name] = {
                                name: d.name,
                                value: d.coord.concat(0),
                            }
                        }
                        obj[d.name].value[2] += 1
                        return obj;
                    }, {})
                    .values()
                    .value();
            },
            getHeatData(date) {
                return _.chain(this.heatData)
                    .map((arr, k) => {
                        const findItem = arr.find(d1 => d1.date === date) || {}
                        return {
                            name: CountryMappingJSON[k],
                            value: findItem.exist || 0
                        }
                    })
                    .value()
            },
            initOptions() {
                const timeTrack = this.initData()
                this.timeTrack = timeTrack
                const options = _.chain(timeTrack)
                    .orderBy(d => new Date(d[0].track[1].time).getTime())
                    .map((d, i, arr) => {
                        const trackData = d.map(d1 => d1.track)
                        const addTrackData = this.isAll
                        ? _.chain(arr)
                            .slice(0, i + 1)
                            .flatten()
                            .map(d1 => d1.track)
                            .value()
                        : []
                        const scatterData = this.getScatterData(trackData)
                        const addScatterData = this.getScatterData(addTrackData)
                        
                        const newDate = new Date(d[0].track[1].time)
                        const currentDate = `${newDate.getFullYear()}-${
                            newDate.getMonth() + 1}-${newDate.getDate()}`
                        const heatData = this.getHeatData(currentDate)
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
                            },
                            {},
                            {
                                data: heatData
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
            calculateRadius(d) {
                if(d[2] >= 10) {
                    return 10
                } else if(d[2]<=4){
                    return 4;
                }
                return d[2] 
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
                            width: 1, //尾迹线条宽度
                            opacity: 0.4, //尾迹线条透明度
                            curveness: 0.3, //尾迹线条曲直度
                            color: '#fe7335',
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
                        symbolSize: d => this.calculateRadius(d),
                        itemStyle: {
                            color: '#fe7335',
                        },
                    },
                    {
                        id: 'allLines',
                        type: "lines",
                        zlevel: 2,
                        lineStyle: {
                            color: '#fe7335',
                            width: 1, //尾迹线条宽度
                            opacity: 0.8, //尾迹线条透明度
                            curveness: 0.3 //尾迹线条曲直度
                        },
                        animation: false,
                    },
                    {
                        id: 'addScatter',
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        zlevel: 1,
                        label: {
                            show: false,
                        },
                        symbol: 'circle',
                        symbolSize: d => this.calculateRadius(d),
                        itemStyle: {
                            color: '#fe7335',
                            opacity: .8,
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
                                color: '#1cf3e8',
                                formatter: '{b}',
                                textStyle: {
                                    color: "#1cf3e8"
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
                    {
                        type: 'map',
                        geoIndex: 0,
                        tooltip: {
                            show: true,
                            formatter: ({data}) => {
                                const name = CountryI18n[data.name] ? CountryI18n[data.name] : data.name
                                const value = isNaN(data.value) || !data.value ? 0 : data.value
                                let str = `${this.currentDate}<br/>${name}: ${value}  例`
                                if (!data.name) str = null
                                return str
                            }
                        },
                    }
                );
                return series;
            },
            hanleTimelinechanged() {
                this.updateDate(0)
                this.myChart.on('timelinechanged', ({ currentIndex }) => {
                    this.timelineIndex = currentIndex
                    const { series } = this.myChart.getOption()
                    const seriesIndex = this.isAll ? 3 : 1
                    const geoArr = _.chain(series[seriesIndex].data)
                        .map(d => d.value.slice(0, 2))
                        .value()
                    geoArr.push(StationGeo["深圳"])
                    const lngExtent = extent(geoArr, d => +d[0]).map((d, i) => +d + (i === 0 ? (-1) : 1))
                    const latExtent = extent(geoArr, d => +d[1]).map((d, i) => +d + (i === 0 ? (-10) : 10))

                    const lngCenter = Number.isNaN(lngExtent[0]) ? DEFAULT_CENTER[0] : (lngExtent[0] + lngExtent[1]) / 2
                    const latCenter = Number.isNaN(latExtent[0]) ? DEFAULT_CENTER[1] : (latExtent[0] + latExtent[1]) / 2
                    const center = [lngCenter, latCenter]
                    const zoom = Number.isNaN(lngExtent[0]) ? DEFAULT_ZOOM
                        : _.min([1 / ((lngExtent[1] - lngExtent[0]) / 360), 1 / ((latExtent[1] - latExtent[0]) / 180)])

                    const heatExtent = extent(series[5].data, d => d.value)
                    this.myChart.setOption({
                        geo: {
                            zoom,
                            center,
                        },
                        visualMap: {
                            id: 'heatmap',
                            min: heatExtent[0] + 1,
                            max: heatExtent[1] + heatExtent[1] * .2
                        },
                        series: {
                            id: 'allLines',
                            lineStyle: {
                                opacity: '.2',
                            },
                        }
                    }, this)

                    this.updateDate(currentIndex)
                })
            },
            updateDate(index) {
                const timeArr = _.chain(this.timeTrack)
                    .map((d, k) => ({
                        date: k,
                        time: new Date(k).getTime(),
                    }))
                    .orderBy('time')
                    .map('date')
                    .value()
                eventBus.$emit('trackMapTime', {
                    date: timeArr[index],
                    isAdd: this.isAll,
                })
                this.currentDate = timeArr[index]
            },
            handleAllChange() {
                this.initMap()
            },
        },
        mounted() {
            this.initHeatData().then(() => {
                this.myChart = echarts.init(document.getElementById('trackMap'), 'light');
                this.initMap()
                this.hanleTimelinechanged()
            })
        },
        beforeDestroy() {
            this.myChart.dispose()
        }
    }
</script>

<style lang="less">
   .el-switch__label{
        color: #aaa;
    }
    .lines-map-container {
        position: relative;
        padding: 0;
        margin: 0;
        width: 70%;
        .map-tool {
            position: absolute;
            top: 5px;
            z-index: 2;
            transform: scale(.8);
        }
        .map-title {
            position: absolute;
            top: 10px;
            right: 100px;
            z-index: 2;
            color: white;
            font-size: 32px;
            text-shadow: 3px 3px black, -2px -2px black, 2px -2px black,
        }
        #trackMap{
            width: 100%;
            height: 100%;
        }
    }
</style>