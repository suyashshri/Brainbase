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
import { SetStateAction, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'

const onDropHandler = async (
  acceptedFiles: File[],
  setIsUploading: React.Dispatch<SetStateAction<boolean>>
) => {
  try {
    setIsUploading(true)

    // await new Promise((resolve) => setTimeout(resolve, 5000))

    const response = await axios.post(
      `${HTTP_BACKEND}/user/documents/pre-signed-url`,
      {
        filename: acceptedFiles[0].name,
        filetype: acceptedFiles[0].type,
      }
    )
    if (response) {
      const uploadedToS3 = await axios.put(
        `${response.data.uploadUrl}`,
        acceptedFiles[0].name
      )

      if (uploadedToS3.status == 200) {
        toast.success('File Uploaded Successfully', {
          autoClose: 3000,
        })
        setIsUploading(false)
      }
    }
  } catch (error) {
    toast.error('File Not Uploaded! Please try again.', {
      autoClose: 3000,
    })
    console.log('error', error)
  }
}

const HeaderDialog = () => {
  const [isUploading, setIsUploading] = useState(false)
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => onDropHandler(acceptedFiles, setIsUploading),
  })
  return (
    <Dialog>
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
