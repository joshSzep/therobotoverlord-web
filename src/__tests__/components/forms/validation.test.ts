import { render, screen, userEvent, waitFor } from '@/__tests__/utils/test-utils'

// Mock form validation utilities
const mockValidation = {
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  validatePassword: (password: string) => {
    return {
      isValid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password),
      errors: [
        ...(password.length < 8 ? ['Password must be at least 8 characters'] : []),
        ...(/[A-Z]/.test(password) ? [] : ['Password must contain uppercase letter']),
        ...(/[0-9]/.test(password) ? [] : ['Password must contain a number'])
      ]
    }
  },

  validateRequired: (value: string) => {
    return value.trim().length > 0
  },

  validatePostTitle: (title: string) => {
    return {
      isValid: title.length >= 5 && title.length <= 100,
      errors: [
        ...(title.length < 5 ? ['Title must be at least 5 characters'] : []),
        ...(title.length > 100 ? ['Title must be less than 100 characters'] : [])
      ]
    }
  },

  validatePostContent: (content: string) => {
    const cleanContent = content.replace(/<[^>]*>/g, '').trim()
    return {
      isValid: cleanContent.length >= 10,
      errors: cleanContent.length < 10 ? ['Content must be at least 10 characters'] : []
    }
  }
}

// Mock form component for testing
const TestForm: React.FC<{
  onSubmit: (data: any) => void
  initialData?: any
}> = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = React.useState({
    email: initialData.email || '',
    password: initialData.password || '',
    title: initialData.title || '',
    content: initialData.content || ''
  })
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})

  const validateForm = () => {
    const newErrors: Record<string, string[]> = {}

    if (!mockValidation.validateRequired(formData.email)) {
      newErrors.email = ['Email is required']
    } else if (!mockValidation.validateEmail(formData.email)) {
      newErrors.email = ['Invalid email format']
    }

    const passwordValidation = mockValidation.validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors
    }

    const titleValidation = mockValidation.validatePostTitle(formData.title)
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.errors
    }

    const contentValidation = mockValidation.validatePostContent(formData.content)
    if (!contentValidation.isValid) {
      newErrors.content = contentValidation.errors
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="test-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <div id="email-error" role="alert">
            {errors.email.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <div id="password-error" role="alert">
            {errors.password.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="title">Post Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <div id="title-error" role="alert">
            {errors.title.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          aria-invalid={errors.content ? 'true' : 'false'}
          aria-describedby={errors.content ? 'content-error' : undefined}
        />
        {errors.content && (
          <div id="content-error" role="alert">
            {errors.content.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}

describe('Form Validation', () => {
  describe('Email Validation', () => {
    it('validates correct email format', () => {
      expect(mockValidation.validateEmail('user@example.com')).toBe(true)
      expect(mockValidation.validateEmail('test.email+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(mockValidation.validateEmail('invalid-email')).toBe(false)
      expect(mockValidation.validateEmail('user@')).toBe(false)
      expect(mockValidation.validateEmail('@domain.com')).toBe(false)
      expect(mockValidation.validateEmail('user@domain')).toBe(false)
    })
  })

  describe('Password Validation', () => {
    it('validates strong passwords', () => {
      const result = mockValidation.validatePassword('StrongPass123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects weak passwords', () => {
      const result = mockValidation.validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters')
      expect(result.errors).toContain('Password must contain uppercase letter')
      expect(result.errors).toContain('Password must contain a number')
    })

    it('provides specific error messages', () => {
      const noUppercase = mockValidation.validatePassword('lowercase123')
      expect(noUppercase.errors).toContain('Password must contain uppercase letter')

      const noNumber = mockValidation.validatePassword('NoNumbers')
      expect(noNumber.errors).toContain('Password must contain a number')
    })
  })

  describe('Post Title Validation', () => {
    it('validates proper title length', () => {
      const result = mockValidation.validatePostTitle('Valid Post Title')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects too short titles', () => {
      const result = mockValidation.validatePostTitle('Hi')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Title must be at least 5 characters')
    })

    it('rejects too long titles', () => {
      const longTitle = 'This is an extremely long title that exceeds the maximum character limit for post titles'
      const result = mockValidation.validatePostTitle(longTitle)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Title must be less than 100 characters')
    })
  })

  describe('Form Integration Tests', () => {
    it('submits form with valid data', async () => {
      const mockSubmit = jest.fn()
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={mockSubmit} />)
      
      await user.type(screen.getByLabelText(/email/i), 'user@example.com')
      await user.type(screen.getByLabelText(/password/i), 'StrongPass123')
      await user.type(screen.getByLabelText(/post title/i), 'Valid Post Title')
      await user.type(screen.getByLabelText(/content/i), 'This is valid post content with enough characters')
      
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'StrongPass123',
          title: 'Valid Post Title',
          content: 'This is valid post content with enough characters'
        })
      })
    })

    it('shows validation errors for invalid data', async () => {
      const mockSubmit = jest.fn()
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={mockSubmit} />)
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.type(screen.getByLabelText(/password/i), 'weak')
      await user.type(screen.getByLabelText(/post title/i), 'Hi')
      await user.type(screen.getByLabelText(/content/i), 'Short')
      
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
        expect(screen.getByText('Title must be at least 5 characters')).toBeInTheDocument()
        expect(screen.getByText('Content must be at least 10 characters')).toBeInTheDocument()
      })
      
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('shows proper ARIA attributes for validation', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={jest.fn()} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
        
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toHaveAttribute('id', 'email-error')
      })
    })

    it('clears errors when input becomes valid', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={jest.fn()} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      
      // Enter invalid email
      await user.type(emailInput, 'invalid')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })
      
      // Clear and enter valid email
      await user.clear(emailInput)
      await user.type(emailInput, 'valid@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument()
      })
    })

    it('handles real-time validation', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={jest.fn()} />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      
      // Type weak password
      await user.type(passwordInput, 'weak')
      await user.tab() // Trigger blur event
      
      // In a real implementation, you might validate on blur
      // For this test, we'll trigger validation by attempting submit
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })
  })
})
