import { DailySummary } from "@/components/daily-summary"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ListTodo } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="fixed right-6 top-6 z-50">
        <Link href="/tasks">
          <Button variant="outline" size="sm">
            <ListTodo className="mr-2 h-4 w-4" />
            タスク管理
          </Button>
        </Link>
      </div>
      <DailySummary />
    </main>
  )
}
