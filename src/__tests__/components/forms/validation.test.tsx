import React, { useState } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock validation functions
const validateEmail = (email: string): string[] => {
  const errors: string[] = []
  if (!email) {
    errors.push('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address')
  }
  return errors
}

const validatePassword = (password: string): string[] => {
  const errors: string[] = []
  if (!password) {
    errors.push('Password is required')
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  }
  return errors
}

const validateContent = (content: string): string[] => {
  const errors: string[] = []
  if (!content) {
    errors.push('Content is required')
  } else if (content.length < 10) {
    errors.push('Content must be at least 10 characters long')
  } else if (content.length > 1000) {
    errors.push('Content must be less than 1000 characters')
  }
  return errors
}

const validateTitle = (title: string): string[] => {
  const errors: string[] = []
  if (!title) {
    errors.push('Title is required')
  } else if (title.length < 3) {
    errors.push('Title must be at least 3 characters long')
  } else if (title.length > 100) {
    errors.push('Title must be less than 100 characters')
  }
  return errors
}

// Mock form component for testing
const TestForm: React.FC<{ 
  onSubmit: (data: Record<string, string>) => void; 
  initialData?: Record<string, string> 
}> = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData || {})
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string[]> = {}
    
    // Validate all fields that have values or are required
    newErrors.email = validateEmail(formData.email || '')
    newErrors.password = validatePassword(formData.password || '')
    newErrors.content = validateContent(formData.content || '')
    newErrors.title = validateTitle(formData.title || '')
    
    setErrors(newErrors)
    
    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(fieldErrors => fieldErrors.length > 0)
    
    if (!hasErrors) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  return (
    <form data-testid="test-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange('email')}
          aria-invalid={errors.email && errors.email.length > 0}
          aria-describedby={errors.email && errors.email.length > 0 ? 'email-errors' : undefined}
        />
        {errors.email && errors.email.length > 0 && (
          <div id="email-errors" role="alert">
            {errors.email?.map((error, index) => (
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
          value={formData.password || ''}
          onChange={handleChange('password')}
          aria-invalid={errors.password && errors.password.length > 0}
          aria-describedby={errors.password && errors.password.length > 0 ? 'password-errors' : undefined}
        />
        {errors.password && errors.password.length > 0 && (
          <div id="password-errors" role="alert">
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
          value={formData.title || ''}
          onChange={handleChange('title')}
          aria-invalid={errors.title && errors.title.length > 0}
          aria-describedby={errors.title && errors.title.length > 0 ? 'title-errors' : undefined}
        />
        {errors.title && errors.title.length > 0 && (
          <div id="title-errors" role="alert">
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
          value={formData.content || ''}
          onChange={handleChange('content')}
          aria-invalid={errors.content && errors.content.length > 0}
          aria-describedby={errors.content && errors.content.length > 0 ? 'content-errors' : undefined}
        />
        {errors.content && errors.content.length > 0 && (
          <div id="content-errors" role="alert">
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
    it('should show error for empty email', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ email: '' }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should show error for invalid email format', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ 
        email: 'invalid-email',
        password: 'Password123',
        title: 'Valid Title',
        content: 'This is valid content that is long enough'
      }} />)
      
      const form = screen.getByTestId('test-form')
      fireEvent.submit(form)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should accept valid email', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ 
        email: 'test@example.com',
        password: 'Password123',
        title: 'Valid Title',
        content: 'This is valid content that is long enough'
      }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Password Validation', () => {
    it('should show error for empty password', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ password: '' }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should show error for short password', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ password: '123' }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should show error for weak password', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ password: 'password' }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Password must contain at least one uppercase letter/)).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should accept strong password', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ 
        email: 'test@example.com',
        password: 'Password123',
        title: 'Valid Title',
        content: 'This is valid content that is long enough'
      }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Content Validation', () => {
    it('should show error for empty content', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ content: '' }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Content is required')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should show error for short content', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ content: 'short' }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Content must be at least 10 characters long')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should accept valid content', async () => {
      const mockSubmit = jest.fn()
      const validContent = 'This is a valid content that is long enough'
      render(<TestForm onSubmit={mockSubmit} initialData={{ 
        email: 'test@example.com',
        password: 'Password123',
        title: 'Valid Title',
        content: validContent
      }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Title Validation', () => {
    it('should show error for empty title', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ title: '' }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should show error for short title', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ title: 'Hi' }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters long')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should accept valid title', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} initialData={{ 
        email: 'test@example.com',
        password: 'Password123',
        title: 'Valid Title',
        content: 'This is valid content that is long enough'
      }} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Form Interaction', () => {
    it('should update form data when typing', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await userEvent.type(emailInput, 'test@example.com')
      
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should validate on submit', async () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)
      
      // Should not call onSubmit with empty form
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })
})
