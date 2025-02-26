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
  // const [isUploaded, setIsUploaded] = useState(false)
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
      console.log(token)

      // await new Promise((resolve) => setTimeout(resolve, 5000))
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
      if (response) {
        const { uploadUrl, fileKey } = response.data
        if (!uploadUrl) throw new Error('Failed to get presigned URL')
        const uploadedToS3 = await axios.put(`${uploadUrl}`, file.name)

        if (uploadedToS3.status == 200) {
          try {
            await axios.post(
              `${HTTP_BACKEND}/user/documents/upload`,
              {
                filename: acceptedFiles[0].name,
                filetype: acceptedFiles[0].type.toLocaleUpperCase(),
                fileUrl: uploadUrl,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            toast.success('File Uploaded Successfully', {
              autoClose: 3000,
            })
          } catch (error) {
            toast.error('File Not Uploaded! Please try again.', {
              autoClose: 3000,
            })
            console.log('error', error)
          } finally {
            setIsUploading(false)
          }
        }
      }
    } catch (error) {
      toast.error('File Not Uploaded! Please try again.', {
        autoClose: 3000,
      })
      console.log('error', error)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => onDropHandler(acceptedFiles, setIsUploading),
  })
  return (
    <Dialog open={isUploading} onOpenChange={setIsUploading}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
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
          <Button>{isUploading ? 'Uploading...' : 'Upload'}</Button>
        </div>
      </DialogContent>
      <ToastContainer />
    </Dialog>
  )
}

export default HeaderDialog
