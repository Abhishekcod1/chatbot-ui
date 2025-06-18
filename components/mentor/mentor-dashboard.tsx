"use client"

import { getDoubts, updateDoubt } from "@/db/doubts"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Doubt {
  id: string
  question: string
  answer: string | null
  solved: boolean
  mentor_id: string | null
  created_at: string
  user_id: string
  workspace_id: string | null
  solved_at: string | null
  updated_at: string | null
}

export default function MentorDashboard() {
  const [doubts, setDoubts] = useState<Doubt[]>([])

  useEffect(() => {
    ;(async () => {
      const data = await getDoubts()
      setDoubts(data)
    })()
  }, [])

  const markSolved = async (doubtId: string) => {
    const updated = await updateDoubt(doubtId, {
      solved: true,
      solved_at: new Date().toISOString()
    })
    setDoubts(prev => prev.map(d => (d.id === doubtId ? updated : d)))
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Mentor Dashboard</h1>
      <ul className="space-y-4">
        {doubts.map(d => (
          <li key={d.id} className="rounded border p-2">
            <div className="font-semibold">{d.question}</div>
            {d.solved ? (
              <div className="text-green-600">Solved</div>
            ) : (
              <Button onClick={() => markSolved(d.id)}>Mark Solved</Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
