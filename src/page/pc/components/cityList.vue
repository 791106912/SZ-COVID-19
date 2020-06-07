<template>
    <div>
        <el-table
            :data="data"
            height="250"
        >
            <el-table-column
                prop="name"
                label="省份"
            />
            <el-table-column
                prop="now"
                label="现有"
                sortable
            />
            <el-table-column
                prop="acc"
                label="累计"
                sortable
            />
        </el-table>
    </div>
</template>

<script>
    export default {
        name: 'CityList',
        data() {
            return {
                data: [],
            }
        },
        methods: {
            getData() {
                fetch('http://toutiao.iqiyi.com/api/route/haoduo/nCoV/detail')
                    .then(function(response) {
                        return response.json();
                    })
                    .then(res => {
                        this.initData(res.data.detail);
                    });
            },
            initData(data = []) {
                this.data = data.map( d => ({
                    name: d.provinceShortName,
                    acc: d.confirmedCount,
                    now: d.confirmedCount - d.curedCount - d.deadCount
                })).sort((b, a) => a.acc - b.acc);
                console.log(this.data);
            }
        },
        mounted() {
            this.getData();
        }
    }
</script>

<style lang="scss" scoped>

</style>