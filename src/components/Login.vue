<template lang="html">
  <div id="panels">
    <div v-bind:class="{ active: apiDown }" id="apidown">Sorry, de API is op het moment offline. Je kunt niet inloggen.</div>
    <vs-row id="panels__row" v-bind:class="{ active: registerIsOpen }" vs-align="flex-center" vs-type="flex" vs-justify="left" vs-w="12">
      <vs-col id="panels__login" vs-type="flex" vs-justify="center" vs-align="center" vs-lg="6" vs-sm="12"> 
        <h1>Login</h1>
        <form>
          <div class="centerx labelx">
            <vs-input id="username" size="large" label="Gebruikersnaam" placeholder="Gebruikersnaam" v-model="username"/>
            <vs-input id="password" size="large" type="password" label="Wachtwoord" placeholder="Wachtwoord" v-model="password"/>
          </div>
          <vs-button @click="login" color="primary" size="large" type="filled">Login</vs-button>
        </form>
      </vs-col>
      <vs-col id="panels__info" vs-type="flex" vs-justify="center" vs-align="center" vs-lg="6" vs-sm="12">
        <h3 v-text="currentHeader"></h3>
        <vs-button @click="openRegister" id="currentPanel" color="#ffffff" size="large" type="line"><span v-text="currentPanel"></span></vs-button>
      </vs-col>
      <vs-col id="panels__register" vs-type="flex" vs-justify="center" vs-align="center" vs-lg="6" vs-sm="12">
        <h1>Registreren</h1>
        <form>
          <div class="centerx labelx">
            <vs-input id="usernamereg" size="large" label="Gebruikersnaam" placeholder="Gebruikersnaam" v-model="usernamereg"/>
            <vs-input id="passwordreg" size="large" type="password" label="Wachtwoord" placeholder="Wachtwoord" v-model="passwordreg"/>
          </div>
          <vs-button @click="register" color="primary" size="large" type="filled">Registreren</vs-button>
        </form>
      </vs-col>
    </vs-row>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    data(){
      return {
        currentPanel: 'Registreren',
        currentHeader: 'Klik hier om een account te maken.',
        registerIsOpen: false,
        username: "",
        password: "",
        usernamereg: "",
        passwordreg: "",
        loginError: false,
        apiDown: false
      }
    },
    methods: {
			login: function (event) {
        event.preventDefault();
          if (this.username && this.password) {
            this.$vs.loading();

            this.loginError = false;
            let username = this.username;
            let password = this.password;
            this.$store.dispatch('login', {
              username,
              password
            })
            .then(() => {
              this.$router.push({ path: '/', query: { login: 'success' } });
              this.$vs.loading.close();
            })
            .catch(() => {
              this.$vs.loading.close();
              this.loginError = true;
              this.$vs.notify({icon:'error', text:'Gebruikersnaam of wachtwoord is verkeerd',color:'warning',position:'bottom-right'});
            });
          } else {
            if (!this.username) {
              this.loginError = true;
              this.$vs.notify({icon:'error', text:'Vul je gebruikersnaam in',color:'warning',position:'bottom-right'});
              document.getElementById("username").focus(); 
              
            } else if (!this.password) {
              this.loginError = true;
              this.$vs.notify({icon:'error', text:'Vul je wachtwoord in',color:'warning',position:'bottom-right'});
              document.getElementById("password").focus(); 
            }
          }
      },
      register: function (event) {
        event.preventDefault();
          if (this.usernamereg && this.passwordreg) {
            this.$vs.loading();
            let username = this.usernamereg;
            let password = this.passwordreg;
            this.$store.dispatch('register', {
              username,
              password
            })
            .then(() => {
              this.$vs.loading.close();
              this.registerIsOpen = false;
              this.$vs.notify({icon:'check_circle', text:'Succesvol geregistreerd',color:'success',position:'bottom-right'});
            })
            .catch(() => {
                this.$vs.loading.close();
                this.$vs.notify({icon:'error', text:'Gebruikersnaam is al in gebruik',color:'warning',position:'bottom-right'});
            });
          } else {
            if (!this.usernamereg) {
              this.loginError = true;
              this.$vs.notify({icon:'error', text:'Vul een gebruikersnaam in',color:'warning',position:'bottom-right'});
              document.getElementById("usernamereg").focus(); 
              
            } else if (!this.passwordreg) {
              this.loginError = true;
              this.$vs.notify({icon:'error', text:'Vul een wachtwoord in',color:'warning',position:'bottom-right'});
              document.getElementById("passwordreg").focus(); 
            }
          }
      },
      openRegister: function (event) {
        event.preventDefault();
        this.registerIsOpen = !this.registerIsOpen;

        if (this.registerIsOpen) {
          this.currentPanel = "login";
          this.currentHeader = "Heb je al een account? Log hier in.";
        } else {
          this.currentPanel = "Registreren";
          this.currentHeader = "Klik hier om een account te maken.";      
        }
      }
		},
    created: function () {
      this.$vs.loading();
      this.$refs.alert = ''
      axios({
        url: process.env.VUE_APP_APIURL + '/api-status',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET'
      })
      .then(resp => {
        this.$vs.loading.close();
        if (resp) {
          return true;
        }
      })
      .catch(err => {
        this.$vs.loading.close();
        if (err) {
          this.apiDown = true;
        }
      });
      
      if (this.$store.getters.isLoggedIn) {
				this.$router.push('/');
			}
			if (typeof this.$route.query.logout !== "undefined") {
				let query = Object.assign({}, this.$route.query);
				delete query.logout;
				this.$router.replace({ query });
        this.$vs.notify({icon:'check_circle', text:'Succesvol uitgelogd',color:'success',position:'bottom-right'});
			}
    }
  }
