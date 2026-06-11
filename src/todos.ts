// Todo domain helpers.
//
// NOTE (fixture): this module imports `lodash` so the vulnerable dependency is
// actually reachable from the browser bundle — `npm run build` ships it. lodash
// is the engineered *clean-bump* alert (locked 4.17.21, patch 4.18.0 is in the
// `^4.17.21` range). The implementation itself is throwaway.
import orderBy from 'lodash/orderBy'
import groupBy from 'lodash/groupBy'

export type Todo = {
  id: string
  title: string
  done: boolean
  createdAt: number
}

let seq = 0
const nextId = () => `t${Date.now().toString(36)}-${seq++}`

export function makeTodo(title: string): Todo {
  return { id: nextId(), title: title.trim(), done: false, createdAt: Date.now() }
}

// done items sink to the bottom, newest-first within each group.
export function sortTodos(todos: Todo[]): Todo[] {
  return orderBy(todos, ['done', 'createdAt'], ['asc', 'desc'])
}

export function counts(todos: Todo[]): { open: number; done: number } {
  const g = groupBy(todos, (t) => (t.done ? 'done' : 'open'))
  return { open: g.open?.length ?? 0, done: g.done?.length ?? 0 }
}
