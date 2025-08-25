'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Send, 
  Trash2, 
  Edit, 
  Play, 
  Pause,
  CheckCircle,
  XCircle 
} from 'lucide-react'

interface ScheduledPost {
  id: string
  title: string
  content: string
  excerpt: string
  publishedAt: Date
  isScheduled: boolean
  tags: string[]
  imageUrl?: string
  author?: string
  createdAt: Date
  updatedAt: Date
}

interface PostAnalytics {
  id: string
  title: string
  published: boolean
  publishedAt: Date | null
  createdAt: Date
  scheduledFor: Date | null
  autoPublish: boolean
  timeUntilPublish: number
}

export function ContentSchedulerDashboard() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState('12:00')
  
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    imageUrl: '',
    author: '',
    autoPublish: true,
    notifyOnPublish: false,
    socialMediaShare: false
  })

  useEffect(() => {
    fetchScheduledPosts()
    const interval = setInterval(fetchScheduledPosts, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch('/api/admin/content/schedule')
      const data = await response.json()
      
      if (data.success) {
        setScheduledPosts(data.data)
      } else {
        setError(data.message || 'Failed to fetch scheduled posts')
      }
    } catch (error) {
      setError('Failed to fetch scheduled posts')
    } finally {
      setLoading(false)
    }
  }

  const schedulePost = async () => {
    if (!selectedDate || !newPost.title || !newPost.content) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const publishAt = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':')
      publishAt.setHours(parseInt(hours), parseInt(minutes))

      const response = await fetch('/api/admin/content/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newPost,
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          publishAt: publishAt.toISOString()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewPost({
          title: '',
          content: '',
          excerpt: '',
          tags: '',
          imageUrl: '',
          author: '',
          autoPublish: true,
          notifyOnPublish: false,
          socialMediaShare: false
        })
        setShowNewPostForm(false)
        fetchScheduledPosts()
      } else {
        setError(data.message || 'Failed to schedule post')
      }
    } catch (error) {
      setError('Failed to schedule post')
    } finally {
      setLoading(false)
    }
  }

  const publishNow = async (postId: string) => {
    try {
      const response = await fetch('/api/admin/content/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId,
          action: 'publish_now'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        fetchScheduledPosts()
      } else {
        setError(data.message || 'Failed to publish post')
      }
    } catch (error) {
      setError('Failed to publish post')
    }
  }

  const cancelPost = async (postId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post?')) return

    try {
      const response = await fetch('/api/admin/content/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId,
          action: 'cancel'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        fetchScheduledPosts()
      } else {
        setError(data.message || 'Failed to cancel post')
      }
    } catch (error) {
      setError('Failed to cancel post')
    }
  }

  const publishAllDue = async () => {
    try {
      const response = await fetch('/api/admin/content/publish', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        fetchScheduledPosts()
      } else {
        setError(data.message || 'Failed to publish scheduled posts')
      }
    } catch (error) {
      setError('Failed to publish scheduled posts')
    }
  }

  const formatTimeUntilPublish = (publishedAt: Date) => {
    const now = new Date()
    const publishDate = new Date(publishedAt)
    const diff = publishDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ready to publish'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const isReadyToPublish = (publishedAt: Date) => {
    return new Date(publishedAt) <= new Date()
  }

  if (loading && scheduledPosts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading scheduled posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Scheduler</h1>
        <div className="flex gap-2">
          <Button onClick={publishAllDue} variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Publish Due Posts
          </Button>
          <Button onClick={() => setShowNewPostForm(!showNewPostForm)}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule New Post
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showNewPostForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Post title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={newPost.author}
                  onChange={(e) => setNewPost(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Post content"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={newPost.excerpt}
                onChange={(e) => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Post excerpt (optional)"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Comma separated tags"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Featured image URL"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Publish Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Publish Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newPost.autoPublish}
                      onChange={(e) => setNewPost(prev => ({ ...prev, autoPublish: e.target.checked }))}
                    />
                    <span>Auto-publish when scheduled</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newPost.notifyOnPublish}
                      onChange={(e) => setNewPost(prev => ({ ...prev, notifyOnPublish: e.target.checked }))}
                    />
                    <span>Notify when published</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => setShowNewPostForm(false)} 
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={schedulePost} disabled={loading}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">
          Scheduled Posts ({scheduledPosts.length})
        </h2>
        
        {scheduledPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No scheduled posts found</p>
            </CardContent>
          </Card>
        ) : (
          scheduledPosts.map((post) => (
            <Card key={post.id} className={`${isReadyToPublish(post.publishedAt) ? 'border-green-500' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {isReadyToPublish(post.publishedAt) ? (
                            <span className="text-green-600 font-medium">Ready to publish</span>
                          ) : (
                            `Publishes in ${formatTimeUntilPublish(post.publishedAt)}`
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(post.publishedAt).toLocaleString()}</span>
                      </div>
                      
                      {post.author && (
                        <span>by {post.author}</span>
                      )}
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {isReadyToPublish(post.publishedAt) ? (
                      <Button 
                        onClick={() => publishNow(post.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Publish Now
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => publishNow(post.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Publish Early
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => cancelPost(post.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}