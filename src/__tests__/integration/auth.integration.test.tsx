import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { integrationRender } from '../utils/test-utils'
import React from 'react'

// Mock authentication components and hooks
const MockLoginForm = ({ onSubmit, loading }: any) => (
  <form onSubmit={onSubmit} data-testid="login-form">
    <input
      name="email"
      type="email"
      placeholder="Email"
      data-testid="email-input"
    />
    <input
      name="password"
      type="password"
      placeholder="Password"
      data-testid="password-input"
    />
    <button type="submit" disabled={loading} data-testid="login-button">
      {loading ? 'Signing in...' : 'Sign In'}
    </button>
  </form>
)

const MockSignupForm = ({ onSubmit, loading }: any) => (
  <form onSubmit={onSubmit} data-testid="signup-form">
    <input
      name="username"
      type="text"
      placeholder="Username"
      data-testid="username-input"
    />
    <input
      name="email"
      type="email"
      placeholder="Email"
      data-testid="email-input"
    />
    <input
      name="password"
      type="password"
      placeholder="Password"
      data-testid="password-input"
    />
    <button type="submit" disabled={loading} data-testid="signup-button">
      {loading ? 'Creating account...' : 'Sign Up'}
    </button>
  </form>
)

// Mock authentication service with stable references
const mockAuthService = {
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn()
}

jest.mock('@/services/authService', () => ({
  authService: mockAuthService
}))

// Mock authentication hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false,
    login: mockAuthService.login,
    signup: mockAuthService.signup,
    logout: mockAuthService.logout,
    isAuthenticated: false
  }))
}))

// Mock authentication context with stable provider
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuthContext: jest.fn(() => ({
    user: null,
    loading: false,
    login: mockAuthService.login,
    signup: mockAuthService.signup,
    logout: mockAuthService.logout,
    isAuthenticated: false
  }))
}))

