<template>
    <div class="analysis">
        <Section
            title="新冠病毒传播轨迹分析"
            class="map"
            height="100%"
        >
            <div class="map-container">
                <Map />
                <search-list />
            </div>
        </Section>
        <Section
            title="新冠病毒病例特征聚类分析"
            height="100%"
        >
            <SanKey />
        </Section>
    </div>
</template>

<script>
    import Section from '@/components/section'
    import SanKey from './components/sankey'
    import Map from './components/map'
    import SearchList from './components/searchList'

    export default {
        name: 'Track',
        components:  {
            Section,
            SanKey,
            Map,
            'search-list': SearchList
        }
    }
</script>

<style lang="less" scoped>
    .analysis {
        display: flex;
        flex-direction: column;
        height: 100%;
        .map {
            height: 500px;
            .map-container {
                height: 100%;
                display: flex;
            }
        }
    }
</style>