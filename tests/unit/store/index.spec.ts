import store from "@/store/index";
import { Models, Services, Vocabulary} from 'im-library';
import { beforeEach, describe, vi, it, afterAll, expect } from "vitest";
const { IM } = Vocabulary;
const { User, CustomAlert } = Models;

describe("state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
  });

  afterAll(() => {
    window.sessionStorage.clear();
  });

  it("should start with the correct values", () => {
    expect(Object.keys(store.state)).toEqual(
      expect.arrayContaining([
        "conceptIri",
        "currentUser",
        "isLoggedIn",
        "recentLocalActivity",
        "snomedLicenseAccepted",
        "favourites",
        "snomedReturnUrl",
        "authReturnUrl",
        "selectedEntityType",
        "conceptActivePanel",
        "arrayObjectNameListboxWithLabelStartExpanded",
        "tagSeverityMatches",
        "textDefinitionStartExpanded",
        "activeProfile"
      ])
    );
    expect(store.state.conceptIri).toBeNull();
    expect(store.state.currentUser).toEqual({});
    expect(store.state.isLoggedIn).toBeFalsy();
    expect(store.state.recentLocalActivity).toBeNull();
    expect(store.state.snomedLicenseAccepted).toBeNull();
    expect(store.state.favourites).toEqual([]);
    expect(store.state.snomedReturnUrl).toEqual('');
    expect(store.state.authReturnUrl).toEqual('');
    expect(store.state.selectedEntityType).toEqual('');
    expect(store.state.conceptActivePanel).toEqual(0);
    expect(store.state.arrayObjectNameListboxWithLabelStartExpanded).toEqual([]);
    expect(store.state.tagSeverityMatches).toEqual([
      { "@id": IM.ACTIVE, severity: "success" },
      { "@id": IM.DRAFT, severity: "warning" },
      { "@id": IM.INACTIVE, severity: "danger" }
    ]);
    expect(store.state.textDefinitionStartExpanded).toEqual(["Definition"]);
    expect(store.state.activeProfile).toEqual({ uuid: "", activeClausePath: "" });
  });
});

describe("mutations", () => {
  it("can updateConceptIri", () => {
    const testConceptIri = "http://www.endhealth.info/im#test";
    store.commit("updateConceptIri", testConceptIri);
    expect(store.state.conceptIri).toEqual(testConceptIri);
  });

  it("can updateCurrentUser", () => {
    const testUser = new User("testUser", "John", "Doe", "john.doe@ergosoft.co.uk", "", "colour/003-man.png", ["SOME_ROLE"]);
    store.commit("updateCurrentUser", testUser);
    expect(store.state.currentUser).toEqual(testUser);
  });

  it("can updateActiveProfile", () => {
    const profile = { uuid: "SOME_UUID", activeClausePath: "SOME_CLAUSE_PATH" };
    store.commit("updateActiveProfile", profile);
    expect(store.state.activeProfile).toEqual(profile);
  });

  it("can updateFavourites", () => {
    const favourite = "http://www.endhealth.info/im#test";
    store.commit("updateFavourites", "http://www.endhealth.info/im#test1");
    store.commit("updateFavourites", "http://www.endhealth.info/im#test2");
    expect(store.state.favourites).toEqual(["http://www.endhealth.info/im#test1", "http://www.endhealth.info/im#test2"]);
  });

  it("can updateRecentLocalActivity", () => {
    const activity1 = {iri: "http://www.endhealth.info/im#test1", dateTime: Date.now()};
    store.commit("updateRecentLocalActivity", activity1);
    expect(store.state.recentLocalActivity).toEqual(JSON.stringify([activity1]));
  });
});
