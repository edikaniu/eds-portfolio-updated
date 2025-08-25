import { render, screen, waitFor, fireEvent } from '../../utils/test-utils'
import { BlogSection } from '@/components/blog-section'
import { mockFetch, createMockBlogPost } from '../../utils/test-utils'

// Mock next/link
jest.mock('next/link', () => {
  return function MockedLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('BlogSection', () => {
  const mockBlogPosts = [
    createMockBlogPost({
      id: '1',
      title: 'First Blog Post',
      slug: 'first-blog-post',
      excerpt: 'This is the first blog post excerpt',
      category: 'Technology',
      date: '2024-01-01',
      readTime: '5 min read',
      image: 'https://example.com/image1.jpg',
      author: 'John Doe',
    }),
    createMockBlogPost({
      id: '2',
      title: 'Second Blog Post',
      slug: 'second-blog-post',
      excerpt: 'This is the second blog post excerpt',
      category: 'Design',
      date: '2024-01-02',
      readTime: '8 min read',
      image: 'https://example.com/image2.jpg',
      author: 'Jane Smith',
    }),
  ]

  beforeEach(() => {
    mockFetch({
      success: true,
      data: mockBlogPosts,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders blog section with title', async () => {
    render(<BlogSection />)

    expect(screen.getByText('Latest Blog Posts')).toBeInTheDocument()
    expect(
      screen.getByText('Insights, tutorials, and thoughts on web development')
    ).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    render(<BlogSection />)

    expect(screen.getByText('Loading blog posts...')).toBeInTheDocument()
  })

  it('renders blog posts after loading', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      expect(screen.getByText('First Blog Post')).toBeInTheDocument()
      expect(screen.getByText('Second Blog Post')).toBeInTheDocument()
    })

    expect(screen.getByText('This is the first blog post excerpt')).toBeInTheDocument()
    expect(screen.getByText('This is the second blog post excerpt')).toBeInTheDocument()
  })

  it('displays blog post metadata correctly', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument()
      expect(screen.getByText('Design')).toBeInTheDocument()
      expect(screen.getByText('5 min read')).toBeInTheDocument()
      expect(screen.getByText('8 min read')).toBeInTheDocument()
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument()
      expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument()
    })
  })

  it('renders links to individual blog posts', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      const firstPostLink = screen.getByRole('link', { name: /first blog post/i })
      const secondPostLink = screen.getByRole('link', { name: /second blog post/i })

      expect(firstPostLink).toHaveAttribute('href', '/blog/first-blog-post')
      expect(secondPostLink).toHaveAttribute('href', '/blog/second-blog-post')
    })
  })

  it('displays "View All Posts" link', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      const viewAllLink = screen.getByRole('link', { name: /view all posts/i })
      expect(viewAllLink).toHaveAttribute('href', '/blog')
    })
  })

  it('handles API error gracefully', async () => {
    mockFetch({ success: false, message: 'Failed to fetch' }, 500)

    render(<BlogSection />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load blog posts')).toBeInTheDocument()
    })
  })

  it('handles empty blog posts array', async () => {
    mockFetch({
      success: true,
      data: [],
    })

    render(<BlogSection />)

    await waitFor(() => {
      expect(screen.getByText('No blog posts available')).toBeInTheDocument()
    })
  })

  it('renders blog post images with correct attributes', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      const images = screen.getAllByRole('img')
      
      expect(images[0]).toHaveAttribute('alt', 'First Blog Post')
      expect(images[1]).toHaveAttribute('alt', 'Second Blog Post')
    })
  })

  it('handles hover interactions on blog post cards', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      const firstPostCard = screen.getByText('First Blog Post').closest('.blog-post-card')
      expect(firstPostCard).toBeInTheDocument()

      if (firstPostCard) {
        fireEvent.mouseEnter(firstPostCard)
        expect(firstPostCard).toHaveClass('hover:shadow-lg')
      }
    })
  })

  it('displays author information when available', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('handles category badges correctly', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      const technologyBadge = screen.getByText('Technology')
      const designBadge = screen.getByText('Design')

      expect(technologyBadge).toHaveClass('badge', 'category-technology')
      expect(designBadge).toHaveClass('badge', 'category-design')
    })
  })

  it('fetches limited number of posts for preview', () => {
    render(<BlogSection />)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/blog?limit=3',
      expect.any(Object)
    )
  })

  it('retries failed API calls', async () => {
    // Mock first call to fail, second to succeed
    mockFetch({ success: false }, 500)
    
    render(<BlogSection />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load blog posts')).toBeInTheDocument()
    })

    // Mock successful retry
    mockFetch({
      success: true,
      data: mockBlogPosts,
    })

    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('First Blog Post')).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      const section = screen.getByRole('region', { name: /blog posts/i })
      expect(section).toBeInTheDocument()

      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings).toHaveLength(2) // Two blog post titles
    })
  })

  it('supports keyboard navigation', async () => {
    render(<BlogSection />)

    await waitFor(() => {
      const firstPostLink = screen.getByRole('link', { name: /first blog post/i })
      
      firstPostLink.focus()
      expect(firstPostLink).toHaveFocus()

      // Test tab navigation
      fireEvent.keyDown(firstPostLink, { key: 'Tab' })
      const secondPostLink = screen.getByRole('link', { name: /second blog post/i })
      expect(secondPostLink).toHaveFocus()
    })
  })
})