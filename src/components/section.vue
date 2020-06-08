<template>
    <div class="section">
        <div class="section-left-top section-radius"></div>
        <div class="section-right-top section-radius"></div>
        <div class="section-left-bottom section-radius"></div>
        <div class="section-right-bottom section-radius"></div>
        <div class="section-title">
            {{title}}
            <slot name="extra"></slot>
        </div>
        <div class="section-body" :style="{height: height ? `calc(${height} - 20px)` : 'auto'}">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Section',
        props: ['title', 'height'],
    }
</script>

<style lang="less" scoped>
    .section{
        // border: solid 1px red;
        background: radial-gradient(95% 100% ellipse, #071226 44%, #223d70);
        padding: 20px;
        padding-top: 0px;
        position: relative;
        margin-bottom: 20px;
        width: 100%;
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
            display: flex;
            justify-content: space-between;
            align-items: center;
            line-height: 40px;
            margin: 0 -20px;
            font-size: 14px;
            padding:0 20px;
            background: linear-gradient(to right, #1f468b, 30%, #0f1f3c);
            color: #70c0ff;
        }
        .section-body{
            min-height: 100px;
            overflow: auto;
        }
    }
</style>