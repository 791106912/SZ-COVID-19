<template>
   <div id="pc">
       <div class="pc-left">
            <Section
                class="left-map"
                title="深圳疫情"
                height="100%"
            >
                <div class="part-sz">
                    <SzMap />
                    <SzStatic />
                </div>
            </Section>
            <Section
                class="left-list"
                title="各区分布"
                height="100%"
            >
                <div class="part-list">
                    <List />
                </div>
            </Section>
       </div>
        <div class="pc-right">
            <Section
                title="世界分布"
                height="100%"
            >
                <div class="part-world">
                    <WorldMap class="world-map" />
                    <Bar class="world-bar" />
                </div>
            </Section>
       </div>
       
   </div>
</template>

<script>


import Section from '@/components/section'
import SzMap from './components/szMap2'
import SzStatic from './components/szStatic'
import List from './components/list'
import WorldMap from './components/worldMap'
import Bar from './components/bar'


export default {
    name: 'PC',
    data() {
        return {
        }
    },
    components: {
        Section,
        List,
        SzMap,
        SzStatic,
        WorldMap,
        Bar,
    },
    methods: {
        
    },
    mounted() {
       
    }
};
</script>

<style lang="less" scoped>
    #pc{
        display: flex;
        height: 100%;
        .pc-left {
            width: 66%;
            margin-right: 20px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding-bottom: 20px;
            .left-map {
                height: 50%;
            }
            .left-list {
                height: calc(50% - 20px);
            }
        }
        .pc-right {
            display: flex;
            flex: 1;
        }
        .part-sz{
            display: flex;
            height: 100%;
        }
        .part-world {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            .world-map {
                height: 50%;
            }
            .world-bar {
                flex: 1;
            }
        }
    }
</style>
