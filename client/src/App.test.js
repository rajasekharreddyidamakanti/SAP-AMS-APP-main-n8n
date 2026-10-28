import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the sign-in screen for a logged-out user', async () => {
  localStorage.clear();
  render(<App />);
  expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});
