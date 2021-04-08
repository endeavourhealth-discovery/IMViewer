<template>
  <div class="p-d-flex p-flex-row p-ai-center">
    <Card
      class="p-d-flex p-flex-column p-jc-sm-around p-ai-center register-card"
    >
      <template #header>
        <i class="pi pi-fw pi-user-plus" style="fontSize: 50px; margin: 1em;" />
      </template>
      <template #title>
        Register
      </template>
      <template #content>
        <div class="p-fluid register-form">
          <div class="p-field">
            <label for="fieldUsername">Username</label>
            <InputText
              id="fieldUsername"
              type="text"
              maxlength="50"
              v-model="username"
              v-on:blur="setShowUsernameNotice"
            />
            <InlineMessage v-if="showUsernameNotice" severity="error"
              >Username contains unexpected characters. A-Z, 0-9 and
              hyphen/underscore(-_) only allowed e.g."John-Doe2"</InlineMessage
            >
          </div>
          <div class="p-field">
            <label for="fieldEmail1">Email Address</label>
            <div class="p-d-flex p-flex-row p-ai-center">
              <InputText
                id="fieldEmail1"
                type="text"
                maxlength="50"
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
            <label for="fieldEmail2">Confirm Email Address</label>
            <InputText
              id="fieldEmail2"
              type="text"
              maxlength="50"
              v-model="email2"
              v-on:blur="setShowEmail2Notice"
            />
            <InlineMessage v-if="showEmail2Notice" severity="error"
              >Email addresses do not match!</InlineMessage
            >
          </div>
          <div class="p-field">
            <label for="fieldFirstName">First Name</label>
            <InputText
              id="fieldFirstName"
              type="text"
              maxlength="50"
              v-model="firstName"
              v-on:blur="setShowFirstNameNotice"
            />
            <InlineMessage v-if="showFirstNameNotice" severity="error"
              >First name contains unexpected characters. A-Z and hyphens only
              allowed e.g."Mary-Anne"</InlineMessage
            >
          </div>
          <div class="p-field">
            <label for="fieldLastName">Last Name</label>
            <InputText
              id="fieldLastName"
              type="text"
              maxlength="50"
              v-model="lastName"
              v-on:blur="setShowLastNameNotice"
            />
            <InlineMessage v-if="showLastNameNotice" severity="error"
              >Last name contains unexpected characters. A-Z, apostropies and
              hyphens only allowed e.g."O'Keith-Smith"</InlineMessage
            >
          </div>
          <div class="p-field">
            <label for="fieldPassword1">Password</label>
            <InputText
              id="fieldPassword1"
              type="password"
              maxlength="50"
              aria-describedby="password-help"
              v-model="password1"
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
              v-if="passwordStrength === 'fail' && password1 !== ''"
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
            <label for="fieldPassword2">Confirm Password</label>
            <InputText
              id="fieldPassword2"
              type="password"
              maxlength="50"
              v-model="password2"
              v-on:blur="setShowPassword2Notice"
            />
            <InlineMessage v-if="showPassword2Notice" severity="error"
              >Passwords do not match!</InlineMessage
            >
          </div>
          <div class="p-d-flex p-flex-row p-jc-center">
            <!-- <ConfirmDialogue></ConfirmDialogue> -->
            <Button
              class="user-submit"
              type="submit"
              label="Submit"
              v-on:click.prevent="handleSubmit"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <span
          >Already have an account?
          <a
            id="login-link"
            class="footer-link"
            @click="$router.push({ name: 'Login' })"
            >Login here</a
          ></span
        >
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { User } from "@/models/User";
import store from "@/store/index";
import { PasswordStrength } from "@/models/PasswordStrength";
import Swal from "sweetalert2";
import {
  verifyIsUsername,
  verifyIsEmail,
  verifyPasswordsMatch,
  verifyEmailsMatch,
  verifyIsName,
  checkPasswordStrength
} from "@/helpers/UserMethods";
import AuthService from "@/services/AuthService";

