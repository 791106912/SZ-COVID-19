<template>
    <div class="sz-count">
        <div
            class="sz-count-item"
            v-for="item in total"
            :key="item.name"  
        >
            <span class="sz-count-item-label">
                {{item.name}}
            </span>
            <span class="sz-count-item-count" :style="{color: item.color}">
                {{item.count}}
            </span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'SzStatic',
        data() {
            return {
                total: [
                    {
                        name: '现有确诊',
                        count: '0',
                        color: '#c23e32',
                    },
                    {
                        name: '累计确诊',
                        count: '462',
                        color: '#c23e32',
                    },
                    {
                        name: '累计出院',
                        count: '459',
                        color: '#6ac3b9',
                    },
                    {
                        name: '累计死亡',
                        count: '3',
                        color: '#a4a5aa',
                    },
                    {
                        name: '接受观察',
                        count: '0',
                        color: '#70aff7',
                    },
                ],
            }
        }
    }
</script>

<style lang="less" scoped>
    .sz-count{
        display: flex;
        justify-content: space-between;
        .sz-count-item{
            margin: 10px 0;
            display: flex;
            align-items: center;
            .sz-count-item-count{
                margin-left: 10px;
                font-size: 24px;
            }
        }
    }
</style>