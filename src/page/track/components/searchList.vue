<template>
    <div class="search-list">
        <div class="search-form">
            <div class="form-border" :style="styles" />
            <el-form :model="formData" label-position="left" label-width="80px" size="mini">
                <el-form-item
                    prop="name"
                    label="查找患者"
                >
                    <el-input v-model="formData.name" clearable />
                </el-form-item>
                <el-form-item
                    prop="range"
                    label="时间范围"
                >
                    <el-date-picker
                        v-model="formData.range"
                        type="datetimerange"
                        start-placeholder="起始时间"
                        end-placeholder="结束时间"
                    />
                </el-form-item>
                <el-form-item
                    prop="distance"
                    label="相似距离"
                >
                    <el-select v-model="formData.distance"
                        placeholder="请选择"
                        clearable    
                    >
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <el-button
                class="search-button"
                size="mini"
                @click="hanleSearch"
            >search</el-button>
        </div>
        <div class="search-lists">
            <ul >
                <li
                    v-for="item in listArr"
                    :key="item.name"
                >
                    <span>{{item.name}}</span>
                    <span>重复次数:&nbsp;&nbsp;{{item.count}}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
import picture from '@/assets/border.png'
import TrackJSON from '@/data/track'

export default {

    name: 'search-list',
    data() {
        return {
            styles: {
                backgroundImage: `url(${picture})`,
                backgroundRepeat: 'no-repeat',
            },
            formData: {
                name: '',
                range: null,
                distance: '',
            },
            options: [{
                value: '500',
                label: '500km',
            }, 
            {
                value: '1000',
                label: '1000km',
            },
            {
                value: '1500',
                label: '158km',
            },
            {
                value: '2000',
                label: '2000km',
            }],
            listArr: [],
        }
    },
    methods: {
        initData() {
            this.initTrackData = TrackJSON.map(d => ({
                ...d,
                place: _.chain(d.track)
                    .reduce((arr, d1) => {
                        arr.push({
                            name: d1.from,
                            time: new Date(d1.time).getTime(),
                        },
                        {
                            name: d1.to,
                            time: new Date(d1.time).getTime(),
                        })
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
                
            this.startSearch()
        },
        startSearch() {
            const { name }  = this.formData
            let { range } = this.formData
            range = range ? range.map(d => d.getTime()) : null
            const findItem = this.initTrackData.find(d => name.toString() === d.blh)

            const places = findItem ? findItem.place.map(d => d.name) : null
            
            this.listArr = _.chain(this.originListArr)
                .map(d => ({
                    ...d,
                    count: this.getCount(d.name, range, places)
                }))
                .orderBy('count', 'desc')
                .value()
            
        },
        getCount(name, range, places) {
            if (!places) return this.allCountObj[name]
            if (!places.includes(name)) return 0
            return this.placeArr.filter(d => places.includes(d.name))
                .filter(d => d.name === name)
                .filter(d => (!range || d.time >= range[0] && d.time <= range[1]))
                .length
        },
        hanleSearch() {
            this.startSearch()
        },
    },
    mounted() {
        this.initData()
    },
}
</script>

<style lang="less">
    .search-list {
        display: flex;
        flex-direction: column;
        .search-form {
            height: 40%;
            margin: 40px 0 0  40px;
            display: flex;
            align-items: center;
            position: relative;
            border: 1px solid #224ac0;
            border-top: none;
            padding: 20px 40px 20px;
            background: radial-gradient(95% 100% ellipse, #071226 50%, #224ac0);
            .form-border {
                height: 30px;
                padding: 0;
                margin: 0;
                position: absolute;
                top: -20px;
                left: -5px;
                right: -1px;
                background-size: 110% 30px;
            }
            .search-button {
                position: absolute;
                top: calc(100% - 10px);
                left: 128px;
                border: 1px solid #224ac0;
                padding: 3px 10px;
                background-color: #b2d4f3;
                font-weight: bold;
                &:hover {
                    color: #606266;
                }
                &:focus {
                    color: #606266;
                }
            }
            .el-form {
                width: 100%;
                .el-form-item {
                    width: 100%;
                    display: flex;
                    .el-form-item__content {
                        margin-left: 10px !important;
                        flex: 1;
                    }
                    .el-select {
                        width: 100%;
                    }
                }
            }
        }
        .search-lists {
            margin-top: 20px;
            margin-bottom: 20px;
            height: calc(60% - 20px);
            overflow: auto;
            ul {
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
    }
</style>