<template>
    <div class="forceCom">
        <div class="forceCom-left">
            <div class="filter">
                <Section title="筛选条件">
                    <div
                        v-for="item in filterCondition"
                        class="filter-item"
                        :key="item.name"
                    >
                        <span class="filter-item-name">{{item.name}}</span>：
                        <span class="filter-item-value">{{item.value}}</span>
                    </div>
                </Section>
            </div>
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-item-icon">
                        <div class="legend-link min"></div>
                    </div>
                    <div class="legend-item-desc">病例关系</div>
                </div>
                <div class="legend-item">
                    <div class="legend-item-icon">
                        <div class="legend-circle min">0</div>
                    </div>
                    <div class="legend-item-desc">病例个体，点击选择</div>
                </div>
                <div class="legend-item">
                    <div class="legend-item-icon">
                        <div class="legend-pointer"></div>
                    </div>
                    <div class="legend-item-desc">指针，可拨动</div>
                </div>
                <div class="legend-item">
                    <div class="legend-item-icon">
                        <div class="legend-filter-one min">条件</div>
                    </div>
                    <div class="legend-item-desc">一级筛选条件，点击选择</div>
                </div>
                <div class="legend-item">
                    <div class="legend-item-icon">
                        <div class="legend-time min"></div>
                    </div>
                    <div class="legend-item-desc">二级筛选条件(确诊时间)，拨动指针选择</div>
                </div>
                <div class="legend-item">
                    <div class="legend-item-icon">
                        <div class="legend-filter-two min">条件</div>
                    </div>
                    <div class="legend-item-desc">二级筛选条件(其他)，点击选择</div>
                </div>
            </div>
        </div>
        <div id="chart" ref='chart'></div>
        <div class="info">
            <Section title="病例信息" class="infoData">
                <div v-if="caseDetail.length"
                    class="info-container"
                >
                    <div
                        v-for="item in caseDetail"
                        :key="item.key"
                        class="info-item"
                    >
                    <span class="info-item-key">{{item.key}}</span>：
                    <span class="info-item-value">{{item.value}}</span>
                    </div>
                </div>
                <NoData v-else title="请选择病例" />
            </Section>
            <Section title="选定病例关系" class="treeData" height="100%">
                <div class="tree-container">
                    <Tree :data="treeData" />
                </div>
            </Section>
        </div>
    </div>
    
</template>

