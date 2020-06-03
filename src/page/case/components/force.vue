<template>
    <div id="force-chart">
    </div>
</template>

<script>
    import * as d3 from 'd3'
    import _ from 'lodash'
    import RelationJSON from '../data/relation'

    export default {
        name: 'Force',
        data() {
            const height = 880;
            const width = 1080;
            
            return {
                width,
                height,
                padding: 5,
                maxRadius: 10,
                clusterPadding: 20,
            }
        },
        methods: {
            initChart() {
                this.svg = d3.select('#force-chart')
                    .append("svg")
                    .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])

                this.initTimeCircle();
                this.initDemiCircle();
                this.initForce();
            },
            initForce() {
                const links = [];
                const nodes = RelationJSON;
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
                    .force("link", d3.forceLink(links).id(d => d.blh))
                    .force("charge", 
                        d3.forceManyBody()
                            // .strength(-30)
                    )
                    .force("x", d3.forceX())
                    .force("y", d3.forceY());


                const link = this.svg.append("g")
                    .attr("stroke", "yellow")
                    .selectAll("line")
                    .data(links)
                    .join("line")
                    .attr("stroke-width", d => Math.sqrt(d.value));

                const node = this.svg.append("g")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5)
                    .selectAll("circle")
                    .data(nodes)
                    .join("circle")
                    .attr("r", d => d.r)
                    .attr("fill", 'red')
                    .call(drag(simulation));

                node.append("text")
                    .text(d => d.blh);

                simulation.on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);
                });
                this.svg.node();
            },
            initTimeCircle() {
                window.d3 = d3
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
                    .value(d => 1)

                const radius = Math.min(this.width, this.height) / 2;

                const arc = d3.arc()
                    .innerRadius(radius - 20)
                    .outerRadius(radius);

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
                console.log(RelationJSON);
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
    }
</style>