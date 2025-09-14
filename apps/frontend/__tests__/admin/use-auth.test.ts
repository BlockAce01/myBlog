import { renderHook, act } from '@testing-library/react';

// Mock the data functions
jest.mock('@/lib/data', () => ({
  getAuthToken: jest.fn(),
  removeAuthToken: jest.fn(),
  isAuthenticated: jest.fn(),
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import { useAuth, useRequireAuth } from '@/hooks/use-auth';
import { getAuthToken, removeAuthToken, isAuthenticated } from '@/lib/data';

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthToken as jest.MockedFunction<typeof getAuthToken>).mockReturnValue(null);
    (isAuthenticated as jest.MockedFunction<typeof isAuthenticated>).mockReturnValue(false);
  });

  it('returns correct initial state when not authenticated', () => {
    (isAuthenticated as jest.MockedFunction<typeof isAuthenticated>).mockReturnValue(false);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.token).toBe(null);
  });

  it('returns correct initial state when authenticated', () => {
    (isAuthenticated as jest.MockedFunction<typeof isAuthenticated>).mockReturnValue(true);
    (getAuthToken as jest.MockedFunction<typeof getAuthToken>).mockReturnValue('mock-token');

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.token).toBe('mock-token');
  });

  it('logout function removes token and updates state', () => {
    (isAuthenticated as jest.MockedFunction<typeof isAuthenticated>).mockReturnValue(true);
    (getAuthToken as jest.MockedFunction<typeof getAuthToken>).mockReturnValue('mock-token');

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(removeAuthToken).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/admin/login');
  });
});

describe('useRequireAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  it('redirects to login when not authenticated', () => {
    (isAuthenticated as jest.MockedFunction<typeof isAuthenticated>).mockReturnValue(false);

    renderHook(() => useRequireAuth());

    expect(mockPush).toHaveBeenCalledWith('/admin/login');
  });

  it('does not redirect when authenticated', () => {
    (isAuthenticated as jest.MockedFunction<typeof isAuthenticated>).mockReturnValue(true);

    renderHook(() => useRequireAuth());

    expect(mockPush).not.toHaveBeenCalled();
  });
});
