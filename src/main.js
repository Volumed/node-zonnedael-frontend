import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import Axios from 'axios'
import Vuesax from 'vuesax'

import SequentialEntrance from 'vue-sequential-entrance'
import 'vue-sequential-entrance/vue-sequential-entrance.css'
Vue.use(SequentialEntrance);

import 'vuesax/dist/vuesax.css'
import 'material-icons/iconfont/material-icons.css';
Vue.use(Vuesax, {
  theme:{
    colors:{
      primary:'#ea5455',
      success:'#76a21e',
      danger:'#ea5455',
      warning:'#f07b3f',
      dark:'#2d4059'
    }
  }
})

Vue.prototype.$http = Axios;
Vue.config.productionTip = false

const token = localStorage.getItem('user-token')
if (token) {
  Vue.prototype.$http.defaults.headers.common['Authorization'] = token
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
