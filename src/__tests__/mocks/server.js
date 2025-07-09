import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with our handlers
export const server = setupServer(...handlers);

// Setup server lifecycle for tests
beforeAll(() => {
  // Start the server before all tests
  server.listen({ 
    onUnhandledRequest: 'warn' 
  });
});

afterEach(() => {
  // Reset handlers after each test
  server.resetHandlers();
});

afterAll(() => {
  // Clean up after all tests are done
  server.close();
});