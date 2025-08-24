import { bem } from 'src/corelib/bem'
import styles from './PageMainTodos.module.scss'
import { assertNever, type InferArrayElement } from 'src/corelib/common';
import { useLayoutEffect, useMemo, useState, type ComponentProps, type FormEvent } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Input, Tabs } from 'antd';
import Search from 'antd/es/input/Search';
import { range } from 'lodash-es';

const cssTodoItem = bem(styles, 'TodoItem')
type TodoItemProps = {
  content: string,
}
const TodoItem = ({ content }: TodoItemProps) => {
  const [todoContent, setTodoContent] = useState('');
  useLayoutEffect(() => {
    setTodoContent(content)
  }, [content])

  const isDone = Math.random() > 0.5

  const [isEditMode, setIsEditMode] = useState(false);

  const handleSubmit = () => {
    setIsEditMode(false);
  }
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit()
  }

  return (
    <Card size='small'>
      <div className={cssTodoItem()}>
        <div><Checkbox checked={isDone} /></div>
        <div>
          {isEditMode && (
            <form onSubmit={handleFormSubmit}>
              <Input
                ref={node => node?.focus()}
                onBlur={handleSubmit}
                value={todoContent}
                onChange={e => setTodoContent(e.target.value)}
                placeholder="What needs to be done?"
              />
            </form>
          )}
          {!isEditMode && todoContent}
        </div>
        <div className={cssTodoItem('controls')}>
          <Button color='default' variant='outlined' onClick={() => setIsEditMode(true)}>
            <EditOutlined />
          </Button>
          <Button color="danger" variant="solid" disabled={!isDone || isEditMode}>
            <DeleteOutlined />
          </Button>
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
}
const PageMainTodosTabSelector = ({ value, onChange }: PageMainTodosTabSelectorProps) => {
  const items = useMemo((): ComponentProps<typeof Tabs>['items'] => {
    return enumPageMainTodosTab.map(key => {
      const label = (() => {
        if (key === 'active') {
          return 'Активные (3)';
        }
        if (key === 'completed') {
          return 'Завершенные (8)';
        }
        if (key === 'all') {
          return 'Все (11)';
        }
        return assertNever(key);
      })()

      return { key, label }
    })
  }, [])

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
  onAdd: (content: string) => void,
}
const AddNewTodoInput = ({ onAdd }: AddNewTodoInputProps) => {
  const [addNewStr, setAddNewStr] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddNewStr('');
    onAdd(addNewStr);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Search
        value={addNewStr}
        onChange={e => setAddNewStr(e.target.value)}
        placeholder="What needs to be done?"
        enterButton="Add"
        size="large"
        loading
      />
    </form>
  )
}

const cssPageMainTodos = bem(styles, 'PageMainTodos')
export const PageMainTodos = () => {
  const [tab, setTab] = useState<PageMainTodosTab>('active');

  return (
    <div className={cssPageMainTodos()}>
      <div>
        <AddNewTodoInput onAdd={(content) => void content} />
      </div>
      <div>
        <PageMainTodosTabSelector value={tab} onChange={setTab} />
      </div>
      <div className={cssPageMainTodos('list')}>
        {range(20).map(n => <TodoItem key={n} content={`Todo #${n}`} />)}
      </div>
    </div>
  )
}
