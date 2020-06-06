<template>
   <div id="pc">
       <div class="pc-left">
            <Section
                class="left-map"
                title="深圳疫情"
                height="100%"
            >
                <div class="part-sz">
                    <SzStatic />
                    <SzMap />
                </div>
            </Section>
       </div>
        <div class="pc-right">
             <Section
                class="right-list"
                title="各区分布"
                height="100%"
            >
                <div class="part-list">
                    <List />
                </div>
            </Section>
            <Section
                title="世界分布"
                class="right-map"
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
            overflow: hidden;
            .left-map {
                height: 100%;
            }
            .part-sz{
                display: flex;
                flex-direction: column;
                height: 100%;
                .map{
                    flex: 1;
                    width: 100%;
                }
            }
        }
        .pc-right {
            margin-left: 20px;
            display: flex;
            flex-direction: column;
            flex: 1;
            .right-list{
                height: calc(50% - 10px);
            }
            .right-map{
                height: calc(50% - 10px);
            }
            .part-world {
                height: 100%;
                display: flex;
                flex-direction: column;
                .world-map {
                    height: 50%;
                }
                .world-bar {
                    flex: 1;
                }
            }
        }
    }
</style>
