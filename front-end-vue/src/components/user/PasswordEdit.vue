<template>
  <div v-if="user" class="p-d-flex p-flex-row p-ai-center">
    <Card
      class="p-d-flex p-flex-column p-jc-sm-around p-ai-center password-edit-card"
    >
      <template #header>
        <i class="pi pi-lock" style="fontSize: 50px; margin: 1em;" />
      </template>
      <template #title>
        Change Password
      </template>
      <template #content>
        <div
          class="p-fluid p-d-flex p-flex-column p-jc-start password-edit-form"
        >
          <div v-if="user.firstName" class="p-field">
            <label for="userName">User: </label>
            <p id="username">{{ user.username }}</p>
          </div>
          <div class="p-field">
            <label for="passwordOld">Current Password</label>
            <InputText id="passwordOld" type="password" v-model="passwordOld" />
          </div>
          <div class="p-field">
            <label for="passwordNew1">New Password</label>
            <InputText
              id="passwordNew1"
              type="password"
              v-model="passwordNew1"
            />
            <InlineMessage
              v-if="passwordStrength === 'strong'"
              severity="success"
              >Password Strength: Strong</InlineMessage
            >
            <InlineMessage
              v-if="passwordStrength === 'medium'"
              severity="success"
              >Password Strength: Medium</InlineMessage
            >
            <InlineMessage v-if="passwordStrength === 'weak'" severity="warn"
              >Password Strength: Weak</InlineMessage
            >
            <InlineMessage
              v-if="passwordStrength === 'fail' && passwordNew1 !== ''"
              severity="error"
              >Invalid Password</InlineMessage
            >
            <small id="password-help"
              >Password min length 8 characters. Improve password strength with
              a mixture of UPPERCASE, lowercase, numbers and special characters
              [!@#$%^&*].</small
            >
          </div>
          <div class="p-field">
            <label for="passwordNew2">Confirm New Password</label>
            <InputText
              id="passwordNew2"
              type="password"
              v-model="passwordNew2"
              v-on:blur="setShowPassword2Message"
            />
            <InlineMessage v-if="showPassword2Message" severity="error"
              >New passwords do not match!</InlineMessage
            >
          </div>
          <div class="p-d-flex p-flex-row p-jc-center">
            <Button
              class="user-edit"
              type="submit"
              label="Submit"
              v-on:click.prevent="handleEditSubmit"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { User } from "@/models/User";
import {
  verifyPasswordsMatch,
  checkPasswordStrength
} from "@/helpers/UserMethods";
import { PasswordStrength } from "@/models/PasswordStrength";
import store from "@/store/index";
import Swal from "sweetalert2";
import AuthService from "@/services/AuthService";

@Options({
  name: "PasswordEdit",
  components: {},
  computed: {
    user() {
      return store.state.currentUser;
    }
  },
  watch: {
    passwordNew1: {
      immediate: true,
      handler(newValue) {
        this.passwordStrength = checkPasswordStrength(newValue);
      }
    },
    passwordNew2: {
      immediate: true,
      handler(newValue) {
        this.passwordsMatch = verifyPasswordsMatch(this.passwordNew1, newValue);
      }
    }
  }
})
export default class PasswordEdit extends Vue {
  user!: User;
  passwordOld = "";
  passwordNew1 = "";
  passwordNew2 = "";
  passwordsMatch = false;
  passwordStrength: PasswordStrength = PasswordStrength.fail;
  showPassword2Message = false;

  setShowPassword2Message() {
    this.showPassword2Message = this.passwordsMatch ? false : true;
  }

  handleEditSubmit() {
    if (
      this.passwordsMatch &&
      this.passwordStrength !== PasswordStrength.fail
    ) {
      AuthService.changePassword(this.passwordOld, this.passwordNew1).then(
        res => {
          if (res.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Password successfully updated"
            }).then(() => {
              this.$router.push({ name: "Home" });
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: res.message
            });
          }
        }
      );
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Error updating password. Authentication error or new passwords do not match."
      });
    }
  }
}
</script>

<style scoped>
.password-edit-card {
  padding: 0 2em;
}

.user-edit {
  width: fit-content !important;
}

.password-edit-form {
  max-width: 25em;
}
</style>
