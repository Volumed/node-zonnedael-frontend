<template>
  <div id="app">
    <span v-if="isLoggedIn">
      <div class="centerx">
          <vs-navbar
            v-model="indexActive"
            color="primary"
            text-color="rgba(255,255,255,.6)"
            active-text-color="rgba(255,255,255,1)"
            class="navbar">
            <div slot="title">
              <vs-navbar-title>
                {{username}}
              </vs-navbar-title>
            </div>

            <vs-navbar-item index="0" >
               <router-link to="/">Home</router-link>
            </vs-navbar-item>
            <vs-navbar-item index="1" >
               <router-link to="/vip">VIP</router-link>
            </vs-navbar-item>
            <vs-navbar-item index="2" >
               <router-link v-if="isAdmin" to="/admin">Admin</router-link>
            </vs-navbar-item>
            <vs-spacer></vs-spacer>
            <vs-button @click="logout" color="#fff" type="flat">Log uit</vs-button>
          </vs-navbar>
        </div>
    </span>
    <router-view/>
  </div>
</template>
<script>
  export default {
		data() {
			return {
        indexActive: 0,
        username: localStorage.getItem('username'),
        isAdmin: JSON.parse(localStorage.getItem('is_admin')),
			}
		}, 
    computed : {
      isLoggedIn : function(){ return this.$store.getters.isLoggedIn}
    },
    methods: {
      logout: function () {
        this.indexActive = 0;
        this.$store.dispatch('logout')
        .then(() => {
          this.$router.push('/login');
          this.$router.push({ path: '/login', query: { logout: 'success' } });
        })
      }
    },
    created() {
      if (this.$router.currentRoute.name === 'home') {
        this.indexActive = 0;
      } else if (this.$router.currentRoute.name === 'vip') {
        this.indexActive = 1;
      } else if (this.$router.currentRoute.name === 'admin') {
        this.indexActive = 2;
      }
    }
  }
</script>

<style lang="scss">
  @import url("https://fonts.googleapis.com/css?family=Coiny");
  $fontFamily: 'Coiny', sans-serif;

  body, html {
    overflow-x: hidden;
    font-family: $fontFamily; 
    font-display: swap;
    color: #2d4059;
    background: #ffd460;
    background: linear-gradient(to top left, #ffd460, rgb(255, 204, 102));
    background-position-x: 0%;
    background-position-y: 0%;
    background-repeat: repeat;
    background-size: auto;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 0 0;
    height: 100vh;
  }
  
  button, input {
      font-family: $fontFamily;
  }

  .parentx-static {
    overflow: hidden;
    height: 500px;
    position: relative;
  }

  .header-sidebar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    h4 {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      > button {
        margin-left: 10px;
      }
    }
  }

  .footer-sidebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    > button {
      border: 0px solid rgba(0, 0, 0, 0) !important;
      border-left: 1px solid rgba(0, 0, 0, 0.07) !important;
      border-radius: 0px !important;
    }
  }

  .navbar {
    margin-bottom: 3rem;
  }

  #menu {
    position: absolute;
    right: 1rem;
    top: 1rem;
    padding: 2rem;
    .material-icons {
      font-size: 34px;
    }
  }
  .vs-dialog {
    footer {
      padding: 10px;
    }
  }
  .vs-con-table {
    border: 4px solid #ffd460;
    header {
      padding: 10px;
      background: #ea5455;
      background: linear-gradient(to top left, #ea5455, #e41749);
      background-position-x: 0%;
      background-position-y: 0%;
      background-repeat: repeat;
      background-size: auto;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: 0 0;   
      .vs-button {
        margin-right: 2rem;
      }
      .vs-button.small {
        margin-right: 0;
        margin-left: .35rem;
      }     
    }
  }
</style>