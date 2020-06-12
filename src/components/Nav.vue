<template>
    <div class="vis-nav" :style="styles">
        <div class="vis-menu">
            <el-menu
                :default-active="activeIndex"
                mode="horizontal"
                @select="handleSelect"
                text-color="#fff"
                router
            >
                <el-menu-item
                    v-for="item in menu"
                    :index="item.comName"
                    :key="item.comName"
                    :style="nowIndex === item.path ? activeStyle : defaultStyle"
                >
                    <span v-text="item.name"></span>
                </el-menu-item>
            </el-menu>
        </div>
        <div class="vis-brand-time">{{date}}</div>
        <div class="vis-brand-title">深圳市疫情可视分析系统</div>
    </div>
</template>

<script>
    import menu from '@/config/menu'
    import picture from '@/assets/top-bg.png'
    import picture2 from '@/assets/nav-bg.png'

    export default {
        name: 'Nav',
        data() {
            return {
                activeIndex: 'pc',
                nowIndex: window.location.hash.replace('#/', '').toLowerCase(),
                menu: menu,
                date: '',
                styles: {
                    background: `#071225 url(${picture}) no-repeat`,
                    backgroundSize: '100% 78%',
                    backgroundPosition: '0px 10px',
                },
                activeStyle: {
                    color: '#fff !important',
                    background: `url(${picture2}) no-repeat`,
                    backgroundSize: '100% 78%',
                    backgroundPosition: '0px 6px',

                },
                defaultStyle: {
                    color: '#62c4ff !important',
                    background: 'none !important',
                }
            };
        },
        methods: {
            handleSelect(key) {
                this.nowIndex = key.toLowerCase();
            },
            formate() {
                var a = new Date()
                var [year, month, day] = a.toLocaleDateString().split('/')
                var hour = a.getHours();
                var minutes = a.getMinutes();
                var seconds = a.getSeconds();
                var weekArr = ['星期日','星期一','星期二','星期三','星期四','星期五', '星期六']
                var week = a.getDay()
                var fun = d => d < 10 ? `0${d}` : d
                return `${fun(hour)}:${fun(minutes)}:${fun(seconds)}  |  ${year}年${fun(month)}月${fun(day)}日  ${weekArr[week]}`
            }
        },
        mounted(){
            this.timer = setInterval(() => {
                this.date = this.formate();
            });
        },
        beforeDestroy:function(){
            if(this.timer){
                clearInterval(this.timer);
            }
        },
    };
</script>

<style lang="less" scoped>
    @green: #62c4ff;
    @borderWidth: 2px;
    .vis-nav{
        display: flex;
        justify-content: center;
        color: #4f94bf;
        .vis-menu{
            font-size: 14px;
            width: 40%;
            position: relative;
            display: flex;
             .el-menu{
                padding: 0 20px;
                background: rgba(0, 0, 0, 0);
                flex: 1;
                border: none;
                display: flex !important;
                justify-content: space-around;
                .el-menu-item{
                    display: block;
                    border: none !important;
                    color: #4f94bf !important;
                    flex: 1;
                    text-align: center;
                    &:hover,&:focus{
                        color: @green !important;
                        background: none;
                    }
                    &.is-active{
                        color: #fff !important;
                    }
                }
            }
        }
        .vis-brand-title{
            position: absolute;
            width: 26%;
            left: 0;
            text-align: center;
            font-size: 22px;
            top: 24px;
            letter-spacing: 3px;
            background: linear-gradient(to bottom, #fff, #8dd3ff);
            -webkit-background-clip: text;
            color: transparent;
        }
        .vis-brand-time{
            position: absolute;
            width: 30%;
            right: 0;
            text-align: center;
            font-size: 14px;
            top: 30px;
            background: linear-gradient(to bottom, #fff, #8dd3ff);
            -webkit-background-clip: text;
            color: transparent;
        }
    }
</style>