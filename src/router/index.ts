import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Concept from "../views/Concept.vue";
import store from "@/store/index";
import { nextTick } from "vue";
import { AccessDenied, PageNotFound, SnomedLicense, EntityNotFound, Helpers } from "im-library";
const {
  DataTypeCheckers: { isObjectHasKeys }
} = Helpers;
import vm from "@/main";

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
  },
  {
    path: "/401",
    name: "AccessDenied",
    component: AccessDenied
  },
  {
    path: "/404",
    name: "EntityNotFound",
    component: EntityNotFound
  },
  {
    path: "/:pathMatch(.*)*",
    name: "PageNotFound",
    component: PageNotFound
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  const iri = to.params.selectedIri as string;
  const currentUrl = vm.$env.VIEWER_URL + to.path.slice(1);
  if (to.path !== "/snomedLicense") {
    store.commit("updateSnomedReturnUrl", currentUrl);
    store.commit("updateAuthReturnUrl", currentUrl);
  }
  if (iri && store.state.blockedIris.includes(iri)) {
    return false;
  }
  if (iri) {
    store.commit("updateRecentLocalActivity", { iri: iri, dateTime: new Date(), app: vm.$env.VIEWER_URL });
    store.commit("updateConceptIri", to.params.selectedIri as string);
  }
  if (to.matched.some((record: any) => record.meta.requiresAuth)) {
    const res = await store.dispatch("authenticateCurrentUser");
    console.log("auth guard user authenticated: " + res.authenticated);
    if (!res.authenticated) {
      console.log("redirecting to login");
      window.location.href = vm.$env.AUTH_URL + "login?returnUrl=" + currentUrl;
    }
  }
  if (to.matched.some((record: any) => record.meta.requiresLicense)) {
    console.log("snomed license accepted:" + store.state.snomedLicenseAccepted);
    if (store.state.snomedLicenseAccepted !== "true") {
      return {
        path: "/snomedLicense"
      };
    }
  }
  if (to.name === "Concept" && isObjectHasKeys(to.params, ["selectedIri"])) {
    try {
      new URL(iri);
      if (!(await vm.$entityService.iriExists(iri))) {
        router.push({ name: "EntityNotFound" });
      }
    } catch (_error) {
      router.push({ name: "EntityNotFound" });
    }
  }
});

router.afterEach(to => {
  nextTick(() => {
    document.title = (to.meta.title as string) || APP_TITLE;
  });
});

export default router;
