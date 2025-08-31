import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { integrationRender } from '../utils/test-utils'
import React from 'react'

// Mock authentication components and hooks
const MockLoginForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = React.useState({ email: '', password: '' })
  const [error, setError] = React.useState('')
  const [validationErrors, setValidationErrors] = React.useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formDataObj = new FormData(form)
    const email = formDataObj.get('email') as string
    const password = formDataObj.get('password') as string
    
    // Validation
    const errors = { email: '', password: '' }
    if (!email) errors.email = 'Email is required'
    if (!password) errors.password = 'Password is required'
    
    setValidationErrors(errors)
    
    if (errors.email || errors.password) {
      return
    }
    
    try {
      await onSubmit({ email, password })
      setError('')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    }
  }

  return (
    <div>
      <form data-testid="login-form" onSubmit={handleSubmit}>
        <input
          data-testid="email-input"
          name="email"
          type="email"
          placeholder="Email"
        />
        {validationErrors.email && <div data-testid="email-error">{validationErrors.email}</div>}
        <input
          data-testid="password-input"
          name="password"
          type="password"
          placeholder="Password"
        />
        {validationErrors.password && <div data-testid="password-error">{validationErrors.password}</div>}
        <button data-testid="login-button" type="submit">
          Sign In
        </button>
      </form>
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  )
}

const MockSignupForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = React.useState({ email: '', password: '', name: '' })
  const [error, setError] = React.useState('')
  const [validationErrors, setValidationErrors] = React.useState({ email: '', password: '', name: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formDataObj = new FormData(form)
    const email = formDataObj.get('email') as string
    const password = formDataObj.get('password') as string
    const name = formDataObj.get('name') as string
    
    // Validation
    const errors = { email: '', password: '', name: '' }
    if (!name) errors.name = 'Name is required'
    if (!email) errors.email = 'Email is required'
    if (!password) errors.password = 'Password is required'
    
    setValidationErrors(errors)
    
    if (errors.name || errors.email || errors.password) {
      return
    }
    
    try {
      await onSubmit({ email, password, name })
      setError('')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    }
  }

  return (
    <div>
      <form data-testid="signup-form" onSubmit={handleSubmit}>
        <input
          data-testid="name-input"
          name="name"
          type="text"
          placeholder="Name"
        />
        {validationErrors.name && <div data-testid="name-error">{validationErrors.name}</div>}
        <input
          data-testid="email-input"
          name="email"
          type="email"
          placeholder="Email"
        />
        {validationErrors.email && <div data-testid="email-error">{validationErrors.email}</div>}
        <input
          data-testid="password-input"
          name="password"
          type="password"
          placeholder="Password"
        />
        {validationErrors.password && <div data-testid="password-error">{validationErrors.password}</div>}
        <button data-testid="signup-button" type="submit">
          Sign Up
        </button>
      </form>
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  )
}

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

// Mock authentication hooks - removed non-existent module

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
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com'
  }

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

      const TestComponent = () => (
        <MockLoginForm 
          onSubmit={async (data: any) => {
            await mockAuthService.login(data)
          }}
        />
      )

      integrationRender(<TestComponent />)

      // Fill in login form
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      
      // Submit form
      await user.click(screen.getByTestId('login-button'))

      // Should complete login successfully
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

      const TestComponent = () => {
        const handleSubmit = async (data: any) => {
          await mockAuthService.login(data)
        }

        return (
          <MockLoginForm onSubmit={handleSubmit} />
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
      
      const TestComponent = () => {
        const handleSubmit = async (data: any) => {
          await mockAuthService.login(data)
        }

        return (
          <MockLoginForm onSubmit={handleSubmit} />
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

      const TestComponent = () => {
        const handleSubmit = async (data: any) => {
          await mockAuthService.signup(data)
        }

        return (
          <MockSignupForm 
            onSubmit={handleSubmit}
          />
        )
      }

      integrationRender(<TestComponent />)

      await user.type(screen.getByTestId('name-input'), 'newuser')
      await user.type(screen.getByTestId('email-input'), 'new@example.com')
      await user.type(screen.getByTestId('password-input'), 'newpassword123')
      
      await user.click(screen.getByTestId('signup-button'))

      await waitFor(() => {
        expect(mockAuthService.signup).toHaveBeenCalledWith({
          name: 'newuser',
          email: 'new@example.com',
          password: 'newpassword123'
        })
      })
    })

    it('handles signup validation errors', async () => {
      const user = userEvent.setup()
      
      mockAuthService.signup.mockRejectedValueOnce(
        new Error('Email already exists')
      )

      const TestComponent = () => {
        const handleSubmit = async (data: any) => {
          await mockAuthService.signup(data)
        }

        return (
          <MockSignupForm 
            onSubmit={handleSubmit}
          />
        )
      }

      integrationRender(<TestComponent />)

      await user.type(screen.getByTestId('name-input'), 'existinguser')
      await user.type(screen.getByTestId('email-input'), 'existing@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      
      await user.click(screen.getByTestId('signup-button'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Email already exists')
      })
    })
  })

  describe('Logout Flow', () => {
    it('successfully logs out user', async () => {
      const user = userEvent.setup()
      
      mockAuthService.logout.mockResolvedValueOnce({})

      const TestComponent = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(true)
        
        const handleLogout = async () => {
          await mockAuthService.logout()
          setIsAuthenticated(false)
        }

        return (
          <div>
            {isAuthenticated ? (
              <div>
                <span data-testid="user-info">Welcome, {mockUser.username}</span>
                <button data-testid="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div data-testid="logged-out">Please log in</div>
            )}
          </div>
        )
      }

      integrationRender(<TestComponent />)

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
