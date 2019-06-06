import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		status: '',
		token: localStorage.getItem('token') || '',
		username: {}
	},
	mutations: {
		auth_request(state) {
			state.status = 'loading'
		},
		auth_success(state, token, username) {
			state.status = 'success'
			state.token = token
			state.username = username
		},
		auth_error(state) {
			state.status = 'error'
		},
		logout(state) {
			state.status = ''
			state.token = ''
		},
	},
	actions: {
		login({
			commit
		}, username) {
			return new Promise((resolve, reject) => {
				commit('auth_request')
				axios({
						url: process.env.VUE_APP_APIURL + '/auth',
						data: username,
						method: 'POST'
					})
					.then(resp => {
						const token = resp.data.token
						const username = resp.data.username
						const isAdmin = resp.data.is_admin
						const refreshToken = resp.data.refresh_token
						localStorage.setItem('token', token)
						localStorage.setItem('refresh_token', refreshToken)
						localStorage.setItem('is_admin', isAdmin)
						localStorage.setItem('username', username)
						// Add the following line:
						axios.defaults.headers.common['Authorization'] = token
						commit('auth_success', token, username)
						resolve(resp)
					})
					.catch(err => {
						commit('auth_error')
						localStorage.removeItem('token')
						localStorage.removeItem('refresh_token')
						localStorage.removeItem('is_admin')
						localStorage.removeItem('username')
						reject(err)
					})
			})
		},
		refresh({
			commit
		}, ) {
			return new Promise((resolve, reject) => {
				commit('auth_request')
				axios({
						url: process.env.VUE_APP_APIURL + '/auth/refresh',
						data: {
							username: localStorage.getItem('username'),
							refresh_token: localStorage.getItem('refresh_token')

						},
						method: 'POST'
					})
					.then(resp => {
						const token = resp.data.token
						const username = resp.data.username
						const isAdmin = resp.data.is_admin
						const refreshToken = resp.data.refresh_token
						localStorage.setItem('token', token)
						localStorage.setItem('refresh_token', refreshToken)
						localStorage.setItem('is_admin', isAdmin)
						localStorage.setItem('username', username)
						// Add the following line:
						axios.defaults.headers.common['Authorization'] = token
						commit('auth_success', token, username)
						resolve(resp)
					})
					.catch(err => {
						commit('auth_error')
						localStorage.removeItem('token')
						localStorage.removeItem('refresh_token')
						localStorage.removeItem('is_admin')
						localStorage.removeItem('username')
						reject(err)
					})
			})
		},
		register({
			commit
		}, username) {
			return new Promise((resolve, reject) => {
				commit('auth_request')
				axios({
						url: process.env.VUE_APP_APIURL + '/users',
						data: username,
						method: 'POST'
					})
					.then(resp => {
						resolve(resp)
					})
					.catch(err => {
						commit('auth_error', err)
						reject(err)
					})
			})
		},
		logout({
			commit
		}) {
			return new Promise((resolve) => {
				commit('logout')
				localStorage.removeItem('token')
				localStorage.removeItem('is_admin')
				delete axios.defaults.headers.common['Authorization']
				resolve()
			})
		}
	},
	getters: {
		userToken: state => state.token,
		isLoggedIn: state => !!state.token,
		authStatus: state => state.status
	}
})