</script>

<style scoped lang="scss">
#panels {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  @media only screen and (max-width:900px) {
    padding: 2rem;
  }
  #apidown.active {
    display: block;
  }
  #apidown {
    position: absolute;
    display: none;
    top: 0;
    width: 100%;
    padding: 1rem;
    background-color: #ea5455;
    color: #ffffff;
    text-align: center;
    z-index: 999;
  }
  h1 {
    margin-bottom: 1.5rem;
    text-align: left;
    display: block;
    width: 100%;
  }
  .con-vs-alert {
    margin-bottom: 1rem;
  }
  #panels__row {
    position: relative;
    margin: 0 10%;
    overflow: hidden;
    border-radius: 6px;
    height: 28rem;
    background-color: #fff;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    @media only screen and (max-width:900px) {
      margin: 0;
      height: 100%;
    }
    #panels__register {
      position: absolute;
      right: 0;
      height: 100%;
      padding: 4rem;
      z-index: 5;
      flex-direction: column;
      @media only screen and (max-width:900px) {
        order: 2;
        padding: 2rem;
        transform: translate(100%);
        transition: transform .5s ease-in-out;
        height: auto;
        height: 70%;
        bottom: 0;
      }
    }
    #panels__login {
      flex-direction: column;
      padding: 4rem;
      transform: translateX(0%);
      transition: transform .5s ease-in-out;
      @media only screen and (max-width:900px) {
        order: 2;
        padding: 2rem;
        position: absolute;
        bottom: 0;
        height: 70%;
      }
    }
    #panels__info {
      z-index: 6;
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      padding: 2rem;
      background: #ea5455;
      background: linear-gradient(to top left, #ea5455, #e41749);
      background-position-x: 0%;
      background-position-y: 0%;
      background-repeat: repeat;
      background-size: auto;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: 0 0;  
      color: #ffffff;
      flex-direction: column;
      text-align: center;
      transition: transform .5s ease-in-out;
      transform: translateX(100%);   
      @media only screen and (max-width:900px) {
        position: relative;
        height: auto;
        transform: translateX(0%); 
        order: 1;
        padding-bottom: 2rem;
        height: 30%;
      }
    }
    form {
      width: 100%;
      .vs-input {
        width: 100%;
        margin-bottom: .5rem;
      }
      button {
        margin-top: .5rem;
      }
    }
  }
  #panels__row.active {
    #panels__info {
      transform: translateX(0%);
    }
    #panels__login {
      position: absolute;
      left: 0;
      transform: translateX(-100%);
      height: 100%;
      @media only screen and (max-width:900px) {
        bottom: 0;
        height: 70%;
      }
    }
    #panels__register {
      @media only screen and (max-width:900px) {
        transform: translateX(0%);
      }
    }
  }
}
</style>