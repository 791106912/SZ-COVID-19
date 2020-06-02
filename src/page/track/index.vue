<template>
    <div>
        <Map />
        <SanKey />
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