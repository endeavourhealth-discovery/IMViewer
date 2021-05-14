import Card from "primevue/card";
import Button from "primevue/button";
import { mount, flushPromises } from "@vue/test-utils";
import ConfirmCode from "@/components/user/ConfirmCode.vue";
import InputText from "primevue/inputtext";
import Swal from "sweetalert2";
import { Auth } from "aws-amplify";

Auth.confirmSignUp = jest.fn().mockResolvedValue({ status: 200, message: "test"});

Swal.fire = jest.fn().mockImplementation(() => Promise.resolve());

describe("ConfirmCode.vue no registeredUser", () => {
  let wrapper: any;
  let mockStore: any;
  it("starts empty if no store registeredUsername", async () => {
    mockStore = {
      state: {registeredUsername: ""},
      commit: jest.fn()
    }
    wrapper = mount(ConfirmCode, {
      global: {
        components: { Card, Button, InputText },
        mocks: { $store: mockStore }
      }
    });
    const userNameField = wrapper.find("#fieldUsername");
    const userNameInput = userNameField.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.username).toBe("");
    expect(wrapper.vm.code).toBe("");
    expect(wrapper.vm.codeVerified).toBe(false);
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("fieldUsername");
    expect(userNameInput.value).toBe("");
  });
});

describe("ConfirmCode.vue with registeredUser", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    mockStore = {
      state: {registeredUsername: "testUser"},
      commit: jest.fn()
    }
    mockRouter = {
      push: jest.fn(),
      go: jest.fn()
    }
    wrapper = mount(ConfirmCode, {
      global: {
        components: { Card, Button, InputText },
        mocks: { $store: mockStore, $router: mockRouter }
      }
    });
  });

  it("fetches the store registeredUsername if present on mount", async () => {
    expect(wrapper.vm.username).toBe("testUser");
  });

  it("renders username when set", async () => {
    // Assert the rendered text of the component
    const userNameField = wrapper.find("#fieldUsername");
    const userNameInput = userNameField.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("fieldUsername");
    expect(userNameInput.value).toBe("testUser");
  });

  it("updates Username when edited", async () => {
    wrapper.vm.username = "John";
    const userNameField = wrapper.find("#fieldUsername");
    const userNameInput = userNameField.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(userNameField.exists()).toBe(true);
    expect(userNameField.element.id).toBe("fieldUsername");
    expect(userNameInput.value).toBe("John");
  });

  it("updates Code when edited", async () => {
    wrapper.vm.code = "123456";
    const code = wrapper.find("#fieldCode");
    const codeInput = code.element as HTMLInputElement;
    await wrapper.vm.$nextTick();
    expect(code.exists()).toBe(true);
    expect(code.element.id).toBe("fieldCode");
    expect(codeInput.value).toBe("123456");
  });

  it("can check if a code is invalid", async () => {
    wrapper.vm.code = "1234";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.codeVerified).toBe(false);
  });

  it("can check if a code is valid", async () => {
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.codeVerified).toBe(true);
  });

  it("calls the Auth.ConfirmSignUp method on handle submit", async() => {
    wrapper.vm.code = "123456";
    await wrapper.vm.$nextTick();
    wrapper.vm.handleSubmit();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(Auth.confirmSignUp).toBeCalledTimes(1);
    expect(Auth.confirmSignUp).toBeCalledWith("testUser", "123456")
  });

  xit("opens an error popup on incorrect username/code", async() => {
    wrapper.vm.code = "1234";
    await wrapper.vm.$nextTick;
    wrapper.vm.handleSubmit();
    await wrapper.vm.$nextTick();
    expect(Swal.fire).toBeCalledTimes(1);
    expect(Swal.fire).toBeCalledWith({icon: "success", title: "Success", text: "Register confirmation successful", confirmButtonText: "Login" });
  })
});
