import _ from 'lodash'
import RelationJSON from '../data/relation'

export function initData() {
    const linkIds = [];
    _.forIn(RelationJSON, d => {
        const relation = d.yqtblgx;
        const targetId = d.blh;
        if (relation) {
            const relationArr = relation.match(/\d+/g);
            relationArr.forEach(sourceid => {
                linkIds.push(sourceid, targetId)
            })
        }
    })
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
        d.relation = linkIds.includes(d.blh) ? '链式传染' : '未知传染';
    })
}

export function aggre(sortkey) {
    const total = RelationJSON.length;
    return _.chain(RelationJSON)
        .reduce((obj, d) => {
            const key = d[sortkey] === '' ? '未知' : d[sortkey];
            const value = obj[key] ? obj[key].value + 1 : 1;
            obj[key] = {
                name: key,
                value,
                percent: `${(value * 100 / total).toFixed(2)}%`
            }
            return obj;
        }, {})
        .values()
        .sortBy('value')
        .value()
}

export function calculateNodeAndLink(data) {
    const links = [];
    const linkIds = [];
    const nodes = data
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

    return [nodes, links];
} 

