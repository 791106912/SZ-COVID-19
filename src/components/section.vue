<template>
    <div class="section">
        <div class="section-left-top section-radius"></div>
        <div class="section-right-top section-radius"></div>
        <div class="section-left-bottom section-radius"></div>
        <div class="section-right-bottom section-radius"></div>
        <div class="section-title">
            {{title}}
        </div>
        <div class="section-body">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Section',
        props: ['title'],
    }
</script>

<style lang="less" scoped>
    .section{
        // border: solid 1px red;
        background: radial-gradient(95% 100% ellipse, #071226 44%, #223d70);
        padding: 30px;
        padding-top: 0px;
        position: relative;
        margin-bottom: 20px;
        .section-radius{
            position: absolute;
            border: solid 2px #498bff;
            height: 30px;
            width: 30px;
        }
        .section-left-top{
            left: 0;
            top: 0;
            border-right-width: 0;
            border-bottom-width: 0;
        }
        .section-right-top{
            right: 0;
            top: 0;
            border-left-width: 0;
            border-bottom-width: 0;
        }
        .section-left-bottom{
            left: 0;
            bottom: 0;
            border-top-width: 0;
            border-right-width: 0;
        }
        .section-right-bottom{
            right: 0;
            bottom: 0;
            border-left-width: 0;
            border-top-width: 0;
        }
        .section-title{
            line-height: 40px;
            margin: 0 -30px;
            font-size: 14px;
            padding-left: 20px;
            background: linear-gradient(to right, #1f468b, 30%, #0f1f3c);
            color: #70c0ff;
        }
        .section-body{
            min-height: 100px;
        }
    }
</style>