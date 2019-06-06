<template>
  <div class="vip">
    <vs-row vs-justify="center">
      <vs-col mt-3 type="flex" vs-justify="flex-center" vs-align="center" vs-w="8">
        <h1>VIP Betalingen</h1>
      </vs-col>
    </vs-row>
      <span v-if="thePayments.length > 0">
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
                :data="thePayments">
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
      </span>
      <span v-else>
        <vs-row vs-justify="center">
          <vs-col mt-3 type="flex" vs-justify="center" vs-align="center" vs-w="8">
            <vs-alert
              color="primary" active="true" class="vipsalert" ref="loadableButton">
              Er zijn nog geen betalingen geweest.
            </vs-alert>
          </vs-col>
        </vs-row>  
      </span>  
      <vs-row v-if="showNeedtoPay" vs-justify="center">
        <vs-col mt-3 type="flex" vs-justify="flex-center" vs-align="center" vs-w="8">      
          <PayPal
            amount="10.00"
            currency="EUR"
            :client="credentials"
            :button-style="myStyle"
            v-on:payment-completed="paymentCompleted"
            locale="nl_NL"
            invoice-number="123"
            env="sandbox">
          </PayPal>
        </vs-col>
      </vs-row>
  </div>
</template>

<script>
import PayPal from 'vue-paypal-checkout'
import axios from 'axios'

export default {
  name: 'vip',
  data: function () {
    return {
      myStyle: {
        label: 'checkout',
        size:  'responsive',
        shape: 'rect',
        color: 'black'
      },
      credentials: {
        sandbox: 'AWsUCEkvRsQa7hcrOC0CMb0sVpW4NLJUHWIsdZc2JUZH3d0NXXuSvVvwiNCWz3BH8OAcF9s4Uo2lcj3V',
        production: '<production client id>'
      },
      username: localStorage.getItem('username'),
      email: '',
      steam_id: '',
      payment_id: '',
      limit: 30,
      offset: 0,
      thePayments: [],
      showNeedtoPay: false,
    }
  },
  components: {
    PayPal
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
    paymentCompleted (res) {
      console.log(res);
    },
    loadPayments: function () {
      this.$vs.loading();
      axios({
        method: 'POST',
        url: process.env.VUE_APP_APIURL + '/vips',
        data: {
          username: this.username,
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
          this.thePayments.push(item)
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
    showPay: function () {
      if (this.thePayments <= 0) {
        this.showNeedtoPay = true;
      } else if (this.thePayments > 0) {
          let theDate = this.thePayments[0].createdAtNoFormat;
          if (!this.checkDate(theDate)) {
            this.showNeedtoPay = true;
          }
      } 
    },
  },
  created() {
    this.loadPayments();
    this.showPay();
  },
}
</script>

<style scoped lang="scss">
h1 {
  margin-bottom: 1rem;
}
.vipsalert {
  width: 100%;
  font-size: 1.3rem;
  background-color: rgb(234, 84, 85);
  color: #ffffff;
  padding-left: .4rem;
}
</style>
