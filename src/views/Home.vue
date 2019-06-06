<template>
  <div class="home">
    <vs-row class="message" vs-justify="center">
      <vs-col type="flex" vs-justify="flex-start" vs-align="center" vs-w="4">
        <h1>Mededelingen</h1>
      </vs-col>
      <vs-col id="makepost" mt-3 type="flex" vs-justify="flex-end" vs-align="center" vs-w="4">
        <span v-if="isAdmin">
        <vs-button @click="postPrompt = true" color="dark" type="line">Maak melding</vs-button>
        </span>
      </vs-col>
    </vs-row>
    <span v-if="thePosts.length > 0">
      <sequential-entrance fromLeft delay="100">
      <vs-row vs-justify="center" v-for="(item, index) in thePosts" :key="item.id">
        <vs-col mt-3 type="flex" vs-justify="center" vs-align="center" vs-w="8">
          <vs-card>
            <span id="doPost" v-if="isAdmin">
            <vs-button @click="deletePost(item.id, index)" radius size="small" color="primary" type="filled" icon="delete"></vs-button>
            </span>
            <div>
              <span class="textblock" v-html="item.post"></span>
            </div>
            <div slot="footer">
              <vs-row vs-justify="flex-end">
                <vs-chip color="primary" id="date">
                  <vs-avatar color="#ffd460" text-color="dark" icon="calendar_today" />
                  {{item.createdAt}}
                </vs-chip>
              </vs-row>
            </div>
          </vs-card>
        </vs-col>
      </vs-row>
      <vs-row vs-justify="center">
        <vs-col mt-3 type="flex" vs-justify="center" vs-align="center" vs-w="8">
          <vs-button id="moreItems" ref="loadMoreItemsBut" color="primary" @click="loadMoreItems" type="filled">Laad meer meldingen</vs-button>
        </vs-col>
      </vs-row>
      </sequential-entrance>
    </span>
    <span v-else>
      <vs-row vs-justify="center">
        <vs-col mt-3 type="flex" vs-justify="center" vs-align="center" vs-w="8">
          <vs-alert
            color="primary" active="true" class="postalert" ref="loadableButton">
            Geen meldingen om weer te geven
          </vs-alert>
        </vs-col>
      </vs-row>  
    </span>
    <vs-prompt
      @vs-accept="accept"
      vs-accept-text="Plaats"
      vs-cancel-text="Annuleren"
      vs-title="Maak een melding"
      :vs-is-valid="validPost"
      :vs-active.sync="postPrompt">
      <div class="con-exemple-prompt">
      Schrijf een melding...
        <vs-textarea rows="8" placeholder="Melding" v-model="createPost"/>
      </div>
    </vs-prompt>    
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'home',
  data: function () {
    return {
      thePosts: [],
      limit: 6,
      offset: 0,
      postPrompt: false,
      createPost: '',
      deletePostId: null,
      deletePostIndex: null,
      isAdmin: JSON.parse(localStorage.getItem('is_admin')),
      jwtToken: localStorage.getItem('token')
    }
  },
  computed:{
   validPost(){
      return (this.createPost.length > 0)
    }
  },
  methods: {
    refresh: function () {
      this.$store.dispatch('refresh')
      .then(() => {
        console.log('do')
      });
    },
    loadPosts: function() {
      this.$vs.loading();
      axios({
        method: 'GET',
        url: process.env.VUE_APP_APIURL + '/posts/list',
        params: {
          limit: this.limit,
          offset: this.offset
        },
        headers: {
            'Authorization': `Bearer ${this.jwtToken}`,
            'Content-Type': 'application/json',
        },
      })
      .then(resp => {
        this.$vs.loading.close();
        this.thePosts = resp.data;
      })
      .catch(err => {
        this.$vs.loading.close();
        if (err) {
          this.refresh();
        }
      });
    },
    getFiveM: function() {
      this.$vs.loading();
      axios({
        method: 'GET',
        url: 'https://servers-live.fivem.net/api/servers/single/141.138.139.124:30120',
        headers: {
            'Content-Type': 'application/json',
        },
      })
      .then(resp => {
        this.$vs.loading.close();
        if (resp) {
          this.players = resp.data.Data.players;
        }
      })
      .catch(err => {
        this.$vs.loading.close();
        if (err) {
          console.log(err)
        }
      }); 
    },
    deletePost: function (id, index) {
        this.deletePostId = id;
        this.deletePostIndex = index;
        this.$vs.dialog({
          type:'confirm',
          color: 'danger',
          title: `Weet je het zeker?`,
          acceptText:'Verwijder',
          cancelText:'Annuleren',
          text: 'Weet je zeker dat je de melding wilt verwijderen?',
          accept:this.acceptDeletePost
        });
    },
    acceptDeletePost: function () {
      this.$vs.loading();
      axios({
        method: 'DELETE',
        url: process.env.VUE_APP_APIURL + '/admin/posts/delete',
        data: {
          id: this.deletePostId,
        },
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
      })
      .then(resp => {
        if (resp) {
          this.$vs.loading.close();
          this.thePosts.splice(this.deletePostIndex, 1);
          this.$vs.notify({
            color:'success',
            text:'Melding is verwijderd'
          });
        }
      })
      .catch(err => {
        this.$vs.loading.close();
        if (err) {
          this.refresh();
        }
      });      
    },
    accept: function () {
      this.$vs.loading();
      axios({
        method: 'POST',
        url: process.env.VUE_APP_APIURL + '/admin/posts/post',
        data: {
          post: this.createPost,
        },
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
      })
      .then(resp => {
        if (resp) {
          this.$vs.loading.close();

          this.$vs.notify({
            color:'success',
            text:'Melding is geplaatst'
          })

          Number.prototype.padLeft = function(base,chr){
            let  len = (String(base || 10).length - String(this).length)+1;
            return len > 0? new Array(len).join(chr || '0')+this : this;
          }

          let d = new Date,
          dformat = [d.getDate().padLeft(),
                    (d.getMonth()+1).padLeft(),
                    d.getFullYear()].join('-') +' ' +
                    [d.getHours().padLeft(),
                    d.getMinutes().padLeft()].join(':');

          let item = {id:resp.data.id, post:this.createPost, createdAt:dformat};
          this.thePosts.unshift(item);
        }
      })
      .catch(err => {
        this.$vs.loading.close();
        if (err) {
          this.refresh();
        }
      });
    },
    loadMoreItems: function () {
      this.$vs.loading();
      this.offset = parseInt(this.offset) + parseInt(this.limit);

      axios({
        method: 'GET',
        url: process.env.VUE_APP_APIURL + '/posts/list',
        params: {
          limit: this.limit,
          offset: this.offset
        },
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
      })
      .then(resp => {
        this.$vs.loading.close();
        if (resp.data.length <= 0) {
          this.$refs.loadMoreItemsBut.$el.innerHTML = 'Dat was het dan...';
          this.$refs.loadMoreItemsBut.$el.disabled = true;
        } else {
          let i;
          for (i = 0; i < resp.data.length; i++) {
            let item = {id:resp.data[i].id, post:resp.data[i].post, createdAt:resp.data[i].createdAt};
            this.thePosts.push(item)
          }
        }
      })
      .catch(err => {
        this.$vs.loading.close();
        if (err) {
          this.refresh();
        }
      });
    },
  },
  created: function() {
    this.loadPosts();
    if (typeof this.$route.query.login !== "undefined") {
      let query = Object.assign({}, this.$route.query);
      delete query.login;
      this.$router.replace({ query });
      this.$vs.notify({icon:'check_circle', text:'Succesvol ingelogd',color:'success',position:'bottom-right'});
    }
  },
}
</script>

<style scoped lang="scss">
h1 {
  margin-bottom: 1rem;
}
#makepost {
  text-align: right;
}
.con-vs-card {
  position: relative;
  background-color: #ffffff;
  border: 4px solid #ea5455;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
  margin-bottom: 2.5rem;
  .textblock {
      display: block;
      padding-bottom: 1.5rem;
      white-space: pre-wrap; 
      word-wrap: break-word;
      font-family: inherit;
      padding-right: 4rem;
  }
}
#doPost {
  position: absolute;
  right: -16px;
  top: -16px;
  .vs-button:last-child {
    margin-left: .25rem;
  }
}
#date {
  margin-bottom: -16px;
  min-width: 150px;
  padding-left: 11px;
  .con-vs-avatar {
    position: absolute;
    left: 11px;
  }
}
.postalert {
  font-size: 1.3rem;
  background-color: rgb(234, 84, 85);
  color: #ffffff;
  padding-left: .4rem;
}
#moreItems {
  margin-bottom: 2.5rem;
}
.message {
  margin-top: 2rem;
}
</style>
