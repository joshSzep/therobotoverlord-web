import { render, screen } from '@/__tests__/utils/test-utils'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default styling', () => {
      render(
        <Card data-testid="card">
          <div>Card content</div>
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('card')
    })

    it('applies custom className', () => {
      render(
        <Card className="custom-card" data-testid="card">
          <div>Card content</div>
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('card', 'custom-card')
    })

    it('forwards props correctly', () => {
      render(
        <Card data-testid="card" role="region" aria-label="Test card">
          <div>Card content</div>
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('role', 'region')
      expect(card).toHaveAttribute('aria-label', 'Test card')
    })
  })

  describe('CardHeader', () => {
    it('renders header content', () => {
      render(
        <Card>
          <CardHeader>
            <h2>Card Title</h2>
          </CardHeader>
        </Card>
      )
      
      const header = screen.getByRole('heading', { level: 2 })
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('Card Title')
    })

    it('applies header styling', () => {
      render(
        <Card>
          <CardHeader data-testid="header">
            <h2>Card Title</h2>
          </CardHeader>
        </Card>
      )
      
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('card-header')
    })
  })

  describe('CardContent', () => {
    it('renders content area', () => {
      render(
        <Card>
          <CardContent data-testid="content">
            <p>This is card content</p>
          </CardContent>
        </Card>
      )
      
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('card-content')
      expect(content).toHaveTextContent('This is card content')
    })
  })

  describe('CardFooter', () => {
    it('renders footer area', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('card-footer')
      
      const button = screen.getByRole('button', { name: /action/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Complete Card', () => {
    it('renders all sections together', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <h3>Complete Card</h3>
          </CardHeader>
          <CardContent>
            <p>This card has all sections</p>
          </CardContent>
          <CardFooter>
            <button>Save</button>
            <button>Cancel</button>
          </CardFooter>
        </Card>
      )
      
      const card = screen.getByTestId('complete-card')
      expect(card).toBeInTheDocument()
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Complete Card')
      expect(screen.getByText('This card has all sections')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('maintains proper semantic structure', () => {
      render(
        <Card role="article" aria-labelledby="card-title">
          <CardHeader>
            <h2 id="card-title">Article Title</h2>
          </CardHeader>
          <CardContent>
            <p>Article content goes here</p>
          </CardContent>
        </Card>
      )
      
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-labelledby', 'card-title')
      
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveAttribute('id', 'card-title')
    })
  })
})
