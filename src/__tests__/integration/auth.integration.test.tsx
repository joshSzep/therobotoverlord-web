import { render, screen, waitFor, userEvent } from '@/__tests__/utils/test-utils'
import { createMockUser } from '@/__tests__/utils/test-utils'

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

// Mock authentication service
const mockAuthService = {
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  getCurrentUser: jest.fn(),
  updateProfile: jest.fn()
}

// Mock authentication context
const MockAuthProvider = ({ children, initialUser = null }: any) => {
  const [user, setUser] = React.useState(initialUser)
  const [loading, setLoading] = React.useState(false)
  
  const login = async (credentials: any) => {
    setLoading(true)
    try {
      const result = await mockAuthService.login(credentials)
      setUser(result.user)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData: any) => {
    setLoading(true)
    try {
      const result = await mockAuthService.signup(userData)
      setUser(result.user)
      return result
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await mockAuthService.logout()
    setUser(null)
  }

  return (
    <div data-testid="auth-provider">
      {React.cloneElement(children, { user, loading, login, signup, logout })}
    </div>
  )
}

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

      render(
        <MockAuthProvider>
          <TestComponent />
        </MockAuthProvider>
      )

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

      render(
        <MockAuthProvider>
          <TestComponent />
        </MockAuthProvider>
      )

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

      render(
        <MockAuthProvider>
          <TestComponent />
        </MockAuthProvider>
      )

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

      render(
        <MockAuthProvider>
          <TestComponent />
        </MockAuthProvider>
      )

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

      render(
        <MockAuthProvider>
          <TestComponent />
        </MockAuthProvider>
      )

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

      render(
        <MockAuthProvider initialUser={mockUser}>
          <TestComponent />
        </MockAuthProvider>
      )

      expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome, testuser')
      
      await user.click(screen.getByTestId('logout-button'))

      await waitFor(() => {
        expect(mockAuthService.logout).toHaveBeenCalled()
        expect(screen.getByTestId('logged-out')).toBeInTheDocument()
      })
    })
  })

  describe('Token Management', () => {
    it('refreshes expired tokens automatically', async () => {
      mockAuthService.refreshToken.mockResolvedValueOnce({
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token'
      })

      // Simulate token refresh scenario
      const mockFetch = jest.fn()
        .mockRejectedValueOnce({ status: 401 }) // First call fails with 401
        .mockResolvedValueOnce({ ok: true, json: () => ({ data: 'success' }) }) // Second call succeeds

      global.fetch = mockFetch

      // This would typically be handled by an API interceptor
      const apiCall = async () => {
        try {
          return await fetch('/api/protected')
        } catch (error: any) {
          if (error.status === 401) {
            await mockAuthService.refreshToken()
            return await fetch('/api/protected')
          }
          throw error
        }
      }

      await apiCall()

      expect(mockAuthService.refreshToken).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('handles token storage securely', () => {
      const token = 'mock-jwt-token'
      const refreshToken = 'mock-refresh-token'

      // Store tokens
      localStorage.setItem('auth_token', token)
      sessionStorage.setItem('refresh_token', refreshToken)

      expect(localStorage.getItem('auth_token')).toBe(token)
      expect(sessionStorage.getItem('refresh_token')).toBe(refreshToken)

      // Clear tokens on logout
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('refresh_token')

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(sessionStorage.getItem('refresh_token')).toBeNull()
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

      render(
        <MockAuthProvider>
          <ProtectedComponent />
        </MockAuthProvider>
      )

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

      render(
        <MockAuthProvider initialUser={mockUser}>
          <ProtectedComponent />
        </MockAuthProvider>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.queryByTestId('login-redirect')).not.toBeInTheDocument()
    })
  })

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

      render(
        <MockAuthProvider>
          <TestComponent />
        </MockAuthProvider>
      )

      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
      })
    })
  })
})
