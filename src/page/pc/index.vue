<template>
   <div id="pc">
       <div class="pc-word section">
           <div class="section-title">世界分布</div>
           <div class="section-body">
                <div id="pc-word-map"></div>
                <List :data="datalist" /> 
           </div>
       </div>
       <div class="pc-sz section">
           <div class="section-title">深圳分布</div>
           <div class="section-body">
                <div id="pc-sz-map"></div>
                <div class="pc-chart">
                    <AreaChart
                        height="200"
                        width="400"
                        :data="areaData"
                        id = "asd1"
                    />
                    <AreaChart
                        height="200"
                        width="400"
                        :data="areaData"
                        id = "asd3"
                    />
                    <AreaChart
                        height="200"
                        width="400"
                        :data="areaData"
                        id = "asd2"
                    />
                </div>
           </div>
       </div>
   </div>
</template>

<script>
import { Scene, PointLayer } from "@antv/l7"
import { CityLayer } from '@antv/l7-district';
import { Mapbox } from "@antv/l7-maps"
import List from '@/components/list'
import AreaChart from '@/components/areaChart'
import PortJSON from '@/data/port'

export default {
    name: 'PC',
    data() {
        return {
            datalist: [{
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄'
            }, {
                date: '2016-05-04',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1517 弄'
            }, {
                date: '2016-05-01',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1519 弄'
            }, {
                date: '2016-05-03',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1516 弄'
            }],
            areaData: [
                { country: 'Asia', year: '1750', value: 502 },
                { country: 'Asia', year: '1800', value: 635 },
                { country: 'Asia', year: '1850', value: 809 },
                { country: 'Asia', year: '1900', value: 5268 },
                { country: 'Asia', year: '1950', value: 4400 },
                { country: 'Asia', year: '1999', value: 3634 },
                { country: 'Asia', year: '2050', value: 947 },
                { country: 'Africa', year: '1750', value: 106 },
                { country: 'Africa', year: '1800', value: 107 },
                { country: 'Africa', year: '1850', value: 111 },
                { country: 'Africa', year: '1900', value: 1766 },
                { country: 'Africa', year: '1950', value: 221 },
                { country: 'Africa', year: '1999', value: 767 },
                { country: 'Africa', year: '2050', value: 133 },
                { country: 'Europe', year: '1750', value: 163 },
                { country: 'Europe', year: '1800', value: 203 },
                { country: 'Europe', year: '1850', value: 276 },
                { country: 'Europe', year: '1900', value: 628 },
                { country: 'Europe', year: '1950', value: 547 },
                { country: 'Europe', year: '1999', value: 729 },
                { country: 'Europe', year: '2050', value: 408 },
                { country: 'Oceania', year: '1750', value: 200 },
                { country: 'Oceania', year: '1800', value: 200 },
                { country: 'Oceania', year: '1850', value: 200 },
                { country: 'Oceania', year: '1900', value: 460 },
                { country: 'Oceania', year: '1950', value: 230 },
                { country: 'Oceania', year: '1999', value: 300 },
                { country: 'Oceania', year: '2050', value: 300 },
                ]
        }
    },
    components: {
        List,
        AreaChart
    },
    methods: {
        initWorld: () => {
            const scene = new Scene({
                id: 'pc-word-map',
                map: new Mapbox({
                    pitch: 0,
                    style: 'dark',
                    center: [ 96.99215001469588, 29.281597225674773 ],
                    zoom: 2.194613775109773,
                    maxZoom: 10
                })
            });
            scene.on('loaded', () => {
                const pointLayer = new PointLayer({})
                    .source(PortJSON)
                    .shape('circle')
                    .size('capacity', [ 0, 16 ])
                    .color('capacity', [
                        '#34B6B7',
                        '#4AC5AF',
                        '#5FD3A6',
                        '#7BE39E',
                        '#A1EDB8',
                        '#CEF8D6'
                    ])
                    .active(true)
                    .style({
                        opacity: 0.5,
                        strokeWidth: 0
                    });

                scene.addLayer(pointLayer);
            })
        },
        initCity: () => {
            const scene = new Scene({
                id: 'pc-sz-map',
                map: new Mapbox({
                    pitch: 0,
                    style: 'blank',
                })
            });
            scene.on('loaded', () => {
                new CityLayer(scene, {
                joinBy: [ 'adcode', 'code' ],
                adcode: [ '440300', '440303' ],
                depth: 3,
                label: {
                    field: 'NAME_CHN',
                    textAllowOverlap: false
                },
                });
            });
        }
    },
    mounted() {
        this.initWorld()
        this.initCity()
    }
};
</script>

<style lang="less" scoped>
    #pc{
        display: flex;
        .section{
            position: relative;
            &::before{
                content: '';
                border: solid 1px green;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                display: block;
                height: 30px;
                border-bottom: 0px;
                width: 100%;
            }
             &::after{
                content: '';
                border: solid 1px green;
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
                display: block;
                position: absolute;
                bottom: 0;
                height: 30px;
                border-top: 0px;
                width: 100%;
            }
            .section-title{
                font-size: 14px;
                margin-top: -20px;
                margin-left: 20px;
            }
            .section-body{
                position: relative;
                height: calc(100% - 60px);
                width: calc(100% - 20px);
                margin-left: 10px;
                border: solid 1px red;
            }
        }
        .pc-word{
            width: 60%;
            height: 800px;
        }
        .pc-sz{
            width: 50%;
            height: 800px;
        }
        #pc-word-map, #pc-sz-map{
            height: 300px;
        }
    }
</style>
