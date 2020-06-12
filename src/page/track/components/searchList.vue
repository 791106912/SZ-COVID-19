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
            <header>高感染风险的公共交通名单</header>
            <Swiper
                :options="swiperOption"
                :auto-update="true"
            >
                <SwiperSlide v-for="item in transArr" :key="item.time">
                    <div class="traffic-list-item">
                        <div class="item-date">
                            {{item.date}}
                        </div>
                        <div class="item-child-container">
                            <div class="item-child">
                                <span class="item-child-icon">
                                    <MyIconTrain />
                                </span>
                                <span class="item-child-value">
                                    <span
                                        v-for="(d, k) in item.train"
                                        :key="k"
                                    >{{d}}</span>
                                </span>
                            </div>
                            <div class="item-child">
                                <span class="item-child-icon">
                                    <MyIconBus />
                                </span>
                                <span class="item-child-value">
                                    <span
                                        v-for="(d, k) in item.bus"
                                        :key="k"
                                    >{{d}}</span>
                                </span>
                            </div>
                            <div class="item-child">
                                <span class="item-child-icon">
                                    <MyIconPlane />
                                </span>
                                <span class="item-child-value">
                                    <span
                                        v-for="(d, k) in item.plane"
                                        :key="k"
                                    >{{d}}</span>
                                </span>
                            </div>
                            <div class="item-child">
                                <span class="item-child-icon">
                                    <MyIconShip />
                                </span>
                                <span class="item-child-value">
                                    <span
                                        v-for="(d, k) in item.ship"
                                        :key="k"
                                    >{{d}}</span>
                                </span>
                            </div>
                        </div>
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
import { MyIconBus, MyIconPlane, MyIconTrain, MyIconShip } from '@/components/icons'

export default {

    name: 'search-list',
    components: {
        Swiper,
        SwiperSlide,
        MyIconBus,
        MyIconPlane,
        MyIconTrain,
        MyIconShip,
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
                slidesPerView: 3,
                mousewheel: true,
                height: 400,
            },
            styles: {
                backgroundImage: `url(${picture})`,
                backgroundRepeat: 'no-repeat',
            },
            listArr: [],
            currentDate: '',
            transArr: [],
            transObj: {},
            idAdd: false,
        }
    },
    methods: {
        initData() {
            this.initTrackData = TrackJSON
                .filter(d => d.track.length)
                .map(d => ({
                    ...d,
                    place: _.chain(d.track)
                        .slice(0, 1)
                        .reduce((arr, d1) => {
                            arr.push({
                                name: d1.from,
                                date: d.track[d.track.length - 1].time,
                                time: new Date(d.track[d.track.length - 1].time).getTime(),
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

            // this.transArr = _.chain(this.initTrackData)
            //     .map(d => d.track.map(d1 => d1.tran))
            //     .flattenDeep()
            //     .compact()
            //     .countBy()
            //     .map((d, k) => ({
            //         tran: k,
            //         count: d
            //     }))
            //     .orderBy('count', 'desc')
            //     .value()

            const banTran = ['私家车', '商务车', '的士', '出租车', '自驾车', '专车', '不详']

            this.transArr = _.chain(this.initTrackData)
                .map(d => d.track.map(d1 => {
                    // let tran = /(航班)/.test(d1.tran) ? 'plane' : d1.tran
                    // tran = /(航船)/.test(tran) ? 'ship' : tran
                    return {
                        time: d1.time,
                        tran: d1.tran,
                    }
                }))
                .flattenDeep()
                .reduce((obj, d) => {
                    const key = d.time
                    if (!obj[key]) {
                        obj[key] = []
                    }
                    obj[key].push(d)
                    return obj
                }, {})
                .forEach((d, k, obj) => {
                    obj[k] = {
                        ..._.chain(d)
                        .map(d => d.tran)
                        .compact()
                        .filter(d => !banTran.includes(d))
                        .reduce((obj, d) => {
                            let key = ''
                            if ( /(航班)/.test(d)) {
                                key = 'plane'
                            }
                            if (/(航船)/.test(d)) {
                                key = 'ship'
                            }
                            if (!obj[key]) {
                                obj[key] = []
                            }
                            obj[key].push(d.slice(0, -2))
                            return obj
                        }, {})
                        .value(),
                        date: k,
                    }
                })
                .values()
                .orderBy(d => new Date(d.date).getTime())
                .value()

            this.startSearch()
        },
        startSearch(date = '') {
            this.listArr = _.chain(this.originListArr)
                .map(d => ({
                    ...d,
                    count: this.getCount(d.name, date)
                }))
                .filter(d => d.count)
                .orderBy('count', 'desc')
                .value()
            
        },
        getCount(name, date) {
            if (!date) return this.allCountObj[name] || 0
            const timeStamp = new Date(date).getTime()
            return this.placeArr
                .filter(d => {
                    let tempFlag = false
                    if (this.isAdd) {
                        tempFlag = d.time <= timeStamp
                    } else {
                        tempFlag = d.date === date
                    }
                    return tempFlag && d.name === name}
                )
                .length
        },
        watchTime() {
            eventBus.$on('trackMapTime', ({date, isAdd}) => {
                this.isAdd = isAdd
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
                z-index: 0;
                margin-top: 20px;
                color: #aaa;
                .traffic-list-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 20px 10px;
                    .item-date{
                        width: 7em;
                    }
                    .item-child-container {
                        flex: 1;
                        display: flex;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        .item-child {
                            width: 100%;
                            display: flex;
                            padding: 0 20px;
                            .item-child-icon {
                                color: #285ac7;
                                font-size: 20px;
                            }
                            .item-child-value {
                                font-size: 12px;
                                display: flex;
                                flex-wrap: wrap;
                                span {
                                    padding: 0 5px;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>