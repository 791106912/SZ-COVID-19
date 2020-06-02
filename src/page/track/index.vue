<template>
    <div>
        <div>
            <Map></Map>
        </div>
        <SanKey
            height="1200px"
        ></SanKey>
    </div>
</template>

<script>
    import SanKey from './components/sankey'
    import Map from './components/map'

    export default {
        name: 'Track',
        components:  {
            SanKey,
            Map
        }
    }
</script>

<style lang="scss" scoped>

</style>