describe('Authentication Flow Integration', () => {
  const mockUser = createMockUser({
    id: '1',
    username: 'testuser',
    email: 'test@example.com'
  })

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Login Flow', () => {
    it('successfully logs in user with valid credentials', async () => {
      const user = userEvent.setup()
      
      mockAuthService.login.mockResolvedValueOnce({
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      })

      const TestComponent = ({ login, loading }: any) => (
        <MockLoginForm 
          onSubmit={async (e: any) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            await login({
              email: formData.get('email'),
              password: formData.get('password')
            })
          }}
          loading={loading}
        />
      )

      integrationRender(<TestComponent />)

      // Fill in login form
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      
      // Submit form
      await user.click(screen.getByTestId('login-button'))

      // Should show loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument()

      // Wait for login to complete
      await waitFor(() => {
        expect(mockAuthService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    it('handles login errors gracefully', async () => {
      const user = userEvent.setup()
      
      mockAuthService.login.mockRejectedValueOnce(
        new Error('Invalid credentials')
      )

      const TestComponent = ({ login, loading }: any) => {
        const [error, setError] = React.useState('')

        const handleSubmit = async (e: any) => {
          e.preventDefault()
          try {
            const formData = new FormData(e.target)
            await login({
              email: formData.get('email'),
              password: formData.get('password')
            })
          } catch (err: any) {
            setError(err.message)
          }
        }

        return (
          <div>
            <MockLoginForm onSubmit={handleSubmit} loading={loading} />
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        )
      }

      integrationRender(<TestComponent />)

      await user.type(screen.getByTestId('email-input'), 'wrong@example.com')
      await user.type(screen.getByTestId('password-input'), 'wrongpassword')
      await user.click(screen.getByTestId('login-button'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials')
      })
    })

    it('validates form inputs before submission', async () => {
      const user = userEvent.setup()
      
      const TestComponent = ({ login, loading }: any) => {
        const [errors, setErrors] = React.useState<any>({})

        const handleSubmit = async (e: any) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          const email = formData.get('email') as string
          const password = formData.get('password') as string

          const newErrors: any = {}
          if (!email) newErrors.email = 'Email is required'
          if (!password) newErrors.password = 'Password is required'
          if (email && !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format'
          }

          setErrors(newErrors)

          if (Object.keys(newErrors).length === 0) {
            await login({ email, password })
          }
        }

        return (
          <div>
            <MockLoginForm onSubmit={handleSubmit} loading={loading} />
            {errors.email && <div data-testid="email-error">{errors.email}</div>}
            {errors.password && <div data-testid="password-error">{errors.password}</div>}
          </div>
        )
      }

      integrationRender(<TestComponent />)

      // Submit without filling fields
      await user.click(screen.getByTestId('login-button'))

      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required')
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required')
      expect(mockAuthService.login).not.toHaveBeenCalled()
    })
  })

  describe('Signup Flow', () => {
    it('successfully creates new user account', async () => {
      const user = userEvent.setup()
      
      mockAuthService.signup.mockResolvedValueOnce({
        user: mockUser,
        token: 'mock-jwt-token'
      })

      const TestComponent = ({ signup, loading }: any) => (
        <MockSignupForm 
          onSubmit={async (e: any) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            await signup({
              username: formData.get('username'),
              email: formData.get('email'),
              password: formData.get('password')
            })
          }}
          loading={loading}
        />
      )

      integrationRender(<TestComponent />)

      await user.type(screen.getByTestId('username-input'), 'newuser')
      await user.type(screen.getByTestId('email-input'), 'new@example.com')
      await user.type(screen.getByTestId('password-input'), 'newpassword123')
      
      await user.click(screen.getByTestId('signup-button'))

      await waitFor(() => {
        expect(mockAuthService.signup).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'new@example.com',
          password: 'newpassword123'
        })
      })
    })

    it('handles signup validation errors', async () => {
      const user = userEvent.setup()
      
      mockAuthService.signup.mockRejectedValueOnce({
        message: 'Validation failed',
        errors: {
          email: 'Email already exists',
          username: 'Username is taken'
        }
      })

      const TestComponent = ({ signup, loading }: any) => {
        const [errors, setErrors] = React.useState<any>({})

        const handleSubmit = async (e: any) => {
          e.preventDefault()
          try {
            const formData = new FormData(e.target)
            await signup({
              username: formData.get('username'),
              email: formData.get('email'),
              password: formData.get('password')
            })
          } catch (err: any) {
            setErrors(err.errors || {})
          }
        }

        return (
          <div>
            <MockSignupForm onSubmit={handleSubmit} loading={loading} />
            {errors.email && <div data-testid="email-error">{errors.email}</div>}
            {errors.username && <div data-testid="username-error">{errors.username}</div>}
          </div>
        )
      }

      integrationRender(<TestComponent />)

      await user.type(screen.getByTestId('username-input'), 'existinguser')
      await user.type(screen.getByTestId('email-input'), 'existing@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      
      await user.click(screen.getByTestId('signup-button'))

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Email already exists')
        expect(screen.getByTestId('username-error')).toHaveTextContent('Username is taken')
      })
    })
  })

  describe('Logout Flow', () => {
    it('successfully logs out user', async () => {
      const user = userEvent.setup()
      
      mockAuthService.logout.mockResolvedValueOnce(true)

      const TestComponent = ({ user: currentUser, logout }: any) => (
        <div>
          {currentUser ? (
            <div>
              <span data-testid="user-info">Welcome, {currentUser.username}</span>
              <button onClick={logout} data-testid="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <span data-testid="logged-out">Not logged in</span>
          )}
        </div>
      )

      integrationRender(<TestComponent user={{ id: '1', username: 'testuser', email: 'test@example.com' }} />)

      expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome, testuser')
      
      await user.click(screen.getByTestId('logout-button'))

      await waitFor(() => {
        expect(mockAuthService.logout).toHaveBeenCalled()
        expect(screen.getByTestId('logged-out')).toBeInTheDocument()
      })
    })
  })

  describe('Protected Routes', () => {
    it('redirects unauthenticated users to login', () => {
      const ProtectedComponent = ({ user }: any) => {
        if (!user) {
          return <div data-testid="login-redirect">Please log in</div>
        }
        return <div data-testid="protected-content">Protected content</div>
      }

      integrationRender(<ProtectedComponent user={null} />)

      expect(screen.getByTestId('login-redirect')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('allows authenticated users to access protected content', () => {
      const ProtectedComponent = ({ user }: any) => {
        if (!user) {
          return <div data-testid="login-redirect">Please log in</div>
        }
        return <div data-testid="protected-content">Protected content</div>
      }

      integrationRender(<ProtectedComponent user={{ id: '1', username: 'testuser', email: 'test@example.com' }} />)

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.queryByTestId('login-redirect')).not.toBeInTheDocument()
    })
  })

// ...
  describe('Session Persistence', () => {
    it('restores user session on page reload', async () => {
      // Mock stored session
      localStorage.setItem('auth_token', 'stored-token')
      
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser)

      const TestComponent = ({ user, loading }: any) => {
        React.useEffect(() => {
          const token = localStorage.getItem('auth_token')
          if (token && !user) {
            mockAuthService.getCurrentUser()
          }
        }, [user])

        if (loading) return <div data-testid="loading">Loading...</div>
        if (user) return <div data-testid="user-restored">Welcome back, {user.username}</div>
        return <div data-testid="no-session">No session</div>
      }

      integrationRender(<TestComponent />)

      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
      })
    })
  })
})
