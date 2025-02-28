'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  FileText,
  Image,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HeaderDialog from '@/components/Header-dialog'
import axios from 'axios'
import { HTTP_BACKEND } from '@/config'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'

type docType = {
  fileName: string
  fileType: string
  fileUrl: string
  id: string
  userId: string
  uploadedAt: Date
  processed: boolean
}

export default function Dashboard() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [docs, setDocs] = useState<docType[]>([])
  const { getToken } = useAuth()

  useEffect(() => {
    ;(async () => {
      try {
        const token = await getToken()
        const allDocs = await axios.get(`${HTTP_BACKEND}/user/documents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setDocs(allDocs.data.documents)
        console.log(docs)
      } catch (error) {
        console.log('Error fetching documents:', error)
      }
    })()
  }, [getToken])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold font-outfit">Dashboard</h1>
          <div className="">
            <HeaderDialog />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Search</CardTitle>
                <CardDescription>
                  Ask questions about your documents in natural language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    placeholder="What would you like to know about your documents?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12"
                  />
                  <Button
                    size="icon"
                    type="submit"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {/* Example results */}
                    <p className="text-muted-foreground text-center py-8">
                      Enter a query above to search your documents
                    </p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Documents Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  Browse and manage your stored documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {docs.map((doc, key) => {
                          // console.log(doc.id)

                          return (
                            <DocumentItem
                              key={key}
                              id={doc.id}
                              icon={<FileText className="h-4 w-4" />}
                              title={doc.fileName}
                              type="PDF"
                            />
                          )
                        })}
                        {/* Example Documents */}
                        {/* <DocumentItem
                          icon={<FileText className="h-4 w-4" />}
                          title="Q4 Marketing Report.pdf"
                          type="PDF"
                        />
                        <DocumentItem
                          icon={<Image className="h-4 w-4" />}
                          title="Product Mockup.png"
                          type="Image"
                        />
                        <DocumentItem
                          icon={<LinkIcon className="h-4 w-4" />}
                          title="Research Article"
                          type="Link"
                        /> */}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="recent">
                    <p className="text-muted-foreground text-center py-8">
                      No recent documents
                    </p>
                  </TabsContent>
                  <TabsContent value="favorites">
                    <p className="text-muted-foreground text-center py-8">
                      No favorite documents
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function DocumentItem({
  id,
  icon,
  title,
  type,
}: {
  id: string
  icon: React.ReactNode
  title: string
  type: string
}) {
  return (
    <Link
      key={id}
      href={{ pathname: `/dashboard/${title}`, query: { id: id } }}
    >
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
        <div className="rounded-full w-8 h-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  )
}
