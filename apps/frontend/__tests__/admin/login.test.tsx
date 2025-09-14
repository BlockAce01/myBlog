import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLoginPage from '@/app/admin/login/page';

// Mock the data functions
jest.mock('@/lib/data', () => ({
  login: jest.fn(),
  setAuthToken: jest.fn(),
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import { login, setAuthToken } from '@/lib/data';

describe('AdminLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with required fields', () => {
    render(<AdminLoginPage />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<AdminLoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('calls login function with correct credentials', async () => {
    const mockLoginResponse = { token: 'mock-token', user: { id: '1', username: 'admin' } };
    (login as jest.MockedFunction<typeof login>).mockResolvedValue(mockLoginResponse);

    render(<AdminLoginPage />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password123',
      });
      expect(setAuthToken).toHaveBeenCalledWith('mock-token');
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('shows error message on login failure', async () => {
    (login as jest.MockedFunction<typeof login>).mockResolvedValue(null);

    render(<AdminLoginPage />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    (login as jest.MockedFunction<typeof login>).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(null), 100))
    );

    render(<AdminLoginPage />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('clears error when user starts typing', async () => {
    render(<AdminLoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
    });
  });
});
