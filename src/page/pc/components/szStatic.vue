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
                        color: 'red',
                    },
                    {
                        name: '累计确诊',
                        count: '462',
                        color: 'red',
                    },
                    {
                        name: '累计出院',
                        count: '459',
                        color: 'red',
                    },
                    {
                        name: '累计死亡',
                        count: '3',
                        color: 'red',
                    },
                    {
                        name: '接受观察',
                        count: '1',
                        color: 'red',
                    },
                ],
            }
        }
    }
</script>

<style lang="less" scoped>
    .sz-count{
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .sz-count-item{
            margin: 10px 0;
            .sz-count-item-count{
                font-size: 20px;
            }
        }
    }
</style>