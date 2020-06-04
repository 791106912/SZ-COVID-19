import Vue from 'vue'
import Router from 'vue-router'
import menus from '@/config/menu'

Vue.use(Router)

var routes = []

menus.forEach(item => {
    routes.push({
      path: `/${item.path}`,
      name: item.comName,
      component: () => import(`@/page/${item.path}`)
    })
})

routes.push({ path: '/', redirect: '/pc' })

export default new Router({ routes })