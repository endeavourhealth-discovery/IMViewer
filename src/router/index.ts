import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Concept from "../views/Concept.vue";
import { SnomedLicense } from "im-library";
import store from "@/store/index";
import { nextTick } from "vue";
import { Enums, Env, Helpers } from "im-library";
const { AppEnum } = Enums;
const {
  RouterGuards: { checkAuth, checkLicense }
} = Helpers;

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

router.beforeEach(async (to, from, next) => {
  let hasCalledNext = false;
  const iri = to.params.selectedIri as string;
  const currentUrl = Env.viewerUrl + "#" + to.path;
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
  hasCalledNext = await checkAuth(to, next, store, hasCalledNext, currentUrl);
  hasCalledNext = checkLicense(to, next, store, hasCalledNext);
  if (!hasCalledNext) next();
});

router.afterEach(to => {
  nextTick(() => {
    document.title = (to.meta.title as string) || APP_TITLE;
  });
});

export default router;
