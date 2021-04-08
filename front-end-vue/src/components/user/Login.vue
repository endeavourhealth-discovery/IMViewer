<template>
  <div class="p-d-flex p-flex-row p-ai-center">
    <Card class="p-d-flex p-flex-column p-jc-sm-around p-ai-center login-card">
      <template #header>
        <i class="pi pi-fw pi-user" style="fontSize: 50px; margin-top: 1em;" />
      </template>
      <template #title>
        Login
      </template>
      <template #content>
        <div class="p-fluid login-form">
          <div class="p-field">
            <label for="fieldUsername">Username</label>
            <InputText
              id="fieldUsername"
              type="text"
              v-model="username"
              :placeholder="username"
            />
          </div>
          <div class="p-field">
            <label for="fieldPassword">Password</label>
            <InputText id="fieldPassword" type="password" v-model="password" />
          </div>
          <div class="p-d-flex p-flex-row p-jc-center">
            <Button
              class="user-submit"
              type="submit"
              label="Login"
              v-on:click.prevent="handleSubmit"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <small
          >Don't have an account yet?
          <a
            id="register-link"
            class="footer-link"
            @click="$router.push({ name: 'Register' })"
            >Register here</a
          ></small
        >
        <br />
        <br />
        <small
          >Already received a confirmation code?
          <a
            id="code-link"
            class="footer-link"
            @click="$router.push({ name: 'ConfirmCode' })"
            >Enter it here</a
          ></small
        >
        <br />
        <br />
        <small
          >Forgot your password or username? <br /><a
            id="recover-link"
            class="footer-link"
            @click="$router.push({ name: 'ForgotPassword' })"
          >
            Recover account</a
          ></small
        >
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import store from "@/store/index";
import Swal from "sweetalert2";
import AuthService from "@/services/AuthService";

@Options({
  name: "Login",
  computed: {
    registeredUsername() {
      return store.state.registeredUsername;
    }
  }
})
export default class Login extends Vue {
  registeredUsername!: string;
  username = "";
  password = "";

  mounted() {
    if (this.registeredUsername && this.registeredUsername !== "") {
      this.username = this.registeredUsername;
    }
  }

  handleSubmit() {
    AuthService.signIn(this.username, this.password)
      .then(res => {
        if (res.status === 200) {
          store.commit("updateCurrentUser", res.user);
          store.commit("updateRegisteredUsername", null);
          store.commit("updateIsLoggedIn", true);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Login successful"
          }).then(() => {
            this.$router.push({ name: "Home" });
          });
        } else {
          console.log(res.message);
          if (res.status === 401) {
            Swal.fire({
              icon: "warning",
              title: "User Unconfirmed",
              text:
                "Account has not been confirmed. Please confirm account to continue.",
              showCloseButton: true,
              showCancelButton: true,
              confirmButtonText: "Confirm Account"
            }).then(result => {
              if (result.isConfirmed) {
                store.commit("updateRegisteredUsername", this.username);
                this.$router.push({ name: "ConfirmCode" });
              }
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: res.message,
              confirmButtonText: "Close"
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Authentication error",
          confirmButtonText: "Close"
        });
      });
  }
}
</script>

<style scoped>
.login-card {
  padding: 0 2em;
}

.user-submit {
  width: fit-content !important;
}

.login-form {
  max-width: 25em;
}

.footer-link:hover {
  cursor: pointer;
}
</style>
