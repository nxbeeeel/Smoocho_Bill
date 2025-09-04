'use client'

import React, { useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from './button'

export interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({ value, onChange, disabled, className = '' }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
      onChange(reader.result as string) // Pass base64 string to parent
    }
    reader.readAsDataURL(file)
    
    // Reset file input
    e.target.value = ''
  }, [onChange])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onChange('')
  }, [onChange])

  return (
    <div className={`relative group ${className}`}>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isLoading}
      />
      <label
        htmlFor="image-upload"
        className={`
          flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
          ${disabled ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300 hover:border-primary/50'}
          ${isLoading ? 'opacity-70' : ''}
        `}
      >
        {preview ? (
          <div className="relative w-full h-full rounded-md overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={disabled || isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-sm">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
          </div>
        )}
      </label>
      {isLoading && (
        <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}
