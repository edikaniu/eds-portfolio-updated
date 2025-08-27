"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Copy, 
  Download,
  Eye,
  Info,
  Image as ImageIcon,
  Folder,
  Calendar,
  FileText,
  X,
  Check,
  RefreshCw,
  FolderPlus
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { formatBytes } from '@/lib/utils'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  size: number
  type: string
  folder: string
  uploadedAt: string
  dimensions?: {
    width: number
    height: number
  }
}

export default function MediaManagementPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const { toast } = useToast()

  const folders = ['general', 'profile', 'portfolio', 'blog', 'projects']

  useEffect(() => {
    loadMediaFiles()
  }, [])

  useEffect(() => {
    filterFiles()
  }, [files, searchTerm, selectedFolder])

  const loadMediaFiles = async () => {
    try {
      const response = await fetch('/api/admin/media')
      const data = await response.json()
      
      if (data.success) {
        setFiles(data.data || [])
      }
    } catch (error) {
      console.error('Error loading media files:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterFiles = () => {
    let filtered = files

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.filename.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by folder
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(file => file.folder === selectedFolder)
    }

    setFilteredFiles(filtered)
  }

  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', selectedFolder === 'all' ? 'general' : selectedFolder)

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.message)
        }

        return result.data
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}: ${error}`,
          variant: "destructive"
        })
        return null
      }
    })

    try {
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(Boolean)
      
      if (successfulUploads.length > 0) {
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${successfulUploads.length} file(s)`
        })
        loadMediaFiles()
        setShowUploadZone(false)
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Some files failed to upload",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Copied",
        description: "URL copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Copy Failed", 
        description: "Failed to copy URL",
        variant: "destructive"
      })
    }
  }

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      newSelected.add(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return

    try {
      const response = await fetch('/api/admin/media/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: Array.from(selectedFiles) })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Files Deleted",
          description: `Successfully deleted ${selectedFiles.size} file(s)`
        })
        loadMediaFiles()
        setSelectedFiles(new Set())
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete files",
        variant: "destructive"
      })
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  return (
    <AdminLayout title="Media Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 shadow-lg border border-purple-200">
          <h1 className="text-3xl font-bold mb-3 text-purple-900">Media Management</h1>
          <p className="text-lg text-purple-700">Upload, organize and manage your portfolio media files.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Folder Filter */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Upload Button */}
            <Button onClick={() => setShowUploadZone(!showUploadZone)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>

            {/* Refresh */}
            <Button variant="outline" onClick={loadMediaFiles}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Files Actions */}
        {selectedFiles.size > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">
                  {selectedFiles.size} file(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedFiles}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFiles(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Zone */}
        {showUploadZone && (
          <Card className="border-dashed border-2 border-purple-300">
            <CardContent className="p-8">
              <div
                className={`text-center transition-all duration-200 ${
                  dragOver ? 'bg-purple-50' : ''
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
              >
                {uploading ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-purple-600 font-medium">Uploading files...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 text-purple-400 mx-auto" />
                    <div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        Drop files here or click to upload
                      </p>
                      <p className="text-gray-500 mb-4">
                        Supports JPG, PNG, WebP, GIF up to 10MB each
                      </p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button asChild>
                          <span>Choose Files</span>
                        </Button>
                      </label>
                      <Button variant="outline" onClick={() => setShowUploadZone(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading media files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No files found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedFolder !== 'all' 
                ? 'No files match your current filters.'
                : 'Upload some files to get started.'
              }
            </p>
            {!showUploadZone && (
              <Button onClick={() => setShowUploadZone(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
              : 'space-y-2'
          }>
            {filteredFiles.map((file) => (
              <Card 
                key={file.id}
                className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${
                  selectedFiles.has(file.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                {viewMode === 'grid' ? (
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-muted">
                      {file.type.startsWith('image/') ? (
                        <Image
                          src={file.url}
                          alt={file.originalName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedFiles.has(file.id) 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {selectedFiles.has(file.id) && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(file.url)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {file.folder}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(file.size)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Selection Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedFiles.has(file.id) 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedFiles.has(file.id) && <Check className="h-3 w-3" />}
                      </div>
                      
                      {/* File Preview */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <Image
                            src={file.url}
                            alt={file.originalName}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.originalName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {file.folder}
                          </Badge>
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(file.url)
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredFiles.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredFiles.length} of {files.length} files
                </span>
                <span>
                  Total size: {formatBytes(filteredFiles.reduce((acc, file) => acc + file.size, 0))}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}