'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Inbox } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { HTTP_BACKEND } from '@/config'
import { SetStateAction, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { useAuth } from '@clerk/nextjs'

const HeaderDialog = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { getToken } = useAuth()

  const onDropHandler = async (
    acceptedFiles: File[],
    setIsUploading: React.Dispatch<SetStateAction<boolean>>
  ) => {
    if (!acceptedFiles.length) return
    try {
      setIsUploading(true)
      const file = acceptedFiles[0]
      const token = await getToken()

      const response = await axios.post(
        `${HTTP_BACKEND}/user/documents/pre-signed-url`,
        {
          filename: file.name,
          filetype: file.type,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!response.data.uploadUrl) {
        throw new Error('Failed to get presigned URL')
      }

      const { uploadUrl } = response.data

      try {
        const response = await axios.post(
          `${HTTP_BACKEND}/user/documents/upload`,
          {
            fileName: file.name,
            fileType: file.type.toUpperCase(),
            fileUrl: uploadUrl,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.status == 200) {
          const uploadedToS3 = await axios.put(`${uploadUrl}`, file, {
            headers: {
              'Content-Type': file.type,
            },
          })
          if (uploadedToS3.status == 200) {
            toast.success('File Uploaded Successfully', {
              autoClose: 3000,
            })
            setIsDialogOpen(false)
          }
        } else {
          toast.error('File Not Uploaded! Please try again.', {
            autoClose: 3000,
          })
        }
      } catch (error) {
        console.log('error', error)
      } finally {
        setIsUploading(false)
      }
    } catch (error) {
      toast.error('File Not Uploaded! Please try again.', {
        autoClose: 3000,
      })
      console.log('Upload Error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => onDropHandler(acceptedFiles, setIsUploading),
  })
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          onClick={() => setIsDialogOpen(true)}
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload your PDFs, images, or paste links to add to your knowledge
            base.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div
            {...getRootProps({
              className:
                'border-2  border-dashed rounded-xl p-8 text-center cursor-pointer justify-center flex flex-col items-center',
            })}
          >
            <input {...getInputProps()} />
            <Inbox className="w-8 h-8" />
            <p className="text-muted-foreground mt-2">
              Drag and drop files here, or click to browse
            </p>
          </div>
          <Input type="text" placeholder="Or paste a link here..." />
          <Button disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
      <ToastContainer />
    </Dialog>
  )
}

export default HeaderDialog
