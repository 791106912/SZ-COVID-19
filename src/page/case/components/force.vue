<template>
    <div class="forceCom">
        <div class="legend">
            <div
                v-for="item in deminArr"
                :class="{'legend-item': true, disabled: disbaled.includes(item.name)}"
                :key="item.name"
            >
                <span class="legend-name">{{item.name}}</span>
                <span class="legend-color" :style="{background: colorObj[item.name]}"></span>
            </div>
        </div>
        <div id="chart" ref='chart'></div>
        <div class="info">
            <Section title="病例信息">
                <div class="info-container">
                    <div
                        v-for="item in caseDetail"
                        :key="item.key"
                        class="info-item"
                    >
                    <span class="info-item-key">{{item.key}}</span>：
                    <span class="info-item-value">{{item.value}}</span>
                    </div>
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
    import Section from '@/components/section'
    import { initData, calculateNodeAndLink } from '../methods/dataProcessor'
    
    export default {
        name: 'Force',
        components: {
            Section,
        },
        data() {
            initData();
            const fisheyeRadius = 100;
            const timeRange = d3.extent(TrackJSON, d => {
                return new Date(d.realDate).getTime()
            });
            
            return {
                fisheyeRadius,
                deminArr: [],
                colorObj: {},
                disbaled: [],
                filterObj: {},
                timeRange: timeRange,
                caseDetail: [],
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
                this.svg = d3.select('#chart')
                    .append("svg")
                    .attr("viewBox", [0, 0, useLength, useLength])
                    .attr('width', useLength)
                    .attr('height', useLength)
                    .append('g')
                    .attr('transform', `translate(${useLength/2}, ${useLength/2})`)

                this.selectData = TrackJSON;
                this.initTimeCircle();
                this.initDemiCircle();
                this.createForce();
            },
            initTimeCircle() {
                const gapTimeArr = _.chain(TrackJSON)
                    .reduce((obj, d) => {
                        obj[d.realDate] = {
                            name: d.realDate,
                            value: obj[d.realDate] ? obj[d.realDate].value + 1 : 1,
                        }
                        return obj;
                    }, {})
                    .values()
                    .orderBy(d => new Date(d).getTime(), 'desc')
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
                    .text(d => d.data.name.replace('2020/', ''));
                    
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
                    .attr('cursor', 'pointer')
                    .attr('points', '0,10 -8,-8 8,-8')
                    .attr('transform', () => {
                        return `translate(${0}, ${radius * Math.sin( - Math.PI / 2)})`
                    })
                    .call(
                        d3.drag()
                        .on("drag", dragStart)
                    );

                container.append('polygon')
                    .attr('fill', 'red')
                    .attr('cursor', 'pointer')
                    .attr('points', '0,10 -8,-8 8,-8')
                    .attr('transform', () => {
                        return `translate(${0}, ${radius * Math.sin( - Math.PI / 2)})`
                    })
                    .call(
                        d3.drag()
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
                    name: '来源地(国内)',
                    sortkey: 'origin',
                }, {
                    name: '来源地(国外)',
                    sortkey: 'origin',
                }, {
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
                // const typeDir = {};
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
                            .attr("x1", d => d.source.x)
                            .attr("y1", d => d.source.y)
                            .attr("x2", d => d.target.x)
                            .attr("y2", d => d.target.y);
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
                this.calcualteDetailInfo();
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
                    .attr('cursor', 'pointer')
                    .on('click', d => {
                        this.calcualteDetailInfo(d)
                    })
                    .call(this.drag(this.simulation))

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
                this.forceRadius = [0, radius - 60];
                this.timeRadius = [radius - 60, radius - 40] ;
                this.deminRadius = [radius - 20, radius];
            },
            calcualteDetailInfo(d) {
                let info = [];
                if(d) {
                    const include = ['blh','xb', 'nl', 'yqtblgx',  'bk', 'fbrq', 'rysj', 'rbyy', 'bzzzytjd'];
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
                        "fbrq": "发病日期",
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
                            value: d[d1] || '暂无',
                        })
                    })
                } else {
                    info =[{
                        key: '展示病例数量',
                        value: this.selectData.length,
                    }, {
                        key: '男性',
                        value: this.selectData.filter(d => d.xb === '男').length,
                    }, {
                        key: '女性',
                        value: this.selectData.filter(d => d.xb === '女').length,
                    }]
                }
                this.caseDetail = info;
            }
        },
        mounted() {
            this.calcualteData()
            this.initChart();
            this.selectType();
        }
    }
</script>

<style lang="less">
    .forceCom{
        display: flex;
        padding-top: 20px;
        align-items: center;
        height: 100%;
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
        max-height: 80%;
        margin-right: 40px;
        .legend-item{
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            &.disabled{
                opacity: .3;
            }
            &>span{
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .legend-color{
                height: 10px;
                width: 10px;
                border-radius: 100px;
                margin-left: 10px;
            }
            .legend-name{
                width: 80px;
                text-align: right;
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

    .info {
        flex: 1;
        margin-left: 30px;
        .info-container{
            min-height: 200px;
            display: flex;
            height: 100%;
            flex-direction: column;
            justify-content: space-around;
        }
        .info-item{
            line-height: 30px;
            display: flex;
            .info-item-key{
                display: inline-block;
                width: 100px;
                font-weight: bolder;
                font-size: 14px;
            }
            .info-item-value{
                flex: 1
            }
        }
    }
</style>