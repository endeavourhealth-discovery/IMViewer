import { ComponentPublicInstance, createApp, Plugin } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import PrimeVue from "primevue/config";
import VueClipboard from "vue3-clipboard";
import { worker } from "./mocks/browser";

// Font Awesome
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

dom.watch();

library.add(fas, far);

import "primevue/resources/themes/saga-blue/theme.css"; //theme

// import "primevue/resources/themes/md-light-indigo/theme.css"

import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css";
import "./assets/layout/layout.scss";
import "./assets/layout/flags/flags.css";

// PrimeVue Components
import Card from "primevue/card";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import InputText from "primevue/inputtext";
import Tree from "primevue/tree";
import Divider from "primevue/divider";
import Button from "primevue/button";
import Panel from "primevue/panel";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import ScrollPanel from "primevue/scrollpanel";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import Listbox from "primevue/listbox";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup"; //optional for column grouping
import FileUpload from "primevue/fileupload";
import OrganizationChart from "primevue/organizationchart";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import ConfirmDialog from "primevue/confirmdialog";
import Tooltip from "primevue/tooltip";
import Dialog from "primevue/dialog";
import SplitButton from "primevue/splitbutton";
import MultiSelect from "primevue/multiselect";
import OverlayPanel from "primevue/overlaypanel";
import Chart from "primevue/chart";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import Menubar from "primevue/menubar";
import InlineMessage from "primevue/inlinemessage";
import Message from "primevue/message";
import ConfirmationService from "primevue/confirmationservice";
import Avatar from "primevue/avatar";
import MegaMenu from "primevue/megamenu";
import Timeline from "primevue/timeline";
import SelectButton from "primevue/selectbutton";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import Checkbox from "primevue/checkbox";
import PickList from "primevue/picklist";
import ContextMenu from "primevue/contextmenu";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import RadioButton from "primevue/radiobutton";
import ConfirmPopup from "primevue/confirmpopup";
import InputSwitch from "primevue/inputswitch";
import StyleClass from "primevue/styleclass";
import Tag from "primevue/tag";

import { Amplify, Auth } from "aws-amplify";
import awsconfig from "./aws-exports";

// msw initialising
if (import.meta.env.MODE === "mock") {
  worker.start();
}

// IMLibrary imports
import IMLibrary from "im-library";
import "im-library/dist/style.css";
import TieredMenu from "primevue/tieredmenu";

Amplify.configure(awsconfig);
Auth.configure(awsconfig);

const app = createApp(App)
  .use(store)
  .use(router)
  .use(PrimeVue, { ripple: true })
  .use(IMLibrary.install as Plugin, { store })
  .use(ConfirmationService)
  .use(ToastService)
  .use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true
  })
  .directive("tooltip", Tooltip)
  .directive("styleclass", StyleClass)
  .component("Card", Card)
  .component("ProgressSpinner", ProgressSpinner)
  .component("TabView", TabView)
  .component("TabPanel", TabPanel)
  .component("InputText", InputText)
  .component("Tree", Tree)
  .component("Divider", Divider)
  .component("Button", Button)
  .component("Panel", Panel)
  .component("Accordion", Accordion)
  .component("AccordionTab", AccordionTab)
  .component("ScrollPanel", ScrollPanel)
  .component("Splitter", Splitter)
  .component("SplitterPanel", SplitterPanel)
  .component("Listbox", Listbox)
  .component("DataTable", DataTable)
  .component("Column", Column)
  .component("ColumnGroup", ColumnGroup)
  .component("OrganizationChart", OrganizationChart)
  .component("Textarea", Textarea)
  .component("Dropdown", Dropdown)
  .component("ConfirmDialog", ConfirmDialog)
  .component("Dialog", Dialog)
  .component("SplitButton", SplitButton)
  .component("MultiSelect", MultiSelect)
  .component("OverlayPanel", OverlayPanel)
  .component("Menu", Menu)
  .component("TieredMenu", TieredMenu)
  .component("Chart", Chart)
  .component("Menubar", Menubar)
  .component("InlineMessage", InlineMessage)
  .component("Message", Message)
  .component("Avatar", Avatar)
  .component("MegaMenu", MegaMenu)
  .component("Timeline", Timeline)
  .component("SelectButton", SelectButton)
  .component("Toast", Toast)
  .component("Checkbox", Checkbox)
  .component("PickList", PickList)
  .component("FileUpload", FileUpload)
  .component("ContextMenu", ContextMenu)
  .component("FilterMatchMode", FilterMatchMode)
  .component("FilterOperator", FilterOperator)
  .component("RadioButton", RadioButton)
  .component("ConfirmPopup", ConfirmPopup)
  .component("InputSwitch", InputSwitch)
  .component("Tag", Tag);

app.config.errorHandler = (err: unknown, _instance: ComponentPublicInstance | null, info: string) => {
  console.error(err);
  _instance?.$toast.add({
    severity: "error",
    summary: info,
    detail: err
  });
};

const vm = app.mount("#app");
