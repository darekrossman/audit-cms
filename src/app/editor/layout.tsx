import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/editor" className="font-semibold">
              Audit CMS
            </Link>
            <nav className="flex items-center gap-2">
              <Link href="/docs">
                <Button variant="ghost" size="sm">
                  View Docs
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/editor/new">
              <Button size="sm">New Document</Button>
            </Link>
            <form action="/api/auth" method="DELETE">
              <Button type="submit" variant="ghost" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