<script>
    import * as d3 from 'd3'
    import * as d3Fisheye from 'd3-fisheye'
    import _ from 'lodash'
    import TrackJSON from '@/data/track'
    import province from '@/data/province'
    // import Bar from './bar'
    import Tree from './tree'
    import Section from '@/components/section'
    import NoData from '@/components/noData'
    import { initData, calculateNodeAndLink } from '../methods/dataProcessor'

    export default {
        name: 'Force',
        components: {
            Section,
            // Bar,
            NoData,
            Tree,
        },
        data() {
            initData();
            const fisheyeRadius = 80;
            const timeRange = d3.extent(TrackJSON, d => {
                return new Date(d.realDate).getTime()
            });
            this.TIME_RANGE = [...timeRange]
            return {
                treeData: [],
                fisheyeRadius,
                deminArr: [],
                colorObj: {},
                disbaled: [],
                filterObj: {},
                timeRange: timeRange,
                caseDetail: [],
                filterCondition: [],
            }
        },
        methods: {
            drag: simulation => {
                const dragstarted = d => {
                    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
                
                const dragged = d => {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }
                
                const dragended = d => {
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
                const useLength = Math.min(this.width, this.height) 

                d3.select('#chart').select('svg').remove()
                
                this.svg = d3.select('#chart')
                    .append("svg")
                    .attr("viewBox", [0, 0, useLength, useLength])
                    .attr('width', useLength)
                    .attr('height', useLength)
                    .append('g')
                    .attr('transform', `translate(${useLength/2}, ${useLength/2})`)
                    
                    const gradient = d3.select('#chart>svg')
                        .append('defs')
                        .append('radialGradient')
                        .attr('id', 'radial')

                    gradient
                        .append('stop')
                        .attr('offset', '0%')
                        .attr('style', 'stop-color: #1f468b;')
                    gradient
                        .append('stop')
                        .attr('offset', '100%')
                        .attr('style', 'stop-color: #0e2244;')

                    this.svg
                        .append('circle')
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('r', this.forceRadius[1])
                        .classed('circle-bg', true)

                    this.svg
                        .append('g')
                        .classed('fisheye-bg', true)
                        .append('circle')
                        .attr('r', this.fisheyeRadius)
                        .attr('fill', 'none')
                        .attr('display', 'none')

                this.selectData = TrackJSON;
                this.initTimeCircle();
                this.initDemiCircle();
                this.createForce();

                // 默认选中确诊时间
                this.svg.select('g[data-sortKey=qzDate]')
                    .dispatch('click')
            },
            initTimeCircle(type) {
                const gapTimeArr = _.chain(TrackJSON)
                    .reduce((obj, d) => {
                        obj[d.realDate] = {
                            name: d.realDate,
                            value: obj[d.realDate] ? obj[d.realDate].value + 1 : 1,
                        }
                        return obj;
                    }, {})
                    .values()
                    .orderBy(d => new Date(d.name).getTime())
                    .value();

                const oneDay = 24 * 3600 * 1000;
                const timeArr = [];
                gapTimeArr.forEach((d, i) => {
                    timeArr.push(d);
                    if(gapTimeArr[i+1]) {
                        const timeItemArr = [d.name, gapTimeArr[i+1].name].map(d1 => new Date(d1).getTime())
                        const timeSpace = timeItemArr[1] - timeItemArr[0] - oneDay;
                        const dayCount = timeSpace/oneDay;
                        for(let i = 1; i <= dayCount; i++){
                            timeArr.push({
                                name: new Date(timeItemArr[0] + i * oneDay).toLocaleDateString(),
                                value: d.value
                            })
                        }
                    }
                })

                const isQZDate = type === 'qzDate'

                if (type && !isQZDate) {
                    timeArr.length = 0
                    _.chain(TrackJSON)
                        .map(type)
                        .countBy()
                        .map((d, k) => ({
                            name: k,
                            value: d,
                            sortkey: type,
                        }))
                        .orderBy('name')
                        .forEach(d => {
                            timeArr.push(d)
                        })
                        .value()
                }

                const [min, max] = d3.extent(timeArr, d => d.value);
                const color = d3.scaleLinear()
                    .domain([min, max / 2, max])
                    .range(['#009688', '#ffc107', '#ff0000'])

                const pie = d3.pie()
                    .padAngle(0)
                    .sort(null)
                    .value(d => type && !isQZDate ? d.value : 1)

                const arc = d3.arc()
                    .innerRadius(this.timeRadius[0])
                    .outerRadius(this.timeRadius[1]);

                if(type) {
                    pie.padAngle(0.01)
                    // arc.cornerRadius(10)
                }

                const arcs = pie(timeArr);

                this.svg.select('g.timeLine').remove()

                const container = this.svg.append('g')
                    .classed('timeLine', true);
                
                const _this = this

                const arcG = container
                    .selectAll('g.timelineArc')
                    .data(arcs)
                    .enter()
                    .append('g')
                    .classed('timelineArc', true)
                    .on('click', function(d) {
                        if (!type || isQZDate) return
                        const { name } = d.data;
                        const arc = d3.select(this)
                            .select('path.normal')
                        const arcBigger = d3.select(this)
                            .select('path.bigger')

                        if(_this.filterObj[type].includes(name)) {
                            arc.classed('arc-none', false)
                            arcBigger.classed('arc-none', true)
                            _this.filterObj[type] = _this.filterObj[type].filter(d => d !== name);
                        } else {
                            arc.classed('arc-none', true)
                            arcBigger.classed('arc-none', false)
                            _this.filterObj[type].push(name);
                        }
                        _this.selectType();
                    })

                arcG.append('path')
                    .attr("fill", d => type && !isQZDate ?  '#116cd5' : color(d.data.value))
                    .attr("d", arc)
                    .attr("stroke", () => type ? '#aaa' : 'none')
                    .attr('cursor', () => type ? 'pointer' : null)
                    .classed('normal', true)
                    .transition()
                    .duration(300)
                    .ease(d3.easeCubicIn)
                    .attrTween('d',function(d){
                        const a = d3.interpolate(d.startAngle,d.endAngle);
                        return function(t){
                            d.endAngle   = a(t);
                            return arc(d);
                        };
                    })

                const arcBigger = d3.arc()
                    .innerRadius(this.timeRadius[0])
                    .outerRadius(this.timeRadius[1] + 5);

                arcG.append('path')
                    .attr("fill", d => type ? '#116cd5' : color(d.data.value))
                    .attr("d", arcBigger)
                    .attr('cursor', () => type ? 'pointer' : null)
                    .classed('bigger', true)
                    .classed('arc-none', true)

                const text = arcG.append('text')
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
                    .text(d => d.data.name.replace('2020/', ''))
                    .attr('display', function(d) {
                        const { width } = this.getBoundingClientRect()
                        const rad = d.endAngle - d.startAngle
                        const [innerRadius] = _this.timeRadius;
                        const calWidth =  innerRadius * rad
                        return type && width >= calWidth ? 'none' : null
                    });

                const radius = this.timeRadius[1] + (this.deminRadius[0] - this.timeRadius[1]) / 2;

                const indexScale = d3.scaleLinear()
                        .domain([0, 1])
                        .range([0, timeArr.length - 1]);

                function dragStart(){
                    let rad = Math.atan2(d3.event.y, d3.event.x);
                    d3.select(this)
                        .style('transform', () => {
                            const x = radius * Math.cos(rad);
                            const y = radius * Math.sin(rad);
                            rad += Math.PI / 2;
                            if(rad < 0)  rad = Math.PI * 2 + rad
                            const scale = rad / (Math.PI * 2) * 360;
                            return `translate(${x}px, ${y}px) rotate(${scale}deg)`
                        })
                }

                const dragEnd = (index) => {
                    let rad = Math.atan2(d3.event.y, d3.event.x);
                    rad += Math.PI / 2;
                    if(rad < 0)  rad = Math.PI * 2 + rad
                    const scale = rad / (Math.PI * 2);
                    // const timeIndex = Math.ceil(indexScale(scale));
                    const timeIndex = parseInt(indexScale(scale));
                    const timeItem = new Date(timeArr[timeIndex].name).getTime();
                    // if(timeItem <= this.timeRange[0]) {
                        // index = 0
                    // } else if(timeItem >= this.timeRange[1]) {
                        // index = 1;
                    // }
                    this.timeRange[index] = timeItem;
                    this.selectType();
                }

                container.append('polygon')
                    .attr('fill', 'yellow')
                    .attr('fill', '#fff')
                    .attr('cursor', 'pointer')
                    .attr('points', '0,10 -8,-8 8,-8')
                    .attr('transform', () => {
                        return `translate(${0}, ${radius * Math.sin( - Math.PI / 2)})`
                    })
                    .attr('display', () => type && !isQZDate ? 'none' : null)
                    .call(
                        d3.drag()
                        .on("drag", dragStart)
                    )

                container.append('polygon')
                    .attr('fill', 'red')
                    .attr('fill', '#1778e8')
                    .attr('cursor', 'pointer')
                    .attr('points', '0,10 -8,-8 8,-8')
                    .attr('transform', () => {
                        return `translate(${0}, ${radius * Math.sin( - Math.PI / 2)})`
                    })
                    .attr('display', function() {
                        return type && !isQZDate ? 'none' : null})
                    .call(
                        d3.drag()
                        .on("drag", dragStart)
                        .on("end",  () =>  dragEnd(1))
                    )
            },
            initDemiCircle() {
                const deminArr = [{
                    name: '染病原因',
                    sortkey: 'reason',
                }, {
                    name: '确诊时间',
                    sortkey: 'qzDate',
                },
                {
                    name: '年龄',
                    sortkey: 'nlRange',
                }, 
                {
                    name: '来源地',
                    sortkey: 'origin'
                },
                {
                    name: '病例关系',
                    sortkey: 'relation',
                }]

                deminArr.forEach(d => {
                    this.filterObj[d.sortkey] = [];
                })

                this.deminArr = deminArr

                const deminData = _.chain(deminArr)
                    .map(d => {
                        const key = d.sortkey;
                        let useData = TrackJSON;
                        if (d.name === '来源地(国外)') {
                            useData = TrackJSON.filter(d1 => !province.includes(d1[key]))
                        } else if(d.name === '来源地(国内)') {
                            useData = TrackJSON.filter(d1 => province.includes(d1[key]))
                        }
                        const deminDetailArr = _.chain(useData)
                            .map(key)
                            .uniq()
                            .map(d1 => ({
                                name: d1,
                                type: d.name,
                                sortkey: key,
                            }))
                            .value();

                        if(key === 'nlRange') {
                            deminDetailArr.sort((a, b) => {
                                const arr = [a, b].map(d1 => Number(d1.name.split('~')[0]));
                                return arr[0] - arr[1];
                            })
                        }
                        return deminDetailArr;
                    })
                    .flatten()
                    .value()

                this.forignOrigin = deminData.filter(d => d.type === "来源地(国外)")
                    .map(d => d.name)

                const pie = d3.pie()
                    .padAngle(.005)
                    .sort(null)
                    .value(d => {
                        if (['origin'].includes(d.sortkey)) return .8
                        return 1
                    })

                const arc = d3.arc()
                    // .cornerRadius(10)
                    // .padAngle(0)
                    .innerRadius(this.deminRadius[0])
                    .outerRadius(this.deminRadius[1]);

                const arcBigger = d3.arc()
                    .innerRadius(this.deminRadius[0])
                    .outerRadius(this.deminRadius[1] + 5);

                const arcs = pie(deminArr);

                const container = this.svg
                    .append('g')
                    .classed('sunBurst', true)

                const _this = this

                const arcG = container
                    .selectAll('g.sunBurstArc')
                    .data(arcs)
                    .enter()
                    .append('g')
                    .classed('sunBurstArc', true)
                    .attr('data-sortKey', d => d.data.sortkey)
                    .on('click', function(d) {
                        const {sortkey} = d.data;
                        const arc = d3.select(this)
                            .select('path.normal')
                        const arcBigger = d3.select(this)
                            .select('path.bigger')
                        const arcG = d3.select(this.parentNode)
                        if (arcBigger.classed('arc-none')) {
                            arcG.selectAll('path.normal')
                                .classed('arc-none', false)
                            arcG.selectAll('path.bigger')
                                .classed('arc-none', true)
                            arcBigger.classed('arc-none', false)
                            arc.classed('arc-none', true)
                            _this.initTimeCircle(sortkey === 'qzDate' ? undefined : sortkey)
                        } else {
                            arcG.selectAll('path.normal')
                                .classed('arc-none', false)
                            arcG.selectAll('path.bigger')
                                .classed('arc-none', true)
                            _this.initTimeCircle()
                        }
                        // 重置选择的时间范围
                        _this.timeRange = [..._this.TIME_RANGE]
                        _this.selectType()
                    })


                arcG.append('path')
                    .attr('fill', '#2f50a5')
                    .attr("d", arc)
                    .attr('stroke','none')
                    .classed('normal', true)
                    .classed('arc-none', false)
                    

                arcG.append('path')
                    .attr('fill', '#2f50a5')
                    .attr("d", arcBigger)
                    .attr('stroke','none')
                    .classed('bigger', true)
                    .classed('arc-none', true)
                    
                
                const text = arcG.append("text")
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
                        // let invertDirection = '';
                        // if (typeDir[d.data.type]) {
                        //     invertDirection = typeDir[d.data.type];
                        // } else {
                        //     invertDirection = middleAngle > 0 && middleAngle < Math.PI
                        //     typeDir[d.data.type] = invertDirection;
                        // }
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
            pythag(r, b, coord) {
                const radius = this.forceRadius[1];
                const hyp2 = Math.pow(radius, 2);
                r += 5;
                b = Math.min(radius * 2 - r, Math.max(r, b));
                var b2 = Math.pow(
                    (b - radius), 2
                ),
                a = Math.sqrt(hyp2 - b2);
                coord = Math.max(
                    radius - a + r,
                    Math.min(a + radius - r, coord)
                );
                return coord;
            },
            createForce() {
                this.simulation = d3.forceSimulation()
                    .force("link", d3.forceLink()
                        .id(d => d.blh)
                    )
                    .force("charge", 
                        d3.forceManyBody().strength(-20)
                    )
                    .force("x", d3.forceX())
                    .force("y", d3.forceY())
                    // .force('center', d3.forceCenter(0, 0))// 向心力
                    // .force('collide',d3.forceCollide()  // 圆的碰撞力
                    //     .radius(10)  // 根据指定的半径创建一个碰撞力。默认为 1
                    // )
                    // .force('r', d3.forceRadial(
                    //         this.forceRadius[1],0,0
                    //     ).strength(.5))
                    .on("tick", () => {
                        d3.selectAll('.circleG')
                            .attr('transform', d => {
                                //  d.x = this.pythag(d.r, d.y, d.x); 
                                // d.y = this.pythag(d.r, d.x, d.y);
                                return `translate(${d.x}, ${d.y})`
                            });

                        d3.selectAll('.linkItem')
                            .attr('transform', d => {
                                return `translate(${d.source.x}, ${d.source.y})`
                            })
                            .select('line')
                            .attr("x1", 0)
                            .attr("y1", 0)
                            .attr("x2", d => d.target.x - d.source.x)
                            .attr("y2", d => d.target.y - d.source.y);
                        
                        d3.selectAll('.linkItem')
                            .select('text')
                            .attr('dx', d => (d.target.x - d.source.x) / 2)
                            .attr('dy', d => (d.target.y - d.source.y) / 2)
                    });

                const fisheye = d3Fisheye.radial()
                    .radius(this.fisheyeRadius)
                    .distortion(2)
                    .smoothing(0.5);

                const _this = this

                const forceContainer = this.svg.append('g')
                    .classed('force', true)

                this.svg.on('mousemove', function() {
                    const mouse = d3.mouse(this);
                    _this.simulation.stop()
                    fisheye.focus(mouse);
                    d3.selectAll('.circleG').each(d => {
                            d.fisheye = fisheye([d.x, d.y]);
                        })
                        .attr('transform', d => `translate(${d.fisheye[0]}, ${d.fisheye[1]})`)
                        .attr('opacity', d => d.fisheye[2] === 1 ? '.2' : '1')
                        
                    d3.selectAll('.circleG')
                        .select('circle')
                        .attr('r', d => {
                            const r = d.fisheye[2] * d.r;
                            if(r>12) {
                                return 12;
                            }
                            return r
                        });

                    d3.selectAll('.circleG')
                        .select('text')
                        .attr('font-size', d => {
                            const r =  d.fisheye[2] * 5;
                            if(r>9) {
                                return 9;
                            }
                            return r
                        });

                    d3.selectAll('.linkItem')
                        .attr('transform', d => {
                            return `translate(${d.source.fisheye[0]}, ${d.source.fisheye[1]})`
                        })
                        .select('line')
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", d => d.target.fisheye[0] - d.source.fisheye[0])
                        .attr("y2", d => d.target.fisheye[1] - d.source.fisheye[1])
                        .attr('opacity', d => (d.target.fisheye[2] === 1 || d.source.fisheye[2] === 1) ? '.2' : '1')

                    d3.selectAll('.linkItem')
                        .select('text')
                        .attr('font-size', d => d.source.fisheye[2] * 5)
                        .attr('dx', d => (d.target.fisheye[0] - d.source.fisheye[0]) / 2)
                        .attr('dy', d => (d.target.fisheye[1] - d.source.fisheye[1]) / 2)
                        .attr('transform', d => {
                            const { atan, abs, PI} = Math
                            const [x1, y1] = d.source.fisheye
                            const [x2, y2] = d.target.fisheye
                            const x = abs(x2 - x1)
                            const y = abs(y2 - y1)
                            const rad = atan(y / x)
                            const ang = 180 / PI * rad
                            return `rotate(${ang}, ${(x2 - x1) / 2}, ${(y2 - y1) / 2})`
                        })
                        .attr('display', d => d.target.fisheye[2] === 1 ? 'none' : null)

                    const mouseR = Math.sqrt(mouse.reduce((c, d) => c + Math.pow(d, 2), 0))
                    
                    // 鱼眼背景
                    const fisheyeBg = d3.select('.fisheye-bg>circle')
                            .attr('cx', mouse[0])
                            .attr('cy', mouse[1])
                            .attr('display', null)

                    // 鼠标移出后移除效果
                    if (mouseR > (_this.forceRadius[1])) {
                        fisheyeBg.attr('display', 'none')
                        _this.simulation.restart();

                        d3.selectAll('.circleG')
                            .attr('transform', d => `translate(${d.x}, ${d.y})`)
                            .attr('opacity', 1)

                        d3.selectAll('.circleG')
                            .select('circle')
                            .attr('r', d => d.r);

                        d3.selectAll('.circleG')
                            .select('text')
                            .attr('font-size', 5);

                        d3.selectAll('.linkItem')
                            .attr('transform', d => `translate(${d.source.x}, ${d.source.y})`)
                            .select('line')
                            .attr('opacity', 1)
                            .attr("x1", 0)
                            .attr("y1", 0)
                            .attr("x2", d => d.target.x - d.source.x)
                            .attr("y2", d => d.target.y - d.source.y)
                        
                        d3.selectAll('.linkItem')
                            .select('text')
                            .attr('font-size', 5)
                    }
                })

                this.linkContainer = forceContainer.append('g').classed('links', true);
                this.nodeContainer = forceContainer.append('g').classed('nodes', true);
            },
            draw() {
                this.treeData = [];
                this.calcualteDetailInfo();
                this.calcualteDetailInfo(-1);
                const [nodes, links] = calculateNodeAndLink(this.selectData);

                this.simulation.nodes(nodes);
                this.simulation.force("link").links(links);

                const linkUpdate = this.linkContainer
                    .selectAll(".linkItem")
                    .data(links, d => `${d.source.blh}_${d.target.blh}`);
                
                const linkG = linkUpdate.enter()
                    .append('g')
                    .classed('linkItem', true);

                linkG.append("line")

                linkG.append('text')
                    .attr('font-size', 5)
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('dx', d => (d.target.x - d.source.x) / 2)
                    .attr('dy', d => (d.target.y - d.source.y) / 2)
                    .attr('display', 'none')
                    .text(d => {
                        let showText = d.target.blh;
                        if(d.target.yqtblgx) {
                            const blharr = d.target.yqtblgx.match(/(\d+、?)+/g)[0];
                            showText = d.target.yqtblgx.split(blharr)[1];
                        }
                        return showText
                    })

                linkUpdate.exit().remove();

                const nodeUpdate = this.nodeContainer
                    .selectAll(".circleG")
                    .data(nodes, d => d.blh)

                nodeUpdate.select('circle')
                        .attr('r', d => d.r)

                const newAddNode = nodeUpdate.enter()
                    .append('g')
                    .classed('circleG', true)
                    .attr('cursor', 'pointer')
                    .on('click', d => {
                        const relationArr = links.reduce((arr, d1) => {
                            if(d1.source.blh === d.blh) {
                                arr.push(d1.target)
                            } else if( d1.target.blh === d.blh ){
                                arr.push(d1.source)
                            }
                            return arr;
                        }, [])
                        var obj = {
                            name: d.blh,
                            children: [],
                        }
                        relationArr.forEach(d => {
                            const blharr = d.yqtblgx.match(/(\d+、?)+/g)[0];
                            const showText = d.yqtblgx.split(blharr)[1];
                            obj.children.push({
                                name: `${d.blh}(${showText})`,
                            })
                        })
                        this.treeData = obj;
                        this.calcualteDetailInfo(d)
                    })
                    .call(this.drag(this.simulation))
                    .on('mouseout', function() {
                        d3.event.preventDefault()
                        d3.event.stopImmediatePropagation()
                        return false
                    })

                newAddNode.append("circle")
                    .attr('r', d => d.r)

                newAddNode.append("text")
                    .attr('font-size', 5)
                    .text(d => {
                        let showText = d.blh;
                        return showText
                    })

                nodeUpdate.exit().remove();
                    
                this.simulation.alpha(.3)
                    .alphaTarget(0)
                    .restart();
            },
            selectType() {
                console.log(this.timeRange.map(d => new Date(d).toLocaleDateString()));
                this.selectData = TrackJSON.filter(d => {
                    let isKeep = true;
                    Object.keys(this.filterObj)
                        .filter(key => this.filterObj[key].length > 0)
                        .forEach(key => {
                            isKeep && (isKeep = this.filterObj[key].includes(d[key]))
                        })
                    return isKeep;
                }).filter(d => {
                    const timeStap = new Date(d.realDate).getTime();
                    return timeStap >= this.timeRange[0] && timeStap <= this.timeRange[1];
                });
                const strengthScale = d3.scaleLinear().domain([TrackJSON.length, 0]).range([18, 40])
                const forceCount = strengthScale(this.selectData.length);
                this.simulation.force("charge", 
                    d3.forceManyBody().strength(-forceCount)
                )
                this.draw();
            },
            calcualteData() {
                const height = this.$refs.chart.offsetHeight;
                const width = this.$refs.chart.offsetWidth;
                const radius = Math.min(height, width) / 2;
                this.width = width;
                this.height = height;
                this.forceRadius = [0, radius - 70];
                this.timeRadius = [radius - 70, radius - 50] ;
                this.deminRadius = [radius - 30, radius - 10];
            },
            calcualteDetailInfo(d) {
                let info = [];
                if(d) {
                    const include = ['blh','xb', 'nl',  'bk', 'fbrq', 'rysj', 'rbyy', 'bzzzytjd'];
                    const descObj = {
                        "yqtblgx": "与其他病例关系",
                        "zwhsjqj": "在武汉时间",
                        "rbyy": "染病原因",
                        "bzzzytjd": "备注",
                        "bk": "病况",
                        "xb": "性别",
                        "rysj": "入院时间",
                        "lssj": "来深时间",
                        "fbingsj": "发病时间",
                        "fbrq": "确诊日期",
                        "jzd": "居住地",
                        "fbusj": "发布时间",
                        "nl": "年龄",
                        "blh": "病例号",
                        "nationality&native":"国籍和籍贯（国内有籍贯者记录籍贯）",
                        "track":"途径地",
                        "track_time":"途径地的时间",
                        "track_trans":"途径交通工具",
                        "treatment_hospital":"救治医院"
                    }
                    include.forEach(d1 => {
                        info.push({
                            key: descObj[d1],
                            value: d === -1 ? '' : d[d1] || '暂无',
                        })
                    })
                    this.caseDetail = info
                } else {
                    const filterArr = [];
                    const deminArr = this.deminArr.map(d => ({
                        name: d.name,
                        sortkey: d.name === '来源地(国外)' ? 'forignOrigin' : d.sortkey,
                    }))

                    const dateRange = this.timeRange.join('~') === this.TIME_RANGE.join('~')
                        ? []
                        : [this.timeRange.map(d => {
                            const date  = new Date(d)
                            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
                            }).join('~')]
                    
                    const filterObj = {
                        ...this.filterObj,
                        qzDate: dateRange,
                    }
                    
                    _.chain(filterObj)
                        .keys()
                        .forIn(key => {
                            filterArr.push({
                                name: deminArr.find(d => d.sortkey === key).name,
                                value: filterObj[key].join(', ') || '全部',
                            })
                        })
                        .value();
                    filterArr.push({
                        name: '病例数量',
                        value: this.selectData.length,
                    })
                    this.filterCondition = filterArr;
                }
            },
            handleReset() {
                const chartContainer = d3.select('#chart')
                    .on('click.reset', () => {
                        if(d3.event.target === chartContainer
                            || d3.event.target === chartContainer.querySelector('svg')) {
                                this.timeRange = d3.extent(TrackJSON, d => {
                                    return new Date(d.realDate).getTime()
                                });
                                this.initChart()
                                this.selectType();
                            }
                    })
                    .node()
            },
        },
        mounted() {
            this.calcualteData()
            this.initChart();
            this.selectType();
            this.handleReset()
        }
    }
</script>

<style lang="less">
    .forceCom{
        display: flex;
        padding-top: 20px;
        align-items: center;
        height: 100%;
        position: relative;
    }
    .forceCom-left {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        height: 100%;
        width: 20%;
    }
    .filter {
        width: 100%;
        font-size: 14px;
        .section {
            width: 100%;
            padding-bottom: 10px;
            .section-body {
                min-height: 150px;
                width: 100%;
                line-height: 2.5em;
                display: flex;
                justify-content: center;
                flex-direction: column;
            }
        }
        .filter-item {
            width: 100%;
            display: flex;
            .filter-item-name{
                text-align: right;
                width: 80px;
                font-size: 14px;
            }
            .filter-item-value{
                flex: 1;
            }
        }
    }
    #chart{
        width: 50%;
        height: 100%;
        min-width: 700px;
        min-height: 700px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .legend{
        .legend-item{
            display: flex;
            align-items: center;
            margin-top: 10px;
            .legend-item-icon{
                width: 40px;
                text-align: center;
                &>div{
                    display: inline-block;
                }
                .legend-circle{
                    height: 22px;
                    width: 22px;
                    line-height: 22px;
                    text-align: center;
                    border-radius: 40px;
                    font-size: 12px;
                    color: #fff;
                    background: rgba(255, 0, 0, 0.45);
                    border: solid 1px rgba(255, 255, 255, 0.5);
                }
                .legend-link{
                    margin-bottom:3px;
                    height: 1px;
                    width: 40px;
                    background: rgba(255, 0, 0, 0.45);
                }
                .legend-pointer{
                    width: 0;
                    height: 0;
                    border: 8px solid transparent;
                    border-top: 14px solid #1778e8;
                    transform: translateY(6px);
                }
                .legend-time{
                    height: 20px;
                    width: 40px;
                    background: linear-gradient(to right, #009688, #ffc107, #ff0000);
                }
                .min {
                    transform: scale(.8)
                }
                .legend-filter-one{
                    height: 20px;
                    width: 40px;
                    background: #2f50a5;   
                }
                .legend-filter-two{
                    height: 20px;
                    width: 40px;
                    background: #116cd5;
                    border: solid 1px #aaa;
                }
            }
            .legend-item-desc{
                margin-left: 10px;
            }
        }
    }
    .force{
        circle {
            stroke: #fff;
            stroke: rgba(255, 255, 255, 0.5);
            stroke-width: 1;
            fill: #bf5658;
            fill: rgba(255, 0, 0, 0.45);
            cursor: pointer;
        }
        text{
            fill: #fff;
            text-anchor: middle;
        }
        .linkItem{
            stroke: rgba(255, 0, 0, 0.45);
            stroke-width: 1;
            text{
                stroke: #fff;
                stroke-width: .2;
            }
        }
    }

    .timeLine {
        .timelineArc {
            transition: .3s;
        }
    }

    .sunBurst {
        .sunBurstArc {
            transition: .3s;
            &>path {
                cursor: pointer;
            }
            &>text {
                pointer-events: none;
                text-anchor: middle;
                user-select: none;
                fill: #fff;
            }
        }
    }

    .info {
        height: 100%;
        flex: 1;
        display: flex;
        margin-left: 30px;
        flex-direction: column;
        justify-content: space-between;
        .infoData{
            height: 50%;
        }
        .info-container{
            min-height: 200px;
            display: flex;
            height: 100%;
            flex-direction: column;
            justify-content: space-around;
        }
        .info-item{
            height: 50%;
            line-height: 30px;
            display: flex;
            .info-item-key{
                display: inline-block;
                width: 100px;
                font-weight: bolder;
                font-size: 14px;
                text-align: right;
            }
            .info-item-value{
                flex: 1;
                white-space: pre-wrap;
            }
        }
        .treeData {
            height: 50%;
            margin-bottom: 0;
            .tree-container{
                height: 100%;
            }
        }
    }
    .circle-bg {
        fill:url(#radial)
    }
    .fisheye-bg>circle {
        fill: #4f659b;
        opacity: .3;
    }
    .arc-none {
        display: none;
    }
</style>