import { nanoid } from "nanoid";
import { useMemo } from "react";
import { assertNever } from "src/corelib/common";
import { storageKey, useStorage } from "src/corelib/storage";

type StorageTodoItemV1_0 = {
  version: '1.0',
  id: string,
  created_at: number,
  done: boolean,
  description: string,
}

type StorageTodoItemAnyVersion =
  | StorageTodoItemV1_0;
export type StorageTodoItem = StorageTodoItemV1_0; // * latest version

const migrate = (todo: StorageTodoItemAnyVersion): StorageTodoItem => {
  if (todo.version === '1.0') return todo;
  return assertNever(todo.version);
}

const sk_todos = storageKey<StorageTodoItemAnyVersion[]>('todos');
export const useStorageTodos = () => {
  const ls = useStorage(localStorage, sk_todos)

  return useMemo(() => {
    const getList = () => ls.getItem() ?? [];
    const addTodo = (payload: Pick<StorageTodoItem, 'description'>) => {
      ls.updateItem(list => {
        const todo: StorageTodoItem = {
          version: '1.0',
          id: nanoid(),
          created_at: Date.now(),
          done: false,
          ...payload,
        }
        return (list ?? []).concat([todo])
      })
    }
    const updateTodo = (id: string, fn: (prev: StorageTodoItem) => Pick<StorageTodoItem, 'done' | 'description'>) => {
      ls.updateItem(list => {
        return list?.map(todo => {
          if (todo.id !== id) return todo;

          const prev = migrate(todo);
          const { done, description } = fn(prev);
          const next: StorageTodoItem = {
            ...prev,
            done,
            description,
          }
          return next;
        })
      })
    }
    const removeTodo = (id: string) => {
      ls.updateItem(list => {
        return list?.filter(x => x.id !== id)
      })
    }

    return { getList, addTodo, updateTodo, removeTodo }
  }, [ls])
}
