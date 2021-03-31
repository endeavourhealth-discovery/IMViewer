import store from "@/store/index";
import {mount} from "@vue/test-utils";
import UserEdit from "@/components/user/UserEdit.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import InlineMessage from "primevue/inlinemessage";
import Button from "primevue/button";
import { User } from "@/models/User";
import { PasswordStrength } from "@/models/PasswordStrength";

describe("userEdit.vue no password edit", () => {
  let wrapper: any;

  beforeEach(() => {
    const user = new User("testUser", "John", "Doe", "john.doe@ergosoft.co.uk", "");
    store.commit("updateCurrentUser", user);
    store.commit("updateIsLoggedIn", true);
    wrapper = mount(UserEdit, {
      global: {
        plugins: [store],
        components: { Card, Button, InputText, InlineMessage}
      },
    });
  })

  it("should render details from current user to form values", async () => {
    const userNameField = wrapper.find("#username");
    let userNameInput = userNameField.element as HTMLInputElement
    const firstNameField = wrapper.find("#firstName");
    let firstNameInput = firstNameField.element as HTMLInputElement
    const lastNameField = wrapper.find("#lastName");
    let lastNameInput = lastNameField.element as HTMLInputElement
    const email1Field = wrapper.find("#email1");
    let email1Input = email1Field.element as HTMLInputElement
    const email2Field = wrapper.find("#email2");
    let email2Input = email2Field.element as HTMLInputElement
    await wrapper.vm.$nextTick();
    expect(userNameField.exists()).toBe(true)
    expect(userNameField.element.id).toBe('username')
    expect(userNameInput.value).toBe("testUser");
    expect(firstNameField.exists()).toBe(true)
    expect(firstNameField.element.id).toBe('firstName')
    expect(firstNameInput.value).toBe("John");
    expect(lastNameField.exists()).toBe(true)
    expect(lastNameField.element.id).toBe('lastName')
    expect(lastNameInput.value).toBe("Doe");
    expect(email1Field.exists()).toBe(true)
    expect(email1Field.element.id).toBe('email1')
    expect(email1Input.value).toBe("john.doe@ergosoft.co.uk");
    expect(email2Field.exists()).toBe(true)
    expect(email2Field.element.id).toBe('email2')
    expect(email2Input.value).toBe("john.doe@ergosoft.co.uk");
  })

  it("transfers currentUser details into editable variables", () => {
    expect(wrapper.vm.username).toBe(wrapper.vm.user.username);
    expect(wrapper.vm.firstName).toBe(wrapper.vm.user.firstName);
    expect(wrapper.vm.lastName).toBe(wrapper.vm.user.lastName);
    expect(wrapper.vm.email1).toBe(wrapper.vm.user.email);
    expect(wrapper.vm.email2).toBe(wrapper.vm.user.email);
  })

  it("should start with all checks true and notices false", () => {
    expect(wrapper.vm.email1Verified).toBe(true);
    expect(wrapper.vm.emailsMatch).toBe(true);
    expect(wrapper.vm.firstNameVerified).toBe(true);
    expect(wrapper.vm.lastNameVerified).toBe(true);
    expect(wrapper.vm.showEmail1Notice).toBe(false);
    expect(wrapper.vm.showEmail2Notice).toBe(false);
    expect(wrapper.vm.showPassword2Notice).toBe(false);
    expect(wrapper.vm.showFirstNameNotice).toBe(false);
    expect(wrapper.vm.showLastNameNotice).toBe(false);
  })
})
