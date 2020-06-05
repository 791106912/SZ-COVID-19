<template>
    <div class="forceCom">
        <div id="chart"></div>
    </div>
    
</template>

<script>
    import * as d3 from 'd3'
    import * as d3Fisheye from 'd3-fisheye'
    import _ from 'lodash'
    import TrackJSON from '@/data/track'
    import { initData, calculateNodeAndLink, aggre } from '../methods/dataProcessor'
    
    export default {
        name: 'Force',
        data() {
            const height = 800;
            const width = 800;

            const radius = Math.min(height, width) / 2;
            const forceRadius = [0, radius - 80];
            const fisheyeRadius = 100;
            const timeRadius = [radius - 80, radius - 60] ;
            const deminRadius = [radius - 30, radius];
            
            return {
                width,
                height,
                forceRadius,
                timeRadius,
                deminRadius,
                fisheyeRadius,

                disbaled: [],
                selectData: TrackJSON,
                timeIndex: [0, 0]
            }
        },
        methods: {
            drag: simulation => {
                function dragstarted(d) {
                    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
                
                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }
                
                function dragended(d) {
                    if (!d3.event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }
                
                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            },
            initChart() {
                this.svg = d3.select('#chart')
                    .append("svg")
                    .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])

                initData();
                this.initTimeCircle();
                this.initDemiCircle();
            },
            initTimeCircle() {
                const timeArr = _.chain(TrackJSON)
                    .reduce((obj, d) => {
                        obj[d.fbrq] = {
                            name: d.fbrq,
                            value: obj[d.fbrq] ? obj[d.fbrq].value + 1 : 1,
                        }
                        return obj;
                    }, {})
                    .values()
                    .orderBy(d => new Date(d).getTime(), 'desc')
                    .value();

                // const valueArr = timeArr.map(d => d.value);
                // valueArr.forEach((d, i) => {
                //     const addition = valueArr[i - 1] ? valueArr[i - 1] : 0;
                //     valueArr[i] = valueArr[i] + addition
                // })
                // timeArr.forEach((d, i) => {
                //     d.value = valueArr[i]
                // })

                this.timeIndex = [timeArr[0].name, timeArr[timeArr.length - 1].name]

                const [min, max] = d3.extent(timeArr, d => d.value);
                const color = d3.scaleLinear()
                    .domain([min, max / 2, max])
                    .range(['#009688', '#ffc107', '#ff0000'])

                const pie = d3.pie()
                    .padAngle(.01)
                    .sort(null)
                    .value(() => 1)

                const arc = d3.arc()
                    .innerRadius(this.timeRadius[0])
                    .outerRadius(this.timeRadius[1]);

                const arcs = pie(timeArr);

                const container = this.svg.append('g')
                    .classed('timeLine', true);
                
                container
                    .append('g')
                    .classed('path', true)
                    .selectAll("path")
                    .data(arcs)
                    .join("path")
                    .attr("fill", d => color(d.data.value))
                    .attr("d", arc)

                const text = container.append("g")
                    .classed('text', true)
                    .selectAll("text")
                    .data(arcs)
                    .join("text")
                    .attr("dy", "0.35em")

                text.append('path')
                    .attr('fill', 'none')
                    .attr('id', d => `hiddenArc${d.data.name}`)
                    .attr('d', d => {
                        const {startAngle, endAngle} = d;
                        const [innerRadius, outerRadius] = this.timeRadius;
                        const angles = [startAngle, endAngle].map(d1 => d1 - Math.PI / 2)
                        const r = (innerRadius + outerRadius) / 2;
                        const middleAngle = (angles[1] + angles[0]) / 2
                        const invertDirection = middleAngle > 0 && middleAngle < Math.PI
                        if (invertDirection) angles.reverse()
                        const path = d3.path()
                        path.arc(0, 0, r, angles[0], angles[1], invertDirection)
                        return path.toString()
                    })
                    
                text.append('textPath')
                    .attr('text-anchor', 'middle')
                    .attr('startOffset', '50%')
                    .attr('font-size', '9px')
                    .attr('fill', '#fff')
                    .attr('href', d => `#hiddenArc${d.data.name}`)
                    .text(d => d.data.name);

                // const radius = (this.timeRadius[0] + this.timeRadius[1]) / 2;
                const radius = (this.timeRadius[1]) + 4;

                const indexScale = d3.scaleLinear()
                        .domain([0, 1])
                        .range([0, timeArr.length]);

                function dragStart(){
                    const rad = Math.atan2(d3.event.y, d3.event.x);
                    d3.select(this)
                        .attr('cx', radius * Math.cos(rad))
                        .attr('cy', radius * Math.sin(rad))
                }

                const dragEnd = index => {
                    let rad = Math.atan2(d3.event.y, d3.event.x);
                    rad += Math.PI / 2;
                    if(rad < 0)  rad = Math.PI * 2 + rad
                    const scale = rad / (Math.PI * 2);
                    this.timeIndex[index] = Math.ceil(indexScale(scale))
                }

                container.append('circle')
                    .attr('r', 8)
                    .attr('fill', 'red')
                    .attr('cx',  () => {
                        const x = radius * Math.cos( - Math.PI / 2)
                        return x;
                    })
                    .attr('cy', () => {
                        const y = radius * Math.sin( - Math.PI / 2);
                        return y;
                    })
                    .call(d3.drag()
                        .on("drag",dragStart)
                        .on("end", () => dragEnd(0))
                    );

                container.append('circle')
                    .attr('r', 8)
                    .attr('fill', 'yellow')
                    .attr('cx',  () => {
                        const x = radius * Math.cos(0 * 2 * Math.PI - Math.PI / 2)
                        return x;
                    })
                    .attr('cy', () => {
                        const y = radius * Math.sin(0 * 2 * Math.PI - Math.PI / 2);
                        return y;
                    })
                    .call(d3.drag()
                        .on("drag", dragStart)
                        .on("end",  () =>  dragEnd(1))
                    );
                
            },
            initDemiCircle() {
                const deminData = [{
                    name: '聚集传播',
                    sortkey: 'relation',
                }, {
                    name: '染病原因',
                    sortkey: 'reason',
                }, {
                    name: '年龄',
                    sortkey: 'nlRange',
                }, {
                    name: '来源地',
                    sortkey: 'origin',
                }, {
                    name: '居住地',
                    sortkey: 'livelocation',
                }]

                const pie = d3.pie()
                    .padAngle(0)
                    .sort(null)
                    .value(() => 1)

                const arc = d3.arc()
                    .cornerRadius(10)
                    .padAngle(.1)
                    .innerRadius(this.deminRadius[0])
                    .outerRadius(this.deminRadius[1]);

                const arcs = pie(deminData);

                const color =  d3.scaleOrdinal(d3.schemeCategory10)

                const container = this.svg
                    .append('g')
                    .classed('sunBurst', true)
                
                const pathContainer = container
                    .append('g')
                    .classed('path', true)
                    
                pathContainer
                    .selectAll("path")
                    .data(arcs)
                    .enter()
                    .append("path")
                    .attr("fill", d => color(d.data.name))
                    .attr("d", arc)
                    .attr('stroke','none')
                    .on('click', function() {
                        pathContainer
                            .selectAll('path')
                            .attr("stroke", 'none')
                        d3.select(this)
                            .attr("stroke", '#fff')
                    })

                const text = container.append("g")
                    .classed('text', true)
                    .selectAll("text")
                    .data(arcs)
                    .join("text")
                    .attr("dy", "0.35em")

                text.append('path')
                    .attr('fill', 'none')
                    .attr('id', d => `hiddenArc${d.data.name}`)
                    .attr('d', d => {
                        const {startAngle, endAngle} = d;
                        const [innerRadius, outerRadius] = this.deminRadius;
                        const angles = [startAngle, endAngle].map(d1 => d1 - Math.PI / 2)
                        const r = (innerRadius + outerRadius) / 2;
                        const middleAngle = (angles[1] + angles[0]) / 2
                        const invertDirection = middleAngle > 0 && middleAngle < Math.PI
                        if (invertDirection) angles.reverse()
                        const path = d3.path()
                        path.arc(0, 0, r, angles[0], angles[1], invertDirection)
                        return path.toString()
                    })
                    
                text.append('textPath')
                    .attr('startOffset', '50%')
                    .attr('href', d => `#hiddenArc${d.data.name}`)
                    .text(d => d.data.name);
            },
            draw() {
                const [nodes, links] = calculateNodeAndLink(this.selectData);

                this.svg.select('g.force').remove();
                this.svg.select('g.aggre').remove();

                const simulation = d3.forceSimulation(nodes)
                    // .force('r', 
                    //     d3.forceRadial(10,0,0)
                    //     .strength(.1)
                    // )
                    .force("link", 
                        d3.forceLink(links).id(d => d.blh)
                    )
                    .force("charge", 
                        d3.forceManyBody()
                        // .strength(-40)
                    )
                    .force("x", d3.forceX())
                    .force("y", d3.forceY());

                const fisheye = d3Fisheye.radial()
                    .radius(this.fisheyeRadius)
                    .distortion(2)
                    .smoothing(0.5);

                const forceContainer = this.svg.append('g')
                    .classed('force', true)
                this.svg.on('mousemove', function() {
                        const mouse = d3.mouse(this);
                        fisheye.focus(mouse);
                        node.each(d => {
                                d.fisheye = fisheye([d.x, d.y]);
                            })
                            .attr('transform', d => `translate(${d.fisheye[0]}, ${d.fisheye[1]})`)
                        node.select('circle')
                            .attr('r', d => {
                                return d.fisheye[2] * d.r
                            })

                        node.select('text')
                            .attr('font-size', d => {
                                return d.fisheye[2] * 5
                            })

                        link.attr("x1", d => d.source.fisheye[0])
                            .attr("y1", d => d.source.fisheye[1])
                            .attr("x2", d => d.target.fisheye[0])
                            .attr("y2", d => d.target.fisheye[1]);
                    })
                    // .on('mouseleave', () => {
                    //     console.log(123);
                    //     node.attr('transform', d => `translate(${d.x}, ${d.y})`)
                            
                    //     node.select('circle')
                    //         .attr('r', d => d.r);

                    //     node.select('text')
                    //         .attr('font-size', 5)

                    //     link.attr("x1", d => d.source.x)
                    //         .attr("y1", d => d.source.y)
                    //         .attr("x2", d => d.target.x)
                    //         .attr("y2", d => d.target.y);
                    // })
                    

                const link = forceContainer
                    .append("g")
                    .classed('link', true)
                    .selectAll("line")
                    .data(links)
                    .join("line")

                const node = forceContainer.append("g")
                    .classed('node', true)
                    .selectAll(".circleG")
                    .data(nodes, d => d.blh)
                    .enter()
                    .append('g')
                    .classed('circleG', true)
                    .attr('transform', d => `translate(${d.x}, ${d.y})`)
                    .call(this.drag(simulation));

                node.append("circle").attr("r", d => d.r)

                node.append("text")
                    .attr('font-size', 5)
                    .text(d => {
                        let showText = d.blh;
                        if(d.yqtblgx) {
                            const blharr = d.yqtblgx.match(/(\d+、?)+/g)[0];
                            showText = d.yqtblgx.split(blharr)[1];
                        }
                        return showText
                    })

                simulation.on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                     node.attr('transform', d => `translate(${d.x}, ${d.y})`)
                });
            },
            selectType() {
                // this.selectData = TrackJSON.filter(d => !this.disbaled.includes(d[this.selectKey]));
                this.draw();
            }
        },
        mounted() {
            this.initChart();
        }
    }
</script>

<style lang="less">
    .forceCom{
        display: flex;
        height: 600px;
        margin-top: 20px;
        align-items: center;
    }
    #chart{
        width: 600px;
        height: 100%;
    }
    .force{
        circle {
            stroke: #fff;
            stroke-width: 1.5;
            fill: red;
            cursor: pointer;
        }
        text{
            fill: #fff;
            text-anchor: middle;
        }
        .link{
            stroke: yellow;
            stroke-width: 1
        }
    }

    .sunBurst {
        .text{
            pointer-events: none;
            text-anchor: middle;
            user-select: none;
            fill: #fff;
        }
        .path{
            cursor: pointer;
        }
    }
</style>