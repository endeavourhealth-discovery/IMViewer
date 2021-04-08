<template>
  <div v-if="isLoggedIn" class="p-d-flex p-flex-row p-ai-center">
    <Card
      class="p-d-flex p-flex-column p-jc-sm-around p-ai-center user-edit-card"
    >
      <template #header>
        <i class="pi pi-fw pi-user-edit" style="fontSize: 50px; margin: 1em;" />
      </template>
      <template #title>
        Edit My Account
      </template>
      <template #content>
        <div class="p-fluid p-d-flex p-flex-column p-jc-start user-edit-form">
          <div class="p-field">
            <label for="username">Username</label>
            <InputText id="username" type="text" v-model="username" disabled />
            <small id="user-help">Username cannot currently be changed</small>
          </div>
          <div class="p-field">
            <label for="firstName">First Name</label>
            <InputText
              id="firstName"
              type="text"
              v-model="firstName"
              v-on:blur="setShowFirstNameNotice"
            />
            <InlineMessage v-if="showFirstNameNotice" severity="error"
              >First name contains unexpected characters. A-Z and hyphens only
              allowed e.g."Mary-Anne"</InlineMessage
            >
          </div>
          <div class="p-field">
            <label for="lastName">Last Name</label>
            <InputText
              id="lastName"
              type="text"
              v-model="lastName"
              v-on:blur="setShowLastNameNotice"
            />
            <InlineMessage v-if="showLastNameNotice" severity="error"
              >Last name contains unexpected characters. A-Z, apostropies and
              hyphens only allowed e.g."O'Keith-Smith"</InlineMessage
            >
          </div>
          <div class="p-field">
            <label for="email1">Email Address</label>
            <div class="p-d-flex p-flex-row p-ai-center">
              <InputText
                id="email1"
                type="text"
                v-model="email1"
                v-on:focus="setShowEmail1Notice(true)"
                v-on:blur="setShowEmail1Notice(false)"
              />
              <i
                v-if="showEmail1Notice && email1Verified"
                class="pi pi-check-circle"
                style="color: #439446; fontSize: 2em"
              />
              <i
                v-if="showEmail1Notice && !email1Verified"
                class="pi pi-times-circle"
                style="color: #e60017; fontSize: 2em"
              />
            </div>
          </div>
          <div class="p-field">
            <label for="email2">Confirm Email Address</label>
            <InputText
              id="email2"
              type="text"
              v-model="email2"
              v-on:blur="setShowEmail2Notice()"
            />
            <InlineMessage v-if="showEmail2Notice" severity="error"
              >Email addresses do not match!</InlineMessage
            >
          </div>
          <div
            v-if="!showPasswordEdit"
            class="p-d-flex p-flex-row p-jc-center p-field"
          >
            <Button
              class="password-edit p-button-secondary"
              type="submit"
              label="Change Password"
              v-on:click.prevent="editPasswordClicked(true)"
            />
          </div>
          <div v-if="showPasswordEdit" class="p-field">
            <label for="passwordOld">Current Password</label>
            <InputText id="passwordOld" type="password" v-model="passwordOld" />
          </div>
          <div v-if="showPasswordEdit" class="p-field">
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
          <div v-if="showPasswordEdit" class="p-field">
            <label for="passwordNew2">Confirm New Password</label>
            <InputText
              id="passwordNew2"
              type="password"
              v-model="passwordNew2"
              v-on:blur="setShowPassword2Notice"
            />
            <InlineMessage v-if="showPassword2Notice" severity="error"
              >New passwords do not match!</InlineMessage
            >
          </div>
          <div
            v-if="showPasswordEdit"
            class="p-d-flex p-flex-row p-jc-center p-field"
          >
            <Button
              class="password-edit p-button-secondary"
              type="submit"
              label="Cancel Password Edit"
              v-on:click.prevent="editPasswordClicked(false)"
            />
          </div>
          <div class="p-d-flex p-flex-row p-jc-center p-field">
            <Button
              class="form-reset p-button-warning"
              type="button"
              label="Reset"
              v-on:click.prevent="resetForm"
            />
          </div>
          <div class="p-d-flex p-flex-row p-jc-center">
            <Button
              class="user-edit"
              type="submit"
              label="Update"
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
import store from "@/store/index";
import { User } from "@/models/User";
import Swal from "sweetalert2";
import {
  verifyIsEmail,
  verifyPasswordsMatch,
  verifyEmailsMatch,
  verifyIsName,
  checkPasswordStrength
} from "@/helpers/UserMethods";
import { PasswordStrength } from "@/models/PasswordStrength";
import AuthService from "@/services/AuthService";

