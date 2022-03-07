import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Datamodel from "../views/Concept.vue";
import { SnomedLicense } from "im-library";
import store from "@/store/index";
import { nextTick } from "vue";

const APP_TITLE = "Information Model";

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
        component: Datamodel,
        meta: {
          requiresLicense: true
        }
      }
    ]
  },
  {
    path: "/snomedLicense",
    name: "License",
    component: SnomedLicense,
    props: { returnUrl: import.meta.env.VITE_VIEWER_URL }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const iri = to.params.selectedIri as string;
  if (iri && store.state.blockedIris.includes(iri)) {
    return;
  }
  if (iri) {
    store.commit("updateConceptIri", to.params.selectedIri as string);
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    store.dispatch("authenticateCurrentUser").then(res => {
      console.log("auth guard user authenticated:" + res.authenticated);
      if (!res.authenticated) {
        console.log("redirecting to login");
        window.location.href = import.meta.env.VITE_AUTH_URL + "login?returnUrl=VITE_VIEWER";
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
