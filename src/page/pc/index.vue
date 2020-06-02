<template>
   <div id="pc">
        <Section
            title="深圳疫情"
        >
            <div class="part-sz">
                <SzMap />
                <SzStatic />
            </div>
       </Section>
       <Section
            title="各区分布"
       >
            <List />
       </Section>
       <Section
            title="世界分布"
       >
            <WorldMap />
            <Bar />
       </Section>
       
   </div>
</template>

<script>


import Section from '@/components/section'
import SzMap from './components/szMap'
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
        .part-sz{
            display: flex;
            height: 400px;
        }
    }
</style>
