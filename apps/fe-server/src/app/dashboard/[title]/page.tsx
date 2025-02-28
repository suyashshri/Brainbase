'use client'
import PDFViewer from '@/components/PdfViewer'
import { HTTP_BACKEND } from '@/config'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const page = ({
  params,
  searchParams,
}: {
  params: { title: string }
  searchParams: { id: string }
}) => {
  const { title } = params
  const { id } = searchParams
  const { getToken } = useAuth()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)

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
        setPdfUrl(response.data.fileUrl)
      } catch (error) {
        console.log('Failed to fetch PDF:', error)
      }
    })()
  }, [id])
  return (
    <div className="flex max-h-screen">
      <div className="flex max-h-screen p-4 oveflow-scroll flex-[7]">
        <PDFViewer pdf_url="https://brainbasebucket.s3.ap-south-1.amazonaws.com/models/1740757789660_2556825647.pdf" />
      </div>
      <div className="flex-[3] border-l-4 border-l-slate-200">Hi there</div>
    </div>
  )
}

export default page
