import { bem } from 'src/corelib/bem'
import styles from './PageMainTodos.module.scss'
import { assertNever, useRefedFn, type InferArguments, type InferArrayElement } from 'src/corelib/common';
import { useLayoutEffect, useMemo, useState, type ComponentProps, type FormEvent } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, Tabs } from 'antd';
import Search from 'antd/es/input/Search';
import { useStorageTodos, type StorageTodoItem } from './PageMainTodos.storage';

const cssTodoItem = bem(styles, 'TodoItem')
type TodoItemProps = {
  todo: StorageTodoItem,
  onUpdate: (next: StorageTodoItem) => void,
  onRemove: (todo: StorageTodoItem) => void,
  activeButtons: {
    btnEdit: boolean,
    btnDelete: boolean,
  }
}
const TodoItem = ({ todo, onUpdate, onRemove, activeButtons }: TodoItemProps) => {
  const [description, setDescription] = useState('');
  useLayoutEffect(() => {
    setDescription(todo.description)
  }, [todo])

  const [isEditMode, setIsEditMode] = useState(false);

  const handleSubmitDescription = () => {
    setIsEditMode(false);
    onUpdate({ ...todo, description })
  }
  const handleFormSubmitDescription = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitDescription()
  }

  return (
    <Card size='small'>
      <div className={cssTodoItem()}>
        <div><Checkbox checked={todo.done} onClick={() => onUpdate({ ...todo, done: !todo.done })} /></div>
        <div>
          {isEditMode && (
            <form onSubmit={handleFormSubmitDescription}>
              <Input
                ref={node => node?.focus()}
                onBlur={handleSubmitDescription}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What needs to be done?"
              />
            </form>
          )}
          {!isEditMode && description}
        </div>
        <div className={cssTodoItem('controls')}>
          {activeButtons.btnEdit && (
            <Button color='default' variant='outlined' onClick={() => setIsEditMode(true)}>
              <EditOutlined />
            </Button>
          )}
          {activeButtons.btnDelete && (
            <Button color="danger" variant="solid" disabled={!todo.done || isEditMode} onClick={() => onRemove(todo)}>
              <DeleteOutlined />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

const enumPageMainTodosTab = ['active', 'completed', 'all'] as const;
type PageMainTodosTab = InferArrayElement<typeof enumPageMainTodosTab>;

const cssPageMainTodosTabSelector = bem(styles, 'PageMainTodosTabSelector')
type PageMainTodosTabSelectorProps = {
  value: PageMainTodosTab,
  onChange: (val: PageMainTodosTab) => void,
  stats: Record<PageMainTodosTab, number>,
}
const PageMainTodosTabSelector = ({ stats, value, onChange }: PageMainTodosTabSelectorProps) => {
  const items = useMemo((): ComponentProps<typeof Tabs>['items'] => {
    return enumPageMainTodosTab.map(key => {
      const label = (() => {
        if (key === 'active') {
          return `Активные (${stats.active})`;
        }
        if (key === 'completed') {
          return `Завершенные (${stats.completed})`;
        }
        if (key === 'all') {
          return `Все (${stats.all})`;
        }
        return assertNever(key);
      })()

      return { key, label }
    })
  }, [stats.active, stats.completed, stats.all])

  return (
    <Tabs
      className={cssPageMainTodosTabSelector()}
      activeKey={value}
      onChange={v => onChange(v as PageMainTodosTab)}
      size='small'
      centered
      items={items}
    />
  )
}

type AddNewTodoInputProps = {
  onAdd: (description: string) => void,
}
const AddNewTodoInput = ({ onAdd }: AddNewTodoInputProps) => {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    setDescription('');
    onAdd(description);
  }

  return (
    <Form onFinish={handleSubmit}>
      <Search
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="What needs to be done?"
        enterButton="Add"
        onSearch={handleSubmit}
        size="large"
      />
    </Form>
  )
}

const useTodosList = () => {
  const api = useStorageTodos();

  const [todoList, setTodoList] = useState<StorageTodoItem[]>([]);
  const refetch = useRefedFn(() => setTodoList(api.getList()));

  useLayoutEffect(() => {
    refetch();
  }, [refetch]);

  const createTodo = useRefedFn((payload: InferArguments<typeof api.addTodo>['0']) => {
    api.addTodo(payload)
    refetch()
  })

  const updateTodo = useRefedFn((todo: StorageTodoItem) => {
    api.updateTodo(todo.id, () => todo)
    refetch()
    return
  })

  const removeTodo = useRefedFn((todo: StorageTodoItem) => {
    api.removeTodo(todo.id)
    refetch()
    return
  })

  return { todoList, createTodo, updateTodo, removeTodo };
}

const cssPageMainTodos = bem(styles, 'PageMainTodos')
export const PageMainTodos = () => {
  const [tab, setTab] = useState<PageMainTodosTab>('active');

  const { todoList, createTodo, updateTodo, removeTodo } = useTodosList()

  const listByTab: Record<PageMainTodosTab, StorageTodoItem[]> = useMemo(() => {
    const getList = (tab: PageMainTodosTab) => {
      if (tab === 'all') return todoList;
      if (tab === 'active') return todoList.filter(x => !x.done);
      if (tab === 'completed') return todoList.filter(x => x.done);
      return assertNever(tab);
    }
    return {
      active: getList('active'),
      all: getList('all'),
      completed: getList('completed'),
    }
  }, [todoList])

  const stats: ComponentProps<typeof PageMainTodosTabSelector>['stats'] = {
    active: listByTab.active.length,
    all: listByTab.all.length,
    completed: listByTab.completed.length,
  }

  const handleAdd = (description: string) => {
    if (tab === 'completed') setTab('active');
    createTodo({ description })
  }

  return (
    <div className={cssPageMainTodos()}>
      <div>
        <AddNewTodoInput onAdd={handleAdd} />
      </div>
      <div>
        <PageMainTodosTabSelector value={tab} onChange={setTab} stats={stats} />
      </div>
      <div className={cssPageMainTodos('list')}>
        {listByTab[tab].map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={updateTodo}
            onRemove={removeTodo}
            activeButtons={{
              btnEdit: tab === 'active' || tab === 'all',
              btnDelete: tab === 'completed' || tab === 'all',
            }}
          />
        ))}
      </div>
    </div>
  )
}
