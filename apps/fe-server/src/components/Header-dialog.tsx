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
import { PlusCircleIcon, Upload, Inbox } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const HeaderDialog = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFile: 1,
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
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer justify-center flex flex-col items-center',
            })}
          >
            <input {...getInputProps()} />
            <Inbox className="w-8 h-8" />
            <p className="text-muted-foreground mt-2">
              Drag and drop files here, or click to browse
            </p>
          </div>
          <Input type="text" placeholder="Or paste a link here..." />
          <Button>Upload</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HeaderDialog
