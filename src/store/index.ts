import { createStore } from "vuex";
import AuthService from "@/services/AuthService";
import ConfigService from "@/services/ConfigService";
import { Models, Vocabulary, Constants, LoggerService } from "im-library";
import { RecentActivityItem } from "im-library/dist/types/interfaces/Interfaces";
const { User, CustomAlert } = Models;
const { IM } = Vocabulary;
const { Avatars } = Constants;

export default createStore({
  // update stateType.ts when adding new state!
  state: {
    conceptIri: localStorage.getItem("viewerSelectedConcept") as string,
    currentUser: {} as Models.User,
    isLoggedIn: false as boolean,
    recentLocalActivity: localStorage.getItem("recentLocalActivity") as string,
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") as string,
    favourites: JSON.parse(localStorage.getItem("favourites") || "[]") as string[],
    snomedReturnUrl: "",
    authReturnUrl: "",
    blockedIris: [] as string[],
    selectedEntityType: "",
    conceptActivePanel: 0,
    defaultPredicateNames: [] as string[],
    arrayObjectNameListboxWithLabelStartExpanded: [],
    tagSeverityMatches: [
      { "@id": IM.ACTIVE, severity: "success" },
      { "@id": IM.DRAFT, severity: "warning" },
      { "@id": IM.INACTIVE, severity: "danger" }
    ],
    textDefinitionStartExpanded: ["Definition"]
  },
  mutations: {
    updateFavourites(state, favourite: string) {
      const favourites: string[] = JSON.parse(localStorage.getItem("favourites") || "[]");
      if (!favourites.includes(favourite)) {
        favourites.push(favourite);
      } else {
        favourites.splice(favourites.indexOf(favourite), 1);
      }
      localStorage.setItem("favourites", JSON.stringify(favourites));
      state.favourites = favourites;
    },
    updateRecentLocalActivity(state, recentActivityItem: RecentActivityItem) {
      let activity: RecentActivityItem[] = JSON.parse(localStorage.getItem("recentLocalActivity") || "[]");
      activity.forEach(activityItem => {
        activityItem.dateTime = new Date(activityItem.dateTime);
      });
      const foundIndex = activity.findIndex(activityItem => activityItem.iri === recentActivityItem.iri && activityItem.app === recentActivityItem.app);
      if (foundIndex !== -1) {
        activity[foundIndex].dateTime = recentActivityItem.dateTime;
        activity.sort((a, b) => {
          if (a.dateTime.getTime() > b.dateTime.getTime()) {
            return 1;
          } else if (b.dateTime.getTime() > a.dateTime.getTime()) {
            return -1;
          } else {
            return 0;
          }
        });
      } else {
        while (activity.length > 4) activity.shift();
        activity.push(recentActivityItem);
      }

      localStorage.setItem("recentLocalActivity", JSON.stringify(activity));
      state.recentLocalActivity = JSON.stringify(activity);
    },
    updateBlockedIris(state, blockedIris) {
      state.blockedIris = blockedIris;
    },
    updateConceptIri(state, conceptIri) {
      state.conceptIri = conceptIri;
      localStorage.setItem("viewerSelectedConcept", conceptIri);
    },
    updateCurrentUser(state, user) {
      state.currentUser = user;
    },
    updateIsLoggedIn(state, status) {
      state.isLoggedIn = status;
    },
    updateSnomedLicenseAccepted(state, status: string) {
      state.snomedLicenseAccepted = status;
      localStorage.setItem("snomedLicenseAccepted", status);
    },
    updateSnomedReturnUrl(state, url: string) {
      state.snomedReturnUrl = url;
    },
    updateAuthReturnUrl(state, url: string) {
      state.authReturnUrl = url;
    },
    updateSelectedEntityType(state, type) {
      state.selectedEntityType = type;
    },
    updateConceptActivePanel(state, number) {
      state.conceptActivePanel = number;
    },
    updateDefaultPredicateNames(state, names) {
      state.defaultPredicateNames = names;
    },
    updateArrayObjectNameListboxWithLabelStartExpanded(state, items) {
      state.arrayObjectNameListboxWithLabelStartExpanded = items;
    },
    updateTagSeverityMatches(state, items) {
      state.tagSeverityMatches = items;
    },
    updateTextDefinitionStartExpanded(state, items) {
      state.textDefinitionStartExpanded = items;
    }
  },
  actions: {
    async fetchBlockedIris({ commit }) {
      const blockedIris = await ConfigService.getXmlSchemaDataTypes();
      commit("updateBlockedIris", blockedIris);
    },
    async logoutCurrentUser({ commit }) {
      let result = new CustomAlert(500, "Logout (store) failed");
      await AuthService.signOut().then(res => {
        if (res.status === 200) {
          commit("updateCurrentUser", null);
          commit("updateIsLoggedIn", false);
          result = res;
        } else {
          result = res;
        }
      });
      return result;
    },
    async authenticateCurrentUser({ commit, dispatch }) {
      const result = { authenticated: false };
      await AuthService.getCurrentAuthenticatedUser().then(res => {
        if (res.status === 200 && res.user) {
          commit("updateIsLoggedIn", true);
          const loggedInUser = res.user;
          const foundAvatar = Avatars.find(avatar => avatar === loggedInUser.avatar);
          if (!foundAvatar) {
            loggedInUser.avatar = Avatars[0];
          }
          commit("updateCurrentUser", loggedInUser);
          result.authenticated = true;
        } else {
          dispatch("logoutCurrentUser").then(resLogout => {
            if (resLogout.status === 200) {
              LoggerService.info(undefined, "Force logout successful");
            } else {
              LoggerService.error(undefined, "Force logout failed");
            }
          });
        }
      });
      return result;
    }
  },
  modules: {}
});