@Options({
  name: "UserEdit",
  components: {},
  computed: {
    user() {
      return store.state.currentUser;
    },
    isLoggedIn() {
      return store.state.isLoggedIn;
    }
  },
  watch: {
    email1: {
      immediate: true,
      handler(newValue) {
        this.email1Verified = verifyIsEmail(newValue);
      }
    },
    email2: {
      immediate: true,
      handler(newValue) {
        this.emailsMatch = verifyEmailsMatch(this.email1, newValue);
      }
    },
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
    },
    firstName: {
      immediate: true,
      handler(newValue) {
        this.firstNameVerified = verifyIsName(newValue);
      }
    },
    lastName: {
      immediate: true,
      handler(newValue) {
        this.lastNameVerified = verifyIsName(newValue);
      }
    }
  }
})
export default class UserEdit extends Vue {
  user!: User;
  isLoggedIn!: boolean;
  username = "";
  firstName = "";
  firstNameVerified = false;
  lastName = "";
  lastNameVerified = false;
  email1 = "";
  email2 = "";
  email1Verified = false;
  emailsMatch = false;
  showEmail1Notice = false;
  showEmail2Notice = false;
  passwordOld = "";
  passwordNew1 = "";
  passwordNew2 = "";
  passwordStrength: PasswordStrength = PasswordStrength.fail;
  showPasswordEdit = false;
  passwordsMatch = false;
  showPassword2Notice = false;
  showFirstNameNotice = false;
  showLastNameNotice = false;

  mounted() {
    if (this.user && this.isLoggedIn) {
      this.username = this.user.username;
      this.firstName = this.user.firstName;
      this.lastName = this.user.lastName;
      this.email1 = this.user.email;
      this.email2 = this.user.email;
    }
  }

  editPasswordClicked(result: boolean) {
    if (result === false) {
      this.passwordOld = "";
      this.passwordNew1 = "";
      this.passwordNew2 = "";
    }
    this.showPasswordEdit = result;
  }

  setShowEmail1Notice(result: boolean) {
    this.showEmail1Notice = result;
  }

  setShowEmail2Notice() {
    this.showEmail2Notice = this.emailsMatch ? false : true;
  }

  setShowPassword2Notice() {
    this.showPassword2Notice = this.passwordsMatch ? false : true;
  }

  setShowFirstNameNotice() {
    this.showFirstNameNotice = this.firstNameVerified ? false : true;
  }

  setShowLastNameNotice() {
    this.showLastNameNotice = this.lastNameVerified ? false : true;
  }

  handleEditSubmit() {
    if (
      this.showPasswordEdit &&
      this.passwordsMatch &&
      this.passwordStrength !== PasswordStrength.fail &&
      this.allVerified()
    ) {
      const updatedUser = new User(
        this.username,
        this.firstName,
        this.lastName,
        this.email1,
        this.passwordNew1
      );
      updatedUser.setId(this.user.id);
      AuthService.updateUser(updatedUser).then(res => {
        if (res.status === 200) {
          AuthService.changePassword(this.passwordOld, this.passwordNew1).then(
            res2 => {
              if (res2.status === 200) {
                Swal.fire({
                  icon: "success",
                  title: "Success",
                  text: "User details and password successfully updated"
                }).then(() => {
                  store.commit("updateCurrentUser", res.user);
                  this.$router.push({ name: "UserDetails" });
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text:
                    "Password update failed, but user details updated successfully. " +
                    res2.message
                });
              }
            }
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message
          });
        }
      });
    } else if (this.showPasswordEdit) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error. Password error or updated details error."
      });
    } else if (
      this.user.firstName === this.firstName &&
      this.user.lastName === this.lastName &&
      this.user.email === this.email1
    ) {
      Swal.fire({
        icon: "warning",
        title: "Nothing to update",
        text: "Account details have not been edited"
      });
    } else if (this.allVerified()) {
      const updatedUser = new User(
        this.username,
        this.firstName,
        this.lastName,
        this.email1,
        ""
      );
      updatedUser.setId(this.user.id);
      AuthService.updateUser(updatedUser).then(res => {
        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Account details updated successfully"
          }).then(() => {
            store.commit("updateCurrentUser", res.user);
            this.$router.push({ name: "UserDetails" });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message
          });
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error with user form"
      });
    }
  }

  allVerified() {
    if (
      verifyIsEmail(this.email1) &&
      verifyIsEmail(this.email2) &&
      verifyEmailsMatch(this.email1, this.email2) &&
      verifyIsName(this.firstName) &&
      verifyIsName(this.lastName)
    ) {
      return true;
    } else {
      return false;
    }
  }

  resetForm() {
    Swal.fire({
      icon: "warning",
      title: "Warning",
      text:
        "Are you sure you want to reset this form? Any changes you have made will be lost!",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Reset"
    }).then(result => {
      if (result.isConfirmed) {
        this.username = this.user.username;
        this.firstName = this.user.firstName;
        this.lastName = this.user.lastName;
        this.email1 = this.user.email;
        this.email2 = this.user.email;
        this.showFirstNameNotice = false;
        this.showLastNameNotice = false;
        this.showEmail1Notice = false;
        this.showEmail2Notice = false;
      }
    });
  }
}
</script>

<style scoped>
.user-edit,
.password-edit,
.form-reset {
  width: fit-content !important;
}

.user-edit-form {
  max-width: 25em;
}

.user-edit-card {
  padding: 0 2em;
}
</style>
