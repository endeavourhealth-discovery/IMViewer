import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Concept from "../views/Concept.vue";
import { SnomedLicense } from "im-library";
import store from "@/store/index";
import { nextTick } from "vue";
import { Enums, Env } from "im-library";
const { AppEnum } = Enums;

const APP_TITLE = "IM Viewer";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      requiresLicense: true
    },
    children: [
      {
        path: "/concept/:selectedIri",
        name: "Concept",
        component: Concept,
        meta: {
          requiresLicense: true
        }
      }
    ]
  },
  {
    path: "/snomedLicense",
    name: "License",
    component: SnomedLicense
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const iri = to.params.selectedIri as string;
  const currentUrl = Env.viewerUrl + "/#" + to.path;
  if (to.path !== "/snomedLicense") {
    store.commit("updateSnomedReturnUrl", currentUrl);
    store.commit("updateAuthReturnUrl", currentUrl);
  }
  if (iri && store.state.blockedIris.includes(iri)) {
    return;
  }
  if (iri) {
    store.commit("updateRecentLocalActivity", { iri: iri, dateTime: new Date(), app: AppEnum.VIEWER });
    store.commit("updateConceptIri", to.params.selectedIri as string);
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    store.dispatch("authenticateCurrentUser").then(res => {
      console.log("auth guard user authenticated:" + res.authenticated);
      if (!res.authenticated) {
        console.log("redirecting to login");
        window.location.href = Env.authUrl + "login?returnUrl=" + currentUrl;
      } else {
        if (to.matched.some(record => record.meta.requiresLicense)) {
          console.log("snomed license accepted:" + store.state.snomedLicenseAccepted);
          if (store.state.snomedLicenseAccepted !== "true") {
            next({
              path: "/snomedLicense"
            });
          } else {
            next();
          }
        } else {
          next();
        }
      }
    });
  } else if (to.matched.some(record => record.meta.requiresLicense)) {
    console.log("snomed license accepted:" + store.state.snomedLicenseAccepted);
    if (store.state.snomedLicenseAccepted !== "true") {
      next({
        path: "/snomedLicense"
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

router.afterEach(to => {
  nextTick(() => {
    document.title = (to.meta.title as string) || APP_TITLE;
  });
});

export default router;
