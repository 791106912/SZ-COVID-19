<template>
    <div class="search-list">
        <div class="search-lists">
            <header class="lists-header">
                <span>病例来源列表</span>
                <span class="lists-header-date">{{currentDate}}</span>
            </header>
            <ul >
                <li
                    v-for="item in listArr"
                    :key="item.name"
                >
                    <span>{{item.name}}</span>
                    <span>人数:&nbsp;&nbsp;{{item.count}}</span>
                </li>
            </ul>
        </div>
        <div class="traffic-list">
            <header>交通工具列表</header>
            <Swiper
                :options="swiperOption"
                :auto-update="true"
            >
                <SwiperSlide v-for="item in transArr" :key="item.tran">
                    <div class="traffic-list-item">
                        <span>{{item.tran}}</span>
                        <span class="list-item-count">{{item.count}}</span>
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>
    </div>
</template>

<script>
import eventBus from '../eventBus'
import _ from 'lodash'
import picture from '@/assets/border.png'
import TrackJSON from '@/data/track'
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'

export default {

    name: 'search-list',
    components: {
        Swiper,
        SwiperSlide,
    },
    data() {
        return {
            swiperOption: {
                direction : 'vertical',
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                loop: true,
                slidesPerView: 8,
                mousewheel: true,
                height: 300,
            },
            styles: {
                backgroundImage: `url(${picture})`,
                backgroundRepeat: 'no-repeat',
            },
            listArr: [],
            currentDate: '',
            transArr: [],
        }
    },
    methods: {
        initData() {
            this.initTrackData = TrackJSON.map(d => ({
                ...d,
                place: _.chain(d.track)
                    .slice(0, 1)
                    .reduce((arr, d1) => {
                        arr.push({
                            name: d1.from,
                            date: d1.time,
                            time: new Date(d1.time).getTime(),
                        },
                        // {
                        //     name: d1.to,
                        //     date: d1.time,
                        //     time: new Date(d1.time).getTime(),
                        // }
                        )
                        return arr
                    }, [])
                    .uniqBy('name')
                    .value()
            }))

            this.originListArr = _.chain(this.initTrackData)
                .map(d => d.track.map(d1 => [d1.from, d1.to]))
                .flattenDeep()
                .uniq()
                .compact()
                .map(d => ({
                    name: d,
                    count: 0,
                }))
                .filter(d => d.name !== '深圳')
                .value()

            this.allCountObj = _.chain(this.initTrackData)
                .map('place')
                .flatten()
                .map('name')
                .countBy()
                .value()

            this.placeArr = _.chain(this.initTrackData)
                .map('place')
                .flatten()
                .value()

            this.transArr = _.chain(this.initTrackData)
                .map(d => d.track.map(d1 => d1.tran))
                .flattenDeep()
                .compact()
                .map(d => d.indexOf('航班') !== -1 ? '航空': d)
                .countBy()
                .map((d, k) => ({
                    tran: k,
                    count: d
                }))
                .orderBy('count', 'desc')
                .value()
            
            this.startSearch()
        },
        startSearch(date = '') {
            this.listArr = _.chain(this.originListArr)
                .map(d => ({
                    ...d,
                    count: this.getCount(d.name, date)
                }))
                .orderBy('count', 'desc')
                .value()
            
        },
        getCount(name, date) {
            if (!date) return this.allCountObj[name] || 0
            return this.placeArr
                .filter(d => (d.date === date) && d.name === name)
                .length
        },
        hanleSearch() {
            this.startSearch()
        },
        watchTime() {
            eventBus.$on('trackMapTime', date => {
                this.currentDate = date
                this.startSearch(date)
            })
        }
    },
    mounted() {
        this.initData()
        this.watchTime()
    },
}
</script>

<style lang="less">
    .search-list {
        margin-left: 20px;
        width: calc(30% - 20px);
        display: flex;
        flex-direction: column;
        .search-lists {
            margin-top: 20px;
            margin-bottom: 20px;
            height: calc(50% - 20px);
            overflow: auto;
            .lists-header {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                .lists-header-date {
                    font-size: 12px;
                }
            }
            ul {
                padding-left: 0;
                color: #aaa;
                list-style-type: none;
                font-size: 14px;
                li {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px dotted #224ac0;
                    line-height: 2.5em;
                    span:nth-last-child(1) {
                        margin-right: 10px;
                    }
                }
            }
        }
        .traffic-list {
            height: 50%;
            overflow: hidden;
            font-size: 14px;
            header {
                font-size: 14px;
            }
            .swiper-container {
                margin-top: 20px;
                color: #aaa;
                .traffic-list-item {
                    line-height: 2.5em;
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px dotted #224ac0;
                    .list-item-count {
                        margin-right: 10px;
                    }
                }
            }
        }
    }
</style>