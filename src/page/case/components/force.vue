<template>
    <div class="forceCom">
        <div id="chart"></div>
        <div class="legend">
            <div
                v-for="item in deminArr"
                :class="{'legend-item': true, disabled: disbaled.includes(item.name)}"
                :key="item.name"
            >
                <span class="legend-color" :style="{background: colorObj[item.name]}"></span>
                <span class="legend-name">{{item.name}}</span>
            </div>
        </div>
    </div>
    
</template>

<script>
    import * as d3 from 'd3'
    import * as d3Fisheye from 'd3-fisheye'
    import _ from 'lodash'
    import TrackJSON from '@/data/track'
    import { initData, calculateNodeAndLink } from '../methods/dataProcessor'
    
    export default {
        name: 'Force',
        data() {
            initData();
            const height = 800;
            const width = 800;

            const radius = Math.min(height, width) / 2;
            const forceRadius = [0, radius - 80];
            const fisheyeRadius = 100;
            const timeRadius = [radius - 80, radius - 60] ;
            const deminRadius = [radius - 30, radius];
            const timeRange = d3.extent(TrackJSON, d => {
                return new Date(`2020/${d.realDate}`).getTime()
            });
            
            return {
                width,
                height,
                forceRadius,
                timeRadius,
                deminRadius,
                fisheyeRadius,
                deminArr: [],
                colorObj: {},
                disbaled: [],
                timeRange: timeRange,
                filterObj: {},
            }
        },
        methods: {
            drag: () => {
                function dragstarted(d) {
                    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
                
                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }
                
                function dragended(d) {
                    if (!d3.event.active) this.simulation.alphaTarget(0);
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

                this.selectData = TrackJSON;
                this.initTimeCircle();
                this.initDemiCircle();
                this.createForce();
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
                const deminArr = [{
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

                deminArr.forEach(d => {
                    this.filterObj[d.sortkey] = [];
                })

                this.deminArr = deminArr

                const deminData = _.chain(deminArr)
                    .map(d => {
                        const key = d.sortkey;
                        const deminDetailArr = _.chain(TrackJSON)
                            .map(key)
                            .uniq()
                            .map(d1 => ({
                                name: d1,
                                type: d.name,
                                sortkey: key,
                            }))
                            .value();
                        return deminDetailArr;
                    })
                    .flatten()
                    .value()

                const pie = d3.pie()
                    .padAngle(0)
                    .sort(null)
                    .value(() => 1)

                const arc = d3.arc()
                    // .cornerRadius(10)
                    .padAngle(0)
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
                    .attr("fill", d => {
                        this.colorObj[d.data.type] = color(d.data.type);
                        return color(d.data.type)
                    })
                    .attr("d", arc)
                    .attr('stroke','none')
                    .on('click', function(d) {
                        const {sortkey, name} = d.data;
                        if(_this.filterObj[sortkey].includes(name)) {
                            d3.select(this).attr('stroke', 'none');
                            _this.filterObj[sortkey] = _this.filterObj[sortkey].filter(d => d !== name);
                        } else {
                            d3.select(this).attr('stroke', '#fff');
                            _this.filterObj[sortkey].push(name);
                        }
                        _this.selectType();
                    })

                const text = container.append("g")
                    .classed('text', true)
                    .selectAll("text")
                    .data(arcs)
                    .join("text")
                    .attr("dy", "0.35em")

                text.append('path')
                    .attr('fill', 'none')
                    .attr('id', d => `hiddenArc${d.data.name}_${d.data.type}`)
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
                    .attr('href', d => `#hiddenArc${d.data.name}_${d.data.type}`)
                    .text(d => d.data.name);
            },
            createForce() {
                 this.simulation = d3.forceSimulation()
                    .force("link", d3.forceLink().id(d => d.blh))
                    .force("charge", d3.forceManyBody())
                    .force("x", d3.forceX())
                    .force("y", d3.forceY())
                    .on("tick", () => {
                        d3.selectAll('.linkItem')
                            .attr("x1", d => d.source.x)
                            .attr("y1", d => d.source.y)
                            .attr("x2", d => d.target.x)
                            .attr("y2", d => d.target.y);

                        d3.selectAll('.circleG')
                            .attr('transform', d => `translate(${d.x}, ${d.y})`)
                    });

                const fisheye = d3Fisheye.radial()
                    .radius(this.fisheyeRadius)
                    .distortion(2)
                    .smoothing(0.5);

                this.svg.on('mousemove', function() {
                    const mouse = d3.mouse(this);
                    fisheye.focus(mouse);
                    d3.selectAll('.circleG').each(d => {
                            d.fisheye = fisheye([d.x, d.y]);
                        })
                        .attr('transform', d => `translate(${d.fisheye[0]}, ${d.fisheye[1]})`)
                    d3.selectAll('.circleG')
                        .select('circle')
                        .attr('r', d => d.fisheye[2] * d.r);

                    d3.selectAll('.circleG')
                        .select('text')
                        .attr('font-size', d => d.fisheye[2] * 5);

                    d3.selectAll('.linkItem')
                        .attr("x1", d => d.source.fisheye[0])
                        .attr("y1", d => d.source.fisheye[1])
                        .attr("x2", d => d.target.fisheye[0])
                        .attr("y2", d => d.target.fisheye[1]);
                })

                const forceContainer = this.svg.append('g')
                    .classed('force', true)

                this.linkContainer = forceContainer.append('g').classed('links', true);
                this.nodeContainer = forceContainer.append('g').classed('nodes', true);
            },
            draw() {
                const [nodes, links] = calculateNodeAndLink(this.selectData);

                this.simulation.nodes(nodes);
                this.simulation.force("link").links(links);

                const linkUpdate = this.linkContainer
                    .selectAll(".linkItem")
                    .data(links, d => `${d.source.blh}_${d.target.blh}`);
                    
                linkUpdate.enter()
                    .append("line")
                    .classed('linkItem', true);

                linkUpdate.exit().remove();

                const nodeUpdate = this.nodeContainer
                    .selectAll(".circleG")
                    .data(nodes, d => d.blh)

                nodeUpdate.select('circle')
                        .attr('r', d => d.r)

                const newAddNode = nodeUpdate.enter()
                    .append('g')
                    .classed('circleG', true)
                    .call(this.drag())

                newAddNode.append("circle")
                    .attr('r', d => d.r)

                newAddNode.append("text")
                    .attr('font-size', 5)
                    .text(d => {
                        let showText = d.blh;
                        if(d.yqtblgx) {
                            const blharr = d.yqtblgx.match(/(\d+、?)+/g)[0];
                            showText = d.yqtblgx.split(blharr)[1];
                        }
                        return showText
                    })

                nodeUpdate.exit().remove();
                    
                this.simulation.alpha(1)
                    .alphaTarget(0)
                    .restart();
            },
            selectType() {
                this.selectData = TrackJSON.filter(d => {
                    let isKeep = true;
                    Object.keys(this.filterObj)
                        .filter(key => this.filterObj[key].length > 0)
                        .forEach(key => {
                            isKeep && (isKeep = this.filterObj[key].includes(d[key]))
                        })
                    return isKeep;
                }).filter(d => {
                    const timeSort = this.timeRange.concat(d.fbrq).map(d1 => new Date(d1).getTime());
                    return timeSort[2] >= timeSort[0] && timeSort[2] <= timeSort[1];
                });
                this.draw();
            }
        },
        mounted() {
            this.initChart();
            this.draw();
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
        margin-left: 40px;
        .legend-item{
            display: flex;
            justify-content: space-between;
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
                margin-right: 10px;
            }
            .legend-name{
                width: 80px;
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
        .linkItem{
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