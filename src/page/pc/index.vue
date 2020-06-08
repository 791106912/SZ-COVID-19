<template>
   <div id="pc">
       <div class="pc-left">
            <Section
                class="left-map"
                title="深圳疫情"
                height="100%"
            >
                <div class="part-sz">
                    <SzStatic />
                    <SzMap />
                </div>
            </Section>
       </div>
        <div class="pc-right">
             <Section
                class="right-list"
                title="各区分布"
                height="100%"
            >
                <div class="part-list">
                    <List />
                </div>
            </Section>
            <Section
                :title="title"
                class="right-map"
                height="100%"
            >
                <template v-slot:extra>
                    <el-switch
                        v-model="type"
                        active-color="#70c0ff"
                        inactive-color="#ff4949"
                        active-value="province"
                        inactive-value="city"
                        @change="changeType"
                    >
                    </el-switch>
                </template>
                <div class="part-world">
                    <CityList
                        :data="data"
                    />
                </div>
            </Section>
       </div>
   </div>
</template>

<script>


import Section from '@/components/section'
import SzMap from './components/szMap2'
import SzStatic from './components/szStatic'
import List from './components/list'
import CityList from './components/cityList'

const provinceData = ["哈尔滨","石家庄","兰州","昆明","成都","长春","沈阳","西宁","西安","郑州","济南","太原","合肥","武汉","长沙","南京","贵阳","南宁","杭州","南昌","广州","福州","台北","海口","呼和浩特","银川","乌鲁木齐","拉萨","澳门","北京","上海","香港","天津","重庆"];

export default {
    name: 'PC',
    data() {
        return {
            type: 'province',
            data: [],
            title: '国内省市排行'
        }
    },
    components: {
        Section,
        List,
        SzMap,
        SzStatic,
        CityList,
    },
    originData: [],
    methods: {
        changeType() {
            this.initData();
        },
        getData() {
            fetch('http://toutiao.iqiyi.com/api/route/haoduo/nCoV/detail')
                .then(function(response) {
                    return response.json();
                })
                .then(res => {
                    this.originData = res.data.detail;
                    this.initData();
                });
        },
        initData() {
            let newData = [];
            let title = '国内省市排行';
            if(this.type === 'province') {
                newData = this.originData.map( d => ({
                    name: d.provinceShortName,
                    acc: d.confirmedCount,
                    now: d.confirmedCount - d.curedCount - d.deadCount
                })).sort((b, a) => a.acc - b.acc);
            } else {
                title = '国内主要城市排行'
                newData = this.originData.map(d => d.cities)
                    .flat()
                    .filter(d1 => provinceData.includes(d1.cityName))
                    .map( d => ({
                        name: d.cityName,
                        acc: d.confirmedCount,
                        now: d.confirmedCount - d.curedCount - d.deadCount
                    }))
                    .sort((b, a) => a.acc - b.acc);
            }
            this.data = newData
            this.title = title;
        }
    },
    mounted() {
       this.getData();
    }
};
</script>

<style lang="less" scoped>
    #pc{
        display: flex;
        height: 100%;
        .pc-left {
            width: 66%;
            overflow: hidden;
            .left-map {
                height: 100%;
            }
            .part-sz{
                display: flex;
                flex-direction: column;
                height: 100%;
                .map{
                    flex: 1;
                    width: 100%;
                }
            }
        }
        .pc-right {
            margin-left: 20px;
            display: flex;
            flex-direction: column;
            flex: 1;
            .right-list{
                height: calc(50% - 10px);
            }
            .right-map{
                height: calc(50% - 10px);
            }
            .part-world {
                height: 100%;
                display: flex;
                flex-direction: column;
                .world-map {
                    height: 50%;
                }
                .world-bar {
                    flex: 1;
                }
            }
        }
    }
</style>
