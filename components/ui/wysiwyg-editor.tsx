"use client"

import { useRef, useState, useEffect } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Type, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code2, 
  Quote,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Save,
  FileText
} from 'lucide-react'

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
  className?: string
  disabled?: boolean
  showWordCount?: boolean
  showCharCount?: boolean
  maxWords?: number
  maxChars?: number
  onSave?: () => void
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  height = 400,
  className = "",
  disabled = false,
  showWordCount = true,
  showCharCount = true,
  maxWords,
  maxChars,
  onSave
}: WysiwygEditorProps) {
  const editorRef = useRef<any>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Calculate word and character counts
  useEffect(() => {
    const text = value.replace(/<[^>]*>/g, '').trim()
    const words = text ? text.split(/\s+/).length : 0
    setWordCount(words)
    setCharCount(text.length)
  }, [value])

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const getWordCountStatus = () => {
    if (!maxWords) return 'default'
    const ratio = wordCount / maxWords
    if (ratio > 0.9) return 'destructive'
    if (ratio > 0.75) return 'secondary'
    return 'default'
  }

  const getCharCountStatus = () => {
    if (!maxChars) return 'default'
    const ratio = charCount / maxChars
    if (ratio > 0.9) return 'destructive'
    if (ratio > 0.75) return 'secondary'
    return 'default'
  }

  return (
    <div className={`wysiwyg-editor border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Rich Text Editor</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Preview Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePreview}
            className="h-8 px-2"
            disabled={disabled}
          >
            {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="ml-1 text-xs">{isPreviewMode ? 'Edit' : 'Preview'}</span>
          </Button>

          {/* Save Button */}
          {onSave && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="h-8 px-3"
                disabled={disabled}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        {isPreviewMode ? (
          /* Preview Mode */
          <div className="p-6 min-h-[300px] bg-background">
            <div 
              className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-blockquote:text-muted-foreground prose-code:text-foreground"
              dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground italic">No content to preview...</p>' }}
            />
          </div>
        ) : (
          /* Editor Mode */
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            onInit={(evt, editor) => {
              editorRef.current = editor
            }}
            value={value}
            onEditorChange={onChange}
            disabled={disabled}
            init={{
              height,
              license_key: 'gpl' as any,
              menubar: false,
              statusbar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
                'codesample', 'quickbars'
              ],
              toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
                'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | blockquote codesample | ' +
                'link image media table | removeformat code fullscreen',
              toolbar_mode: 'sliding',
              quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
              contextmenu: 'link image table',
              content_style: `
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                  font-size: 14px; 
                  line-height: 1.6;
                  color: hsl(var(--foreground));
                  background-color: hsl(var(--background));
                  padding: 16px;
                }
                p { margin: 0 0 1em 0; }
                h1, h2, h3, h4, h5, h6 { 
                  margin: 1.5em 0 0.5em 0; 
                  font-weight: 600; 
                  color: hsl(var(--foreground));
                }
                h1 { font-size: 2em; }
                h2 { font-size: 1.5em; }
                h3 { font-size: 1.25em; }
                blockquote {
                  border-left: 4px solid hsl(var(--primary));
                  padding-left: 16px;
                  margin: 1em 0;
                  color: hsl(var(--muted-foreground));
                  font-style: italic;
                }
                code {
                  background-color: hsl(var(--muted));
                  padding: 2px 4px;
                  border-radius: 4px;
                  font-size: 0.9em;
                }
                pre {
                  background-color: hsl(var(--muted));
                  padding: 16px;
                  border-radius: 8px;
                  overflow-x: auto;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 1em 0;
                }
                table td, table th {
                  border: 1px solid hsl(var(--border));
                  padding: 8px;
                }
                table th {
                  background-color: hsl(var(--muted));
                  font-weight: 600;
                }
              `,
              placeholder,
              branding: false,
              promotion: false,
              skin: 'oxide',
              content_css: 'default',
              image_advtab: true,
              image_uploadtab: false,
              file_picker_types: 'image',
              automatic_uploads: false,
              images_upload_handler: (blobInfo: any, progress: any) => {
                return new Promise((resolve, reject) => {
                  // Handle image upload here
                  // For now, just reject to prevent upload
                  reject('Image upload not configured')
                })
              },
              setup: (editor) => {
                editor.on('init', () => {
                  if (disabled) {
                    editor.mode.set('readonly')
                  }
                })
                
                // Auto-save functionality
                if (onSave) {
                  let timeout: NodeJS.Timeout
                  editor.on('input', () => {
                    clearTimeout(timeout)
                    timeout = setTimeout(() => {
                      // onSave() // Auto-save disabled for now
                    }, 2000)
                  })
                }
              }
            }}
          />
        )}
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between p-3 border-t border-border bg-muted/30 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          {showWordCount && (
            <div className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              <Badge variant={getWordCountStatus() as any} className="text-xs">
                {wordCount} word{wordCount !== 1 ? 's' : ''}
                {maxWords && ` / ${maxWords}`}
              </Badge>
            </div>
          )}
          
          {showCharCount && (
            <div className="flex items-center gap-1">
              <Badge variant={getCharCountStatus() as any} className="text-xs">
                {charCount} char{charCount !== 1 ? 's' : ''}
                {maxChars && ` / ${maxChars}`}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {disabled ? 'Read-only mode' : isPreviewMode ? 'Preview mode' : 'Editing mode'}
        </div>
      </div>
    </div>
  )
}