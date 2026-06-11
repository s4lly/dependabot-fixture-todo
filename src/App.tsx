import { useMemo, useState } from 'react'
import { counts, makeTodo, sortTodos, type Todo } from './todos'

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [draft, setDraft] = useState('')

  const sorted = useMemo(() => sortTodos(todos), [todos])
  const { open, done } = useMemo(() => counts(todos), [todos])

  function add() {
    const title = draft.trim()
    if (!title) return
    setTodos((prev) => [...prev, makeTodo(title)])
    setDraft('')
  }

  function toggle(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function remove(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <main className="app">
      <h1>Todo</h1>
      <p className="muted">{open} open · {done} done</p>

      <div className="row">
        <input
          value={draft}
          placeholder="What needs doing?"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button onClick={add}>Add</button>
      </div>

      <ul>
        {sorted.map((t) => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span>{t.title}</span>
            </label>
            <button className="link" onClick={() => remove(t.id)}>delete</button>
          </li>
        ))}
      </ul>
    </main>
  )
}
