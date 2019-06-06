<template>
  <div class="admin">
    <vs-row vs-justify="center">
      <vs-col mt-3 type="flex" vs-justify="flex-start" vs-align="center" vs-w="8">
        <h1>VIPS</h1>
      </vs-col>
    </vs-row>
    <span v-if="theVips.length > 0">
      <vs-row vs-justify="center">
        <vs-col mt-3 type="flex" vs-justify="center" vs-align="center" vs-w="8">
          <div>
            <vs-table
              v-model="selected"
              search
              stripe
              pagination
              max-items="10"
              noDataText="Niks gevonden..."
              :data="theVips">
              <template slot="header">
                <div>
                <vs-button @click="refreshVips" radius color="#ffd460" text-color="#2d4059" type="filled" icon="refresh"></vs-button>
                <span v-if="selected">
                  <sequential-entrance fromLeft delay="0">
                  <vs-button @click="vipPrompt = true" size="small" radius color="#ffffff" text-color="#2d4059" type="filled" icon="edit"></vs-button>
                  <vs-button @click="deleteVip" size="small" radius color="#ffffff" text-color="#ea5455" type="filled" icon="delete"></vs-button>
                  <vs-button @click="noneselect" size="small" radius color="#ffffff" text-color="#2d4059" type="filled" icon="close"></vs-button>
                  </sequential-entrance>
                </span>
                </div>
              </template>
              <template slot="thead">
                <vs-th sort-key="id">
                  ID
                </vs-th>
                <vs-th sort-key="state">
                  Status
                </vs-th>
                <vs-th sort-key="name">
                  Naam
                </vs-th>
                <vs-th sort-key="email">
                  E-mail
                </vs-th>
                <vs-th sort-key="steamid">
                  Steam ID
                </vs-th>
                <vs-th sort-key="paymentid">
                  Betaling
                </vs-th>
                <vs-th sort-key="createdat">
                  Aangemaakt
                </vs-th>
              </template>
              <template slot-scope="{data}">
                <vs-tr :data="tr" :key="indextr" v-for="(tr, indextr) in data" >
                  <vs-td :data="data[indextr].id">
                    {{data[indextr].id}}
                  </vs-td>

                  <vs-td :data="data[indextr].isactive">
                    <vs-chip v-if="data[indextr].isactive" color="success">
                      Actief
                    </vs-chip>
                    <vs-chip v-else color="primary">
                      Niet Actief
                    </vs-chip>
                  </vs-td>

                  <vs-td :data="data[indextr].username">
                    {{data[indextr].username}}
                  </vs-td>

                  <vs-td :data="data[indextr].email">
                    {{data[indextr].email}}
                  </vs-td>

                  <vs-td :data="data[indextr].steamId">
                    {{data[indextr].steamId}}
                  </vs-td>

                  <vs-td :data="data[indextr].paymentId">
                    <vs-chip v-if="data[indextr].paymentValid == null">
                      {{data[indextr].paymentId}}
                    </vs-chip>
                    <vs-chip v-else-if="data[indextr].paymentValid" color="success">
                      {{data[indextr].paymentId}}
                    </vs-chip>
                    <vs-chip v-else color="primary">
                      {{data[indextr].paymentId}}
                    </vs-chip>
                  </vs-td>

                  <vs-td :data="data[indextr].createdAt">
                    <vs-chip v-if="checkDate(data[indextr].createdAtNoFormat)" color="success">
                      {{data[indextr].createdAt}}
                    </vs-chip>
                    <vs-chip v-else color="primary">
                      {{data[indextr].createdAt}}
                    </vs-chip>
                  </vs-td>
                </vs-tr>
              </template>
            </vs-table>
          </div>
        </vs-col>
      </vs-row>
      <vs-row vs-justify="center">
        <vs-col mt-3 type="flex" vs-justify="center" vs-align="center" vs-w="8">
          <vs-button id="moreItems" ref="loadMoreItemsBut" color="primary" @click="loadMoreItems" type="filled">Laad oudere VIP data</vs-button>
        </vs-col>
      </vs-row>
    </span>
    <span v-else>
      <vs-row vs-justify="center">
        <vs-col mt-3 type="flex" vs-justify="center" vs-align="center" vs-w="8">
          <vs-alert
            color="primary" active="true" class="vipsalert" ref="loadableButton">
            Er zijn geen VIPS
          </vs-alert>
        </vs-col>
      </vs-row>  
    </span>
    <vs-prompt
      @vs-accept="acceptEdit"
      vs-accept-text="Bewerk"
      vs-cancel-text="Annuleren"
      vs-title="Bewerk VIP"
      :vs-active.sync="vipPrompt">
      <div v-if="selected !== null" class="con-exemple-prompt">
        <h2><small>ID.{{selected.id}}:</small> {{selected.username}}</h2> 
        <div class="centerx labelx">
          <label for="">Status</label>
          <vs-switch color="success" v-model="selected.isactive"/>
          <vs-input label="E-mail" placeholder="" v-model="selected.email"/>
        </div>
        <strong>Steam-ID:</strong> {{selected.steamId}}<br>
        <strong>Betaling-ID:</strong> {{selected.paymentId}}<br>
        <strong>Datum:</strong> {{selected.createdAt}}<br>
      </div>
    </vs-prompt>    
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'admin',
  data: function () {
    return {
      theVips: [],
      selected: null,
      limit: 30,
      offset: 0,
      vipPrompt: false,
      isAdmin: JSON.parse(localStorage.getItem('is_admin')),
    }
  },
  computed:{
   validPost(){
      return (this.createPost.length > 0)
    }
  },
  methods: {
    refresh: function () {
      this.$store.dispatch('refresh');
    },
    checkDate: function(date) {
      let today = new Date();
      today.setMonth(today.getMonth() - 1);
      let dateVip = new Date(date);
      if(+today > +dateVip) {
        return false
      } else {
        return true
      }
    },
    acceptEdit: function() {
      this.$vs.loading();
      let ifActive;
      if(this.selected.isactive) {
        ifActive = 1
      } else {
        ifActive = 0
      }
      axios({
        method: 'PUT',
        url: process.env.VUE_APP_APIURL + '/admin/vips/do',
        data: {
          id: this.selected.id,
          isactive: ifActive,
          email: this.selected.email
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
            text:'VIP is bewerkt'
          });
        }
      })
      .catch(err => {
        this.$vs.loading.close();
        if(err) {
          this.$vs.notify({
            color:'primary',
            text:'Er ging iets fout bij het bewerken'
          });
        }
      });
    },
    loadVips: function () {
      this.$vs.loading();
      axios({
        method: 'GET',
        url: process.env.VUE_APP_APIURL + '/admin/vips/list',
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
        let i;
        for (i = 0; i < resp.data.length; i++) {
          let item = {id:resp.data[i].id, isactive:resp.data[i].isactive, username:resp.data[i].username, email: resp.data[i].email, steamId:resp.data[i].steamId, paymentValid: null, paymentId: resp.data[i].paymentId, createdAt:resp.data[i].createdAt, createdAtNoFormat:resp.data[i].createdAtNoFormat};
          this.theVips.push(item)
        }
        this.$vs.loading.close();
      })
      .catch(err => {
        this.$vs.loading.close();
        if(err) {
          this.refresh();
        }
      });
    },
    checkSales: function () {
      let i;
      for (i = 0; i < this.theVips.length; i++) {
        let paymentId = this.theVips[i].paymentId;
        axios({
          method: 'POST',
          url: process.env.VUE_APP_APIURL + '/admin/vips/sale',
          data: {
            payment_id: this.theVips[i].paymentId
          },
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
          },
        })
        .then(resp => {
          if (resp.data.payment.state == 'completed') {
            this.theVips.find(v => v.paymentId == paymentId).paymentValid = true;
          } else {
            this.theVips.find(v => v.paymentId == paymentId).paymentValid = false;
          }
        })
        .catch(err => {
          if(err) {
            console.log(err)
          }
        });
      }
    },
    refreshVips: function ()  {
      this.theVips = [];
      this.selected = null;
      this.limit = 30;
      this.offset = 0;
      this.loadVips();
    },
    noneselect: function ()  {
      this.selected = null;
    },
    deleteVip: function ()  {
        this.$vs.dialog({
          type:'confirm',
          color: 'danger',
          title: `Weet je het zeker?`,
          acceptText:'Verwijder',
          cancelText:'Annuleren',
          text: 'Weet je zeker dat je de VIP wilt verwijderen?',
          accept:this.acceptDeleteVip
        });
    },
    acceptDeleteVip: function ()  {
      this.$vs.loading();
      axios({
        method: 'DELETE',
        url: process.env.VUE_APP_APIURL + '/admin/vips/do',
        data: {
          id: this.selected.id,
        },
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
      })
      .then(resp => {
        if (resp) {
          this.$vs.loading.close();
          this.refreshVips();
          this.$vs.notify({
            color:'success',
            text:'VIP is verwijderd'
          });
        }
      })
      .catch(err => {
        this.$vs.loading.close();
        if(err) {
          this.refresh();
        }
      });      
    },
    loadMoreItems: function () {
      this.$vs.loading();
      this.offset = parseInt(this.offset) + parseInt(this.limit);

      axios({
        method: 'GET',
        url: process.env.VUE_APP_APIURL + '/admin/vips/list',
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
            let item = {id:resp.data[i].id, isactive:resp.data[i].isactive, username:resp.data[i].username, email: resp.data[i].email, steamId:resp.data[i].steamId, paymentId: resp.data[i].paymentId, createdAt:resp.data[i].createdAt, createdAtNoFormat:resp.data[i].createdAtNoFormat};
            this.theVips.push(item)
          }
        }
      })
      .catch(err => {
        this.$vs.loading.close();
        if(err) {
          this.refresh();
        }
      });
    },
  },
  watch: {
    theVips() {
      this.checkSales();
    }
  },
  created: function() {
    this.loadVips();
  }
}
</script>

<style scoped lang="scss">
h1 {
  margin-bottom: 1rem;
}
.vipsalert {
  font-size: 1.3rem;
  background-color: rgb(234, 84, 85);
  color: #ffffff;
  padding-left: .4rem;
}
#moreItems {
  margin-bottom: 2.5rem;
}
.switchstate {
  opacity: 1 !important;
}
.vs-inputx, .vs-con-input-label {
  width: 100%;
}
.vs-con-input-label {
  margin-top: .8rem;
  margin-bottom: .8rem;
}
</style>
