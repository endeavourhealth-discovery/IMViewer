<template>
  <Menubar :model="items">
    <template #start>
      <img class="im-logo" src="../../assets/logos/Logo-object-empty.png" alt="IM logo" />
    </template>
    <template #end>
      <Button icon="pi pi-th-large" class="p-button-rounded p-button-text p-button-plain p-button-lg" @click="openAppsOverlay" />
      <OverlayPanel ref="appsO">
        <div class="app-icons-container" justify-content-end>
          <div class="app-icon">
            <i class="pi pi-cog app-icon"></i>
          </div>
          <div class="app-icon">4</div>
          <div class="app-icon">4</div>
          <div class="app-icon">4</div>
          <div class="app-icon">4</div>
          <div class="app-icon">4</div>
        </div>
      </OverlayPanel>
      <Button
        v-if="!isLoggedIn"
        icon="pi pi-user"
        class="p-button-rounded p-button-text p-button-plain p-button-lg"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      />
      <Button
        v-if="isLoggedIn"
        class="p-button-rounded p-button-text p-button-plain p-button-lg"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      >
        <img class="avatar-icon" alt="avatar icon" :src="getUrl(currentUser.avatar)" style="width: 1.5rem" />
      </Button>
      <Menu ref="userMenu" :model="getItems()" :popup="true" />
    </template>
  </Menubar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { AccountItem, LoginItem } from "@/models/topBar/MenuItems";
export default defineComponent({
  name: "TopBar",
  computed: mapState(["currentUser", "isLoggedIn"]),
  data() {
    return {
      loading: false,
      request: {} as { cancel: any; msg: string },
      searchText: "",
      items: [
        {
          label: "Videos",
          icon: "pi pi-fw pi-video",
          items: [
            {
              label: "Video 1",
              items: [{ label: "Video 1.1" }, { label: "Video 1.2" }]
            },
            {
              label: "Video 2",
              items: [{ label: "Video 2.1" }, { label: "Video 2.2" }]
            },
            {
              label: "Video 3",
              items: [{ label: "Video 3.1" }, { label: "Video 3.2" }]
            },
            {
              label: "Video 4",
              items: [{ label: "Video 4.1" }, { label: "Video 4.2" }]
            }
          ]
        },
        {
          label: "Users",
          icon: "pi pi-fw pi-users",
          items: [
            {
              label: "User 1",
              items: [{ label: "User 1.1" }, { label: "User 1.2" }]
            },
            {
              label: "User 2",
              items: [{ label: "User 2.1" }, { label: "User 2.2" }]
            },
            {
              label: "User 3",
              items: [{ label: "User 3.1" }, { label: "User 3.2" }]
            },
            {
              label: "User 4",
              items: [{ label: "User 4.1" }, { label: "User 4.2" }]
            },
            {
              label: "User 5",
              items: [{ label: "User 5.1" }, { label: "User 5.2" }]
            },
            {
              label: "User 6",
              items: [{ label: "User 6.1" }, { label: "User 6.2" }]
            }
          ]
        },
        {
          label: "Events",
          icon: "pi pi-fw pi-calendar",
          items: [
            {
              label: "Event 1",
              items: [{ label: "Event 1.1" }, { label: "Event 1.2" }]
            },
            {
              label: "Event 2",
              items: [{ label: "Event 2.1" }, { label: "Event 2.2" }]
            },
            {
              label: "Event 3",
              items: [{ label: "Event 3.1" }, { label: "Event 3.2" }]
            },
            {
              label: "Event 4",
              items: [{ label: "Event 4.1" }, { label: "Event 4.2" }]
            }
          ]
        },
        {
          label: "Settings",
          icon: "pi pi-fw pi-cog",
          items: [
            {
              label: "Setting 1",
              items: [{ label: "Setting 1.1" }, { label: "Setting 1.2" }]
            },
            {
              label: "Setting 2",
              items: [{ label: "Setting 2.1" }, { label: "Setting 2.2" }]
            },
            {
              label: "Setting 3",
              items: [{ label: "Setting 3.1" }, { label: "Setting 3.2" }]
            },
            {
              label: "Setting 4",
              items: [{ label: "Setting 4.1" }, { label: "Setting 4.2" }]
            }
          ]
        }
      ],
      loginItems: [
        {
          label: "Login",
          icon: "fa fa-fw fa-user",
          url: process.env.VUE_APP_AUTH_URL + "login?returnUrl=VUE_APP_EDITOR"
        },
        {
          label: "Register",
          icon: "fa fa-fw fa-user-plus",
          url: process.env.VUE_APP_AUTH_URL + "register?returnUrl=VUE_APP_EDITOR"
        }
      ] as LoginItem[],
      accountItems: [
        {
          label: "My account",
          icon: "fa fa-fw fa-user",
          url: process.env.VUE_APP_AUTH_URL + "my-account?returnUrl=VUE_APP_EDITOR"
        },
        {
          label: "Edit account",
          icon: "fa fa-fw fa-user-edit",
          url: process.env.VUE_APP_AUTH_URL + "my-account/edit?returnUrl=VUE_APP_EDITOR"
        },
        {
          label: "Change password",
          icon: "fa fa-fw fa-user-lock",
          url: process.env.VUE_APP_AUTH_URL + "my-account/password-edit?returnUrl=VUE_APP_EDITOR"
        },
        {
          label: "Logout",
          icon: "fa fa-fw fa-sign-out-alt",
          url: process.env.VUE_APP_AUTH_URL + "logout?returnUrl=VUE_APP_EDITOR"
        }
      ] as AccountItem[]
    };
  },
  methods: {
    getItems(): LoginItem[] | AccountItem[] {
      if (this.isLoggedIn) {
        return this.accountItems;
      } else {
        return this.loginItems;
      }
    },
    openUserMenu(event: any): void {
      (this.$refs.userMenu as any).toggle(event);
    },
    getUrl(item: string): string {
      return require("@/assets/avatars/" + item);
    },
    openAppsOverlay(event: any) {
      (this.$refs.appsO as any).toggle(event);
    }
  }
});
</script>

<style scoped>
.im-logo {
  text-align: center;
  color: lightgray;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0rem;
}
.app-list-container {
  justify-content: center;
}

.app-icons-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1rem;
}

.app-icon {
  width: calc(25% - 1rem);
}

@media screen and (max-width: 1439px) {
  .im-logo {
    width: 3vw;
  }
}
@media screen and (min-width: 1440px) {
  .im-logo {
    width: 3vw;
  }
}
</style>
