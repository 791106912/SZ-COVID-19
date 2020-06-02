<template>
    <div class="vis-nav">
        <!-- <div class="vis-brand">
            <div class="vis-brand-title">深圳市疫情可视分析系统</div>
            <div class="vis-brand-time">{{date}}</div>
        </div> -->
        <!-- <div class="vis-triangle-small vis-triangle-indie-left vis-triangle-indie"></div> -->
        <!-- <div class="vis-triangle-big vis-triangle-indie-left vis-triangle-indie"></div> -->
        <div class="vis-menu">
            <div class="vis-triangle-left"></div>
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
                >
                    <span v-text="item.name"></span>
                </el-menu-item>
            </el-menu>
            <div class="vis-triangle-right"></div>
        </div>
        <!-- <div class="vis-triangle-big vis-triangle-indie-right vis-triangle-indie"></div> -->
        <!-- <div class="vis-triangle-small vis-triangle-indie-right vis-triangle-indie"></div> -->
    </div>
</template>

<style lang="less" scoped>
    @green: #36ACAC;
    @borderWidth: 2px;
    .vis-nav{
        display: flex;
        justify-content: center;
        color: #4f94bf;
        .vis-menu{
            font-size: 14px;
            width: 50%;
            position: relative;
            display: flex;
            .vis-triangle-left{
                top: 20px;
                float: left;
                width: 30px;
                height: 62px;
                transform: skewX(20deg);
                transform-origin: bottom left;
                border-right: solid @borderWidth @green;
            }
            .vis-triangle-right{
                top: 0;
                float: left;
                width: 30px;
                height: 62px;
                transform: skewX(-20deg);
                transform-origin: bottom right;
                border-left: solid @borderWidth @green;
            }
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
                    &:hover,&:focus{
                        color: @green !important;
                        background: none;
                    }
                    &.is-active{
                        color: #fff !important;
                        background: radial-gradient(100% 90% ellipse, #4e99ce 10%, #071227 48%, transparent 20%) !important;
                    }
                }
                &::after{
                    
                }
            }
        }
        .vis-triangle-small{
            width: 20px;
            margin: 0 12px;
        }
        .vis-triangle-big{
            width: 30px;
        }
        .vis-triangle-indie{
            height: 60px;
            border: solid @borderWidth @green;
            border-top-width: 0;
        }
        .vis-triangle-indie-left{
            transform: skewX(20deg);
        }
        .vis-triangle-indie-right{
            transform: skewX(-20deg);
        }
        .vis-brand{
            position: absolute;
            left: 20px;
            .vis-brand-title{
                font-size: 20px;
                line-height: 40px;
            }
        }
    }
</style>

<script>
    import menu from '@/config/menu'

    export default {
        name: 'Nav',
        data() {
            return {
                activeIndex: 'pc',
                menu: menu,
                date: new Date().toLocaleString(),
            };
        },
        methods: {
            handleSelect(key, keyPath) {
                console.log(key, keyPath);
            }
        },
        mounted(){
            this.timer = setInterval(() => {
                this.date = new Date().toLocaleString();
            });
        },
        beforeDestroy:function(){
            if(this.timer){
                clearInterval(this.timer);
            }
        },
    };
</script>