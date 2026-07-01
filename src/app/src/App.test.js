import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  });
});

test("renders todo heading", async () => {
  render(<App />);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  expect(screen.getByText(/List of TODOs/i)).toBeInTheDocument();
});
