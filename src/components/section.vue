<template>
    <div class="section">
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
        .section-title{

        }
        .section-body{
            min-height: 100px;
        }
    }
</style>