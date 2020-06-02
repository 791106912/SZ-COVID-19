<template>
    <div id="trackMap">

    </div>
</template>

<script>
    import _ from 'lodash';
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/component/geo'
    import 'echarts/map/js/world.js';
    import StationGeo from '@/data/station'
    import TrackJSON from '@/data/track'

    export default {
        name: 'Map',
        methods: {
            initMap() {
                const series = this.initSeries();
                var option = {
                    tooltip: {
                        trigger: 'item',
                        backgroundColor: 'rgba(166, 200, 76, 0.82)',
                        borderColor: '#FFFFCC',
                        showDelay: 0,
                        hideDelay: 0,
                        enterable: true,
                        transitionDuration: 0,
                        extraCssText: 'z-index:100',
                        // formatter: function(params, ticket, callback) {
                        //     //根据业务自己拓展要显示的内容
                        //     var res = "";
                        //     var name = params.name;
                        //     var value = params.value[params.seriesIndex + 1];
                        //     res = "<span style='color:#fff;'>" + name + "</span><br/>数据：" + value;
                        //     return res;
                        // }
                    },
                    backgroundColor:"#013954",
                    visualMap: { //图例值控制
                        min: 0,
                        max: 1,
                        calculable: true,
                        show: true,
                        color: ['#f44336', '#fc9700', '#ffde00', '#ffde00', '#00eaff'],
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    geo: {
                        map: 'world',
                        zoom: 1.2,
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
                };
                const myChart = echarts.init(document.getElementById('trackMap'), 'light');
                myChart.setOption(option);
            },
            initData() {
                const trackArr = _.chain(TrackJSON)
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
                    .value()
                return trackArr;
            },
            initSeries() {
                const series = [];
                const trackData = this.initData();
                const justTrack = trackData.map(d => d.track);
                const startstationArr = _.chain(justTrack)
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

                series.push(
                    {
                        type: 'lines',
                        zlevel: 2,
                        effect: {
                            show: true,
                            period: 4, //箭头指向速度，值越小速度越快
                            trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
                            symbol: 'arrow', //箭头图标
                            symbolSize: 5, //图标大小
                        },
                        lineStyle: {
                            normal: {
                                width: 1, //尾迹线条宽度
                                opacity: 1, //尾迹线条透明度
                                curveness: .3 //尾迹线条曲直度
                            }
                        },
                        data: justTrack,
                    },
                    {
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
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
                                fontSize: 13
                            },
                            emphasis: {
                                show: true
                            }
                        },
                        symbol: 'circle',
                        symbolSize: function(val) {
                            return val[2] * 3 >= 6 ? 6 : val[2] * 3; //圆环大小
                        },
                        itemStyle: {
                            normal: {
                                show: false,
                                color: '#f00'
                            }
                        },
                        data: startstationArr
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
                        data: [{
                            name: '深圳',
                            value: StationGeo['深圳'].concat([10]),
                        }],
                    }
                );
                return series;
            }
        },
        mounted() {
            this.initMap()
        }
    }
</script>

<style lang="less" scoped>
    #trackMap{
        height: 500px;
    }
</style>