<template>
    <div id="force-chart">
    </div>
</template>

<script>
    import * as d3 from 'd3'
    import * as d3Fisheye from 'd3-fisheye'
    import _ from 'lodash'
    import RelationJSON from '../data/relation'
    
    export default {
        name: 'Force',
        data() {
            const height = 680;
            const width = 680;

            const radius = Math.min(height, width) / 2;

            const forceRadius = [0, radius - 80];

            const fisheyeRadius = 100;

            const timeRadius = [radius - 60, radius - 40] ;

            const deminRadius = [radius - 20, radius];
            
            return {
                width,
                height,
                padding: 5,
                maxRadius: 10,
                clusterPadding: 20,
                forceRadius,
                timeRadius,
                deminRadius,
                fisheyeRadius
            }
        },
        methods: {
            aggre(sortkey) {
                return _.chain(RelationJSON)
                    .reduce((obj, d) => {
                        const key = d[sortkey] === '' ? '未知' : d[sortkey];
                        obj[key] = {
                            name: key,
                            value: obj[key] ? obj[key].value + 1 : 1,
                        }
                        return obj;
                    }, {})
                    .values()
                    .sortBy('value')
                    .value()
            },
            initChart() {
                this.svg = d3.select('#force-chart')
                    .append("svg")
                    .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])

                this.initTimeCircle();
                this.initForce();
                this.initDemiCircle();
            },
            initForce() {
                const links = [];
                let nodes = RelationJSON;
                const linkIds = [];

                _.forIn(nodes, d => {
                    const relation = d.yqtblgx;
                    const targetId = d.blh;
                    if (relation) {
                        const relationArr = relation.match(/\d+/g);
                        relationArr.forEach(sourceid => {
                            linkIds.push(sourceid, targetId)
                            links.push({
                               source: sourceid,
                               target: targetId,
                            })
                        })
                    }
                })

                nodes.forEach(d => {
                    const count = linkIds.filter(d1 => d1 === d.blh).length;
                    const r = 3;
                    d.r = r + count * 2;
                })

                nodes = nodes.filter(d => d.r > 3)

                
                const drag = simulation => {
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
                }

                const simulation = d3.forceSimulation(nodes)
                    .force("link", 
                        d3.forceLink(links).id(d => d.blh)
                        .distance(20)
                    )
                    .force("charge", 
                        d3.forceManyBody()
                            .strength(-30)
                    )
                    .force("x", d3.forceX())
                    .force("y", d3.forceY());

                const forceContainer = this.svg.append('g')
                    .classed('force', true)

                const link = forceContainer
                    .append("g")
                    .classed('link', true)
                    .attr("stroke", "yellow")
                    .selectAll("line")
                    .data(links)
                    .join("line")
                    .attr("stroke-width", 1);

                const node = forceContainer.append("g")
                    .classed('node', true)
                    .selectAll(".circleG")
                    .data(nodes)
                    .enter()
                    .append('g')
                    .classed('circleG', true)
                    .attr('transform', d => `translate(${d.x}, ${d.y})`)
                    .call(drag(simulation));

                node.append("circle")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5)
                    .attr("r", d => d.r)
                    .attr("fill", 'red')

                node.append("text")
                    .text(d => {
                        let showText = d.blh;
                        if(d.yqtblgx) {
                            const blharr = d.yqtblgx.match(/(\d+、?)+/g)[0];
                            showText = d.yqtblgx.split(blharr)[1];
                        }
                        return showText
                    })
                    .attr('fill', '#fff')
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '5');

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

                this.svg.node();
            },
            initTimeCircle() {
                const timeArr = _.chain(RelationJSON)
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
                RelationJSON.forEach(d => {
                    let nlRange = ''
                    const nl = Number(d.nl);
                    if (nl <= 10) {
                        nlRange = '0~10岁'
                    } else if (nl > 10 && nl <= 20) {
                        nlRange = '10~20岁'
                    } else if (nl > 20 && nl <= 40) {
                        nlRange = '20~40岁'
                    } else if (nl > 40 && nl <= 60) {
                        nlRange = '40~60岁'
                    } else {
                        nlRange = '60岁以上'
                    }
                    d.nlRange = nlRange;
                })
                const reasonData = this.aggre('reason');
                const ageData = this.aggre('nlRange');
                const sexData = this.aggre('xb');

                const deminData = {
                    name: 'root',
                    children: [
                        {
                            name: 'reason',
                            count: _.sumBy(reasonData, 'value'),
                            children: reasonData.map( d => ({
                                name: d.name,
                                value: d.value,
                            }))
                        }, {
                            name: 'age',
                            count: _.sumBy(ageData, 'value'),
                            children: ageData.map( d => ({
                                name: d.name,
                                value: d.value,
                            }))
                        }, {
                            name: 'sex',
                            count: _.sumBy(sexData, 'value'),
                            children: sexData.map( d => ({
                                name: d.name,
                                value: d.value,
                            }))
                        }
                    ] 
                }
                const partition = data => {
                    const root = d3.hierarchy(data)
                        .sum(d => d.value)
                        .sort((a, b) => b.value - a.value);
                    return d3.partition()
                        .size([2 * Math.PI, root.height + 1])(root);
                }

                const root = partition(deminData)
                root.each(d => d.current = d);

                const g = this.svg.append("g")
                    .classed('sunBrued', true)

                const color = d3.scaleOrdinal(d3.quantize(d3.interpolateSinebow, deminData.children.length + 1))

                const arc = d3.arc()
                    .startAngle(d => d.x0)
                    .endAngle(d =>d.x1)
                    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                    .padRadius(0)
                    .innerRadius(this.deminRadius[0])
                    .outerRadius(this.deminRadius[1])

                 g.append("g")
                    .selectAll("path")
                    .data(root.descendants().slice(1))
                    .join("path")
                    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
                    .attr("d", d => {
                        return arc(d.current)
                    });
                const labelTransform = d => {
                    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                    const y = (d.y0 + d.y1) / 2 * 200;
                    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
                }
                // g.append("g")
                //     .attr("pointer-events", "none")
                //     .attr("text-anchor", "middle")
                //     .style("user-select", "none")
                //     .selectAll("text")
                //     .data(root.descendants().slice(1))
                //     .join("text")
                //     .attr("dy", "0.35em")
                //     .attr("fill", "#fff")
                //     .attr("transform", d => {
                //         return labelTransform(d.current)
                //     })
                //     .text(d => d.data.name);
            },
            initChart2() {
                const numClusters = 20
                const maxRadius = 10
                const radius = d3.scaleLinear().domain([0, 10]).range([3, maxRadius]);

                const noClusterNodes = d3.range(50).map(idx => {
                    return {
                        id: idx,
                        cluster: 0,
                        radius: 3,
                        x: Math.random() * this.width,
                        y: Math.random() * this.height
                    };
                });
                const clusterNodes = d3.range(250).map(idx => {
                    const i = Math.floor(Math.random() * numClusters);
                    const r = Math.sqrt((i + 1) / numClusters * -Math.log(Math.random())) * maxRadius;
                    return {
                        id: idx + 50,
                        cluster: i,
                        radius: radius(r),
                        x: Math.random() * this.width,
                        y: Math.random() * this.height
                    };
                });
                const nodes = noClusterNodes.concat(clusterNodes);

                const clusterMap = {};
                nodes.forEach(n => {
                    if (!clusterMap[n.cluster] || (n.radius > clusterMap[n.cluster].radius)) clusterMap[n.cluster] = n;
                });
                const clusters = clusterMap;
                
                const cluster = (alpha) => {
                    return  (d) => {
                        const cluster = clusters[d.cluster];
                        if (cluster === d || d.cluster == 0) return;
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

                const collide = alpha => {
                    const quadtree = d3.quadtree()
                        .x(d => d.x)
                        .y(d => d.y)
                        .extent([[0, 0], [this.width, this.height]])
                        .addAll(nodes);
                    return d => {
                        let r = d.radius + (maxRadius * 8) + Math.max(this.padding, this.clusterPadding),
                            nx1 = d.x - r,
                            nx2 = d.x + r,
                            ny1 = d.y - r,
                            ny2 = d.y + r;
                        quadtree.visit((quad, x1, y1, x2, y2) => {
                            let data = quad.data;
                            if (data && data !== d) {
                                let x = d.x - data.x,
                                    y = d.y - data.y,
                                    l = Math.sqrt(x * x + y * y),
                                    r = d.radius + data.radius + (d.cluster == data.cluster ? this.padding : this.clusterPadding);
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

                const svg = d3.select('#force-chart')
                    .append("svg")
                    .attr('height', this.height)
                    .attr('width', this.width)
                    .attr('id', 'chart');
                
                const line = d3.line().curve(d3.curveBasisClosed)

                const simulation = d3.forceSimulation()
                    .alpha(0.3)
                    .force('center', d3.forceCenter().x(this.width / 2).y(this.height / 2))
                    .force('collide', d3.forceCollide(d => d.radius + this.padding))
                    .nodes(nodes, d => d.id)
                    .on("tick", ticked)
                    .force("charge", d3.forceManyBody())
                    .force("x", d3.forceX())
                    .force("y", d3.forceY())
                    .restart();
                
                const color = d3.scaleOrdinal(d3.schemeCategory10)

                const hullG = svg.append('g')
                    .attr('class', 'hulls');

                const node = svg.append('g')
                    .attr('class', 'nodes')
                    .selectAll('circle')
                    .data(nodes, d => d.id)
                    .enter().append('circle')
                    .attr('class', d => `cluster${d.cluster}`)
                    .attr('r', d => d.radius)
                    .attr('fill', d => color(d.cluster))
                    .call(d3.drag()
                        .on('start', dragstarted)
                        .on('drag', dragged)
                        .on('end', dragended));
                 const hullPoints = (data) => {
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
                        cluster: c,
                        nodes: node.filter(d => d.cluster == c)
                    };
                    }).filter(d => d.cluster != 0), d => d.cluster)
                    .enter().append('path')
                    .attr('d', d => line(d3.polygonHull(hullPoints(d.nodes))))
                    .attr('fill', d => color(d.cluster))
                    .attr('opacity', 0.4);
                
                const ticked = () => {
                    node
                        .each(cluster(0.2))
                        .each(collide(0.1))
                        .attr('cx', d => d.x = Math.max(d.radius, Math.min(this.width - d.radius, d.x)))
                        .attr('cy', d => d.y = Math.max(d.radius, Math.min(this.height - d.radius, d.y)));
                    
                    hulls
                        .attr('d', d => line(d3.polygonHull(hullPoints(d.nodes))));
                }
                
                function dragstarted(d) {
                    if (!d3.event.active) simulation.alphaTarget(0.1).restart();
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
                simulation.on("tick", ticked);
                return svg.node();
            },
        },
        mounted() {
            this.initChart();
        }
    }
</script>

<style lang="less" scoped>
    #force-chart{
        height: 100px;
        width: 600px;
    }
</style>