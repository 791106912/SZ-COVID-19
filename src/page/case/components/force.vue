<template>
    <div class="forceCom">
        <div id="chart"></div>
        <div class="legend">
            <div
                v-for="item in legendArr"
                :class="{'legend-item': true, disabled: disbaled.includes(item.name)}"
                :key="item.name"
                v-on:click="()=> selectType(item.name)"
            >
                <span class="legend-color" :style="{background: colorObj[item.name]}"></span>
                <span class="legend-name">{{item.name}}</span>
                <span class="legend-count">{{item.value}}</span>
                <span class="legend-percent">{{item.percent}}</span>
            </div>
        </div>
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
            const height = 680;
            const width = 680;

            const radius = Math.min(height, width) / 2;
            const forceRadius = [0, radius - 80];
            const fisheyeRadius = 100;
            const timeRadius = [radius - 60, radius - 40] ;
            const deminRadius = [radius - 30, radius];
            
            return {
                width,
                height,
                forceRadius,
                timeRadius,
                deminRadius,
                fisheyeRadius,
                legendArr: [],
                disbaled: [],
                selectKey: 'relation',
                selectGraph: null,
                selectData: TrackJSON,
                colorObj: {},
                selectMeth: 'mul',
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
                this.initLegend(this.selectKey)
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

                const valueArr = timeArr.map(d => d.value);
                valueArr.forEach((d, i) => {
                    const addition = valueArr[i - 1] ? valueArr[i - 1] : 0;
                    valueArr[i] = valueArr[i] + addition
                })
                timeArr.forEach((d, i) => {
                    d.value = valueArr[i]
                })
                const [min, max] = d3.extent(timeArr, d => d.value);
                const color = d3.scaleLinear()
                    .domain([min, max / 2, max])
                    .range(['#009688', '#ffc107', '#ff0000'])

                const pie = d3.pie()
                    .padAngle(0)
                    .sort(null)
                    .value(() => 1)

                const arc = d3.arc()
                    .innerRadius(this.timeRadius[0])
                    .outerRadius(this.timeRadius[1]);

                const arcs = pie(timeArr);

                this.svg
                    .append('g')
                    .classed('timeLine', true)
                    .selectAll("path")
                        .data(arcs)
                        .join("path")
                        .attr("fill", d => color(d.data.value))
                        .attr("d", arc)
                
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
                const _this = this;
                pathContainer
                    .selectAll("path")
                    .data(arcs)
                    .enter()
                    .append("path")
                    .attr("fill", d => color(d.data.name))
                    .attr("d", arc)
                    .attr('stroke', d => {
                        if(this.selectKey === d.data.sortkey) {
                            return '#fff'
                        }
                        return 'none'
                    })
                    .on('click', function(d) {
                        pathContainer
                            .selectAll('path')
                            .attr("stroke", 'none')
                        d3.select(this)
                            .attr("stroke", '#fff')
                        _this.initLegend(d.data.sortkey);
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
            initAggreGraph() {
                this.svg.select('g.force').remove();
                this.svg.select('g.aggre').remove();
                
                const useKey = this.selectKey
                const clusterPadding = 20
                const maxRadius = 10;
                const padding = 5;

                const nodes = this.selectData.map(d => ({
                    ...d,
                    radius: 5
                }))
                
                const line = d3.line().curve(d3.curveBasisClosed)
                const simulation = d3.forceSimulation()
                    .force('collide', d3.forceCollide(d => d.radius + padding))
                    .nodes(nodes, d => d.blh)
                    .restart();
                const aggreContainer = this.svg.append('g')
                    .classed('aggre', true);
                    
                const hullG = aggreContainer.append('g')
                    .attr('class', 'hulls');

                const color = d3.scaleOrdinal(d3.schemeCategory10)
                
                const node = aggreContainer.append('g')
                    .attr('class', 'nodes')
                    .selectAll('circle')
                    .data(nodes, d => d.blh)
                    .enter()
                    .append('circle')
                    .attr('r', d => d.radius)
                    .attr('fill', d => {
                        this.colorObj[d[useKey]] = color(d[useKey]);
                        return color(d[useKey])
                    })
                    .call(this.drag(simulation));

                const clusters = {};
                nodes.forEach(n => {
                    if (!clusters[n[useKey]] || (n.radius > clusters[n[useKey]].radius)) clusters[n[useKey]] = n;
                });

                const hullPoints = function (data) {
                    let pointArr = [];
                    const padding = 2.5;
                    data.each(d => {
                        const pad = d.radius + padding;
                        pointArr = pointArr.concat([
                        [d.x - pad, d.y - pad],
                        [d.x - pad, d.y + pad],
                        [d.x + pad, d.y - pad],
                        [d.x + pad, d.y + pad]
                        ]);
                    });
                    return pointArr;
                }
                
                const hulls = hullG
                    .selectAll('path')
                    .data(Object.keys(clusters).map(c => {
                    return {
                        [useKey]: c,
                        nodes: node.filter(d => d[useKey] == c)
                    };
                    }).filter(d => d[useKey] != 0), d => d[useKey])
                    .enter().append('path')
                    .attr('d', d => line(d3.polygonHull(hullPoints(d.nodes))))
                    .attr('fill', d => color(d[useKey]))
                    .attr('opacity', 0.4);

                const cluster = function(alpha) {
                    return function (d) {
                        const cluster = clusters[d[useKey]];
                        if (cluster === d || d[useKey] == 0) return;
                        let x = d.x - cluster.x,
                            y = d.y - cluster.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + cluster.radius + 3;
                        if (l != r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        cluster.x += x;
                        cluster.y += y;
                        }
                    };
                }

                const collide = (alpha) => {
                    const quadtree = d3.quadtree()
                        .x(d => d.x)
                        .y(d => d.y)
                        .extent([[0, 0], [this.width, this.height]])
                        .addAll(nodes);
                    return function (d) {
                        let r = d.radius + (maxRadius * 8) + Math.max(padding, clusterPadding),
                            nx1 = d.x - r,
                            nx2 = d.x + r,
                            ny1 = d.y - r,
                            ny2 = d.y + r;
                        quadtree.visit(function (quad, x1, y1, x2, y2) {
                        let data = quad.data;
                        if (data && data !== d) {
                            let x = d.x - data.x,
                                y = d.y - data.y,
                                l = Math.sqrt(x * x + y * y),
                                r = d.radius + data.radius + (d[useKey] == data[useKey] ? padding : clusterPadding);
                            if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            data.x += x;
                            data.y += y;
                            }
                        }
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                        });
                    };
                }

                simulation.on("tick", () => {
                    node
                    .each(cluster(0.2))
                    .each(collide(0.1))
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
                    
                    hulls
                    .attr('d', d => line(d3.polygonHull(hullPoints(d.nodes))));
                })
            },
            initForce() {
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

                const forceContainer = this.svg.append('g')
                    .classed('force', true)

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

                const fisheye = d3Fisheye.radial()
                    .radius(this.fisheyeRadius)
                    .distortion(2)
                    .smoothing(0.5);
                    
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
            },
            initLegend(key) {
                this.selectKey = key;
                this.disbaled = [];
                this.selectData = TrackJSON
                this.legendArr = aggre(key);

                if (this.selectKey === 'relation') {
                    this.selectGraph = this.initForce
                    this.selectData = TrackJSON.filter(d => d.relation === '聚集传播')
                    this.disbaled = ['其他']
                    this.selectMeth = 'only';
                } else {
                    this.selectGraph = this.initAggreGraph
                    this.selectMeth = 'mul';
                }
                this.selectGraph();
            },
            selectType(name) {
                if (this.selectMeth === 'only') {
                    this.disbaled= this.legendArr
                        .filter(d => !(d.name === name))
                        .map(d => d.name);
                } else {
                    this.disbaled.includes(name)
                        ? this.disbaled = this.disbaled.filter(d => !(d === name))
                        : this.disbaled.push(name)
                }

                this.selectData = TrackJSON.filter(d => !this.disbaled.includes(d[this.selectKey]));
                this.selectGraph();
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
    .legend{
        max-height: 80%;
        overflow-y: scroll;
        margin-left: 40px;
        min-width: 200px;
        .legend-item{
            display: flex;
            justify-content: space-between;
            cursor: pointer;
            align-items: center;
            width: 100%;
            &.disabled{
                opacity: .3;
            }
            &>span{
                text-overflow: hi;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .legend-color{
                height: 10px;
                width: 10px;
                border-radius: 100px;
            }
            .legend-name{
                width: 80px;
            }
            .legend-percent{
                width: 50px;
            }
            .legend-count{
                text-align: right;
                margin-right: 10px;
            }
        }
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