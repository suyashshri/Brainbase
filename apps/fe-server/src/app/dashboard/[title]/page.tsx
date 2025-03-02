'use client'
import ChatPdf from '@/components/ChatPdf'
import PDFViewer from '@/components/PdfViewer'
import { HTTP_BACKEND } from '@/config'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const page = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const { getToken } = useAuth()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  console.log(id)

  useEffect(() => {
    ;(async () => {
      if (!id) return
      const token = await getToken()
      try {
        const response = await axios.get(
          `${HTTP_BACKEND}/user/documents/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )
        console.log(process.env.NEXT_PUBLIC_S3_BUCKET_URL)

        setPdfUrl(
          `https://brainbasebucket.s3.ap-south-1.amazonaws.com/${response.data.document.fileKey}`
        )
      } catch (error) {
        console.log('Failed to fetch PDF:', error)
        return
      }
    })()
  }, [id])
  return (
    <div className="flex max-h-screen">
      <div className="flex max-h-screen p-4 oveflow-scroll flex-[7]">
        {pdfUrl && <PDFViewer pdf_url={pdfUrl} />}
      </div>
      <div className="flex-[3] max-h-screen border-l-4 border-l-slate-200">
        <ChatPdf />
      </div>
    </div>
  )
}

export default page
