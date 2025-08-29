"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormInput, FormField } from '@/components/ui/form-field'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor'
import { CategorySelect } from '@/components/ui/category-select'
import { TagsSelect } from '@/components/ui/tags-select'
import { ImageUpload } from '@/components/ui/image-upload'
import { Pagination } from '@/components/ui/pagination'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  category: string | null
  tags: string | null
  metaTitle: string | null
  metaDescription: string | null
  isDraft: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export default function BlogManagementPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const { toast } = useToast()
  const postsPerPage = 15

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    category: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    isDraft: true
  })

  useEffect(() => {
    loadBlogPosts()
  }, [currentPage, searchTerm])

  const loadBlogPosts = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: postsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/admin/blog?${queryParams}`)
      const data = await response.json()
      
      if (data.success) {
        setBlogPosts(data.data || [])
        if (data.pagination) {
          setTotalPages(data.pagination.pages)
          setTotalPosts(data.pagination.total)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load blog posts",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
      toast({
        title: "Error", 
        description: "Failed to load blog posts",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSubmit = async (e: React.FormEvent, isDraftOverride?: boolean) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive"
      })
      return
    }

    try {
      const slug = formData.slug || generateSlug(formData.title)
      const isDraftValue = isDraftOverride !== undefined ? isDraftOverride : formData.isDraft
      
      const postData = {
        ...formData,
        slug,
        isDraft: isDraftValue,
        tags: formData.tags ? JSON.stringify(formData.tags.split(',').map(t => t.trim())) : null
      }

      const url = editingPost 
        ? `/api/admin/blog`
        : '/api/admin/blog'
        
      const method = editingPost ? 'PUT' : 'POST'
      
      if (editingPost) {
        (postData as any).id = editingPost.id
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingPost 
            ? (isDraftValue ? "Blog post saved as draft" : "Blog post published successfully")
            : (isDraftValue ? "Blog post created as draft" : "Blog post published successfully")
        })
        resetForm()
        loadBlogPosts()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featuredImage: post.featuredImage || '',
      category: post.category || '',
      tags: post.tags ? (
        typeof post.tags === 'string' 
          ? (() => {
              try {
                return JSON.parse(post.tags).join(', ')
              } catch (error) {
                return post.tags // If not valid JSON, treat as string
              }
            })()
          : post.tags
      ) : '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      isDraft: post.isDraft
    })
    setShowForm(true)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const response = await fetch(`/api/admin/blog?id=${postId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Blog post deleted successfully"
        })
        loadBlogPosts()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      category: '',
      tags: '',
      metaTitle: '',
      metaDescription: '',
      isDraft: true
    })
    setEditingPost(null)
    setShowForm(false)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  // Posts are now filtered server-side via API

  if (isLoading) {
    return (
      <AdminLayout title="Blog Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Blog Management">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-8 shadow-lg border border-indigo-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 mb-3">Blog Management</h1>
              <p className="text-lg text-indigo-700">Create, edit, and manage your blog posts with advanced publishing tools.</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6 rounded-lg font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Add New Post
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{blogPosts.length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ All articles</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Published</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{blogPosts.filter(p => !p.isDraft).length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Live posts</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Drafts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{blogPosts.filter(p => p.isDraft).length}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ In progress</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Edit className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{new Set(blogPosts.map(p => p.category).filter(Boolean)).size}</p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">↗ Topics covered</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {!showForm ? (
          /* Blog Posts List */
          <div className="space-y-6">
            {/* Search */}
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search blog posts by title or category..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 text-lg rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </Card>

            {/* Posts List - Responsive Design */}
            <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm font-bold text-indigo-900 uppercase tracking-wide">Actions</th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-indigo-900 uppercase tracking-wide">Title</th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-indigo-900 uppercase tracking-wide">Category</th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-indigo-900 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-indigo-900 uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {blogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-6">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(post)}
                              className="px-3 py-2 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                              title="Edit post"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 px-3 py-2 rounded-lg border-gray-200 transition-colors"
                              onClick={() => handleDelete(post.id)}
                              title="Delete post"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="min-w-0">
                            <div className="text-base font-semibold text-gray-900">{post.title}</div>
                            <div className="text-sm text-gray-500 truncate mt-1">{post.slug}</div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="inline-flex px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                            {post.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg whitespace-nowrap border ${
                            post.isDraft 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {post.isDraft ? 'Draft' : 'Published'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm text-gray-600">
                          <div className="flex items-center whitespace-nowrap">
                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                            <span className="truncate font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden">
                <div className="divide-y divide-gray-100">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                      {/* Mobile First Layout */}
                      <div className="space-y-4">
                        {/* Title and Actions Row */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 leading-tight">{post.title}</h3>
                          {/* Action buttons - always visible without scrolling */}
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(post)}
                              className="px-2 py-2 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                              title="Edit post"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 px-2 py-2 rounded-lg border-gray-200 transition-colors"
                              onClick={() => handleDelete(post.id)}
                              title="Delete post"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Slug */}
                        <div className="text-sm text-gray-500 font-mono break-all">{post.slug}</div>
                        
                        {/* Meta information - responsive stacking */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                              {post.category || 'Uncategorized'}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md border ${
                              post.isDraft 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {post.isDraft ? 'Draft' : 'Published'}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {blogPosts.length === 0 && (
                <div className="text-center py-16 px-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No blog posts found</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">Get started by creating your first blog post to share your thoughts and expertise.</p>
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-lg font-medium shadow-sm">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Post
                  </Button>
                </div>
              )}
            </Card>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalPosts}
              itemsPerPage={postsPerPage}
            />
          </div>
        ) : (
          /* Blog Form */
          <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-8 border-b border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-900">
                    {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </h2>
                  <p className="text-sm text-indigo-700 mt-1">
                    {editingPost ? 'Update your existing post' : 'Share your thoughts and expertise'}
                  </p>
                </div>
                <Button variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-medium">
                  Cancel
                </Button>
              </div>
            </div>
            <div className="p-8">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  label="Title"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter blog post title"
                  required
                />
                <FormInput
                  label="Slug"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="Auto-generated from title"
                />
              </div>

              <FormField label="Content" id="content" required>
                <WysiwygEditor
                  value={formData.content}
                  onChange={(content) => setFormData({...formData, content})}
                  placeholder="Write your blog post content here..."
                  height={500}
                  className="mt-2"
                  showWordCount={true}
                  showCharCount={true}
                  maxWords={2000}
                  maxChars={10000}
                  onSave={() => handleSubmit(new Event('submit') as any, formData.isDraft)}
                />
              </FormField>

              <FormField label="Excerpt" id="excerpt">
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Brief summary of the post (optional)"
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </FormField>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategorySelect
                  value={formData.category}
                  onChange={(category) => setFormData({...formData, category})}
                  placeholder="Select or type a category"
                  label="Category"
                  id="category"
                />
                <TagsSelect
                  value={formData.tags}
                  onChange={(tags) => setFormData({...formData, tags})}
                  placeholder="Select or add tags"
                  label="Tags"
                  id="tags"
                />
              </div>

              <ImageUpload
                value={formData.featuredImage}
                onChange={(featuredImage) => setFormData({...formData, featuredImage})}
                label="Featured Image"
                placeholder="Enter image URL or upload a file"
                id="featuredImage"
                folder="blog"
                maxSize={4}
                recommendedDimensions={{
                  width: 1200,
                  height: 630,
                  aspectRatio: "16:9"
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  label="Meta Title"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                  placeholder="SEO title (optional)"
                />
                <FormInput
                  label="Meta Description"
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                  placeholder="SEO description (optional)"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg border-gray-300 hover:bg-gray-50 font-medium">
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={(e) => handleSubmit(e, true)}
                  className="h-11 px-6 rounded-lg border-amber-300 text-amber-700 hover:bg-amber-50 font-medium"
                >
                  Save as Draft
                </Button>
                <Button 
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  className="h-11 px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                >
                  {editingPost ? 'Publish Changes' : 'Publish Post'}
                </Button>
              </div>
            </form>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}