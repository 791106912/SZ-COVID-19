<template>
    <div :id="id" :style="{width: width + 'px', height: height + 'px'}">

    </div>
</template>

<script>
    import { Chart } from '@antv/g2';

    export default {
        name: 'AreaChart',
        props: ['height', 'width', 'data', 'id'],
        methods: {
            init() {
                const chart = new Chart({
                container: this.id,
                autoFit: true,
                });

                chart.data(this.data);
                chart.scale('year', {
                type: 'linear',
                tickInterval: 50,
                });
                chart.scale('value', {
                nice: true,
                });

                chart.tooltip({
                showCrosshairs: true,
                shared: true,
                });

                chart
                .area()
                .adjust('stack')
                .position('year*value')
                .color('country');
                chart
                .line()
                .adjust('stack')
                .position('year*value')
                .color('country');

                chart.interaction('element-highlight');

                chart.render();
            }
        },
        mounted() {
            this.init();
        },
    }
</script>

<style lang="less" scoped>

</style>