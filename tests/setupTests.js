import { setupServer } from "msw/node";

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
