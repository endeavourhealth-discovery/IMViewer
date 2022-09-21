import { setupServer } from "msw/node";
import { handlers, handlersFaker } from "@/mocks/handlers";

const restHandlers = [];
const server = setupServer(...restHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});

export { server, restHandlers };