@Options({
  name: "Register",
  emits: ["userCreated"],
  watch: {
    username: {
      immediate: true,
      handler(newValue) {
        this.usernameVerified = verifyIsUsername(newValue);
      }
    },
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
    },
    password1: {
      immediate: true,
      handler(newValue) {
        this.passwordStrength = checkPasswordStrength(newValue);
      }
    },
    password2: {
      immediate: true,
      handler(newValue) {
        this.passwordsMatch = verifyPasswordsMatch(this.password1, newValue);
      }
    }
  }
})
export default class Register extends Vue {
  username = "";
  usernameVerified = false;
  email1 = "";
  email1Verified = false;
  email2 = "";
  emailsMatch = false;
  firstName = "";
  firstNameVerified = false;
  lastName = "";
  lastNameVerified = false;
  password1 = "";
  password2 = "";
  passwordStrength: PasswordStrength = PasswordStrength.fail;
  passwordsMatch = false;
  showEmail1Notice = false;
  showEmail2Notice = false;
  showPassword2Notice = false;
  showUsernameNotice = false;
  showFirstNameNotice = false;
  showLastNameNotice = false;

  setShowUsernameNotice() {
    this.showUsernameNotice = this.usernameVerified ? false : true;
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

  handleSubmit() {
    if (this.allVerified()) {
      const user = new User(
        this.username,
        this.firstName,
        this.lastName,
        this.email1.toLowerCase(),
        this.password1
      );
      AuthService.register(user)
        .then(res => {
          if (res.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: res.message,
              showCancelButton: true,
              confirmButtonText: "Continue"
            }).then(result => {
              this.$emit("userCreated", user);
              if (result.isConfirmed) {
                store.commit("updateRegisteredUsername", this.username);
                this.$router.push({ name: "ConfirmCode" });
              } else {
                this.clearForm();
              }
            });
          } else if (res.status === 409) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Username already taken. Please pick another username",
              confirmButtonText: "Close"
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: res.message,
              confirmButtonText: "Close"
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
      // this.$confirm.require({
      //   message: "User created successfully!",
      //   header: "Success",
      //   icon: "pi pi-check",
      //   acceptLabel: "Login",
      //   rejectLabel: "Close",
      //   accept: () => {
      //     this.$router.push({name: "Login"});
      //   },
      //   reject: () => {
      //     this.$confirm.close();
      //   } // prime vue version -- ugly...
      // })
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User creation failed. Check input data.",
        confirmButtonText: "Close"
      });
    }
  }

  clearForm() {
    this.username = "";
    this.usernameVerified = false;
    this.email1 = "";
    this.email1Verified = false;
    this.email2 = "";
    this.emailsMatch = false;
    this.firstName = "";
    this.lastName = "";
    this.password1 = "";
    this.password2 = "";
    this.passwordStrength = PasswordStrength.fail;
    this.passwordsMatch = false;
    this.showEmail1Notice = false;
    this.showEmail2Notice = false;
    this.showPassword2Notice = false;
    this.showFirstNameNotice = false;
    this.showLastNameNotice = false;
  }

  allVerified() {
    if (
      verifyIsUsername(this.username) &&
      verifyIsEmail(this.email1) &&
      verifyIsEmail(this.email2) &&
      verifyEmailsMatch(this.email1, this.email2) &&
      verifyPasswordsMatch(this.password1, this.password2) &&
      this.passwordStrength !== PasswordStrength.fail &&
      verifyIsName(this.firstName) &&
      verifyIsName(this.lastName)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
</script>

<style scoped>
.user-submit {
  width: fit-content !important;
}

#password-help {
  color: red;
  overflow-wrap: break-word;
}

.register-card {
  padding: 0 2em;
}

.register-form {
  max-width: 25em;
}

.footer-link:hover {
  cursor: pointer;
}
</style>
