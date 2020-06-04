<template>
    <div class="search-list">
        <div class="search-form">
            <el-form :model="formData" label-position="left" label-width="80px" size="mini">
                <el-form-item
                    prop="name"
                    label="查找患者"
                >
                    <el-input v-model="formData.name" />
                </el-form-item>
                <el-form-item
                    prop="range"
                    label="时间范围"
                >
                    <el-date-picker
                        v-model="formData.range"
                        type="datetimerange"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    />
                </el-form-item>
                <el-form-item
                    prop="distance"
                    label="相似距离"
                >
                    <el-select v-model="value" placeholder="请选择">
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
        </div>
        <div class="search-lists">
            <ul >
                <li>
                    <span>123</span>
                    <span>213</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: 'search-list',
    data() {
        return {
            formData: {
                name: '',
                range: [],
                distance: '',
            },
            options: [{
                value: '50',
                label: '50',
            }, 
            {
                value: '100',
                label: '100',
            },
            {
                value: '150',
                label: '158',
            },
            {
                value: '200',
                label: '200',
            }]
        }
    }
}
</script>

<style lang="less" scoped>
    .search-list {
        display: flex;
        flex-direction: column;
        .search-form {
            height: 40%;
            margin: 20px 0 0  40px;
            display: flex;
            align-items: center;
        }
        .search-lists {
            ul {
                color: #606266;
                list-style-type: none;
                font-size: 14px;
                li {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #1f3bad;
                    line-height: 2em;
                }
            }
        }
    }
</style>