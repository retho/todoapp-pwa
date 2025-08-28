import { bem } from 'src/corelib/bem'
import styles from './PageMain.module.scss'
import { assertNever, type InferArrayElement } from 'src/corelib/common';
import { useMemo, type ComponentProps, type ReactNode } from 'react';
import { BellOutlined, CalendarOutlined, CheckOutlined, MenuOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import type { RouteHref } from 'src/corelib/router/core';
import { appHref, routes } from 'src/router/routes';
import { RouteLink } from 'src/corelib/router/react-components';
import { PageMainTodos } from './PageMainTodos';
import { PageMainExtras } from './PageMainExtras';

const enumSubpage = ['todos', 'reminders', 'calendar', 'extras'] as const;
type Subpage = InferArrayElement<typeof enumSubpage>;

const subpage2label: Record<Subpage, string> = {
  todos: 'Список дел',
  reminders: 'Напоминания',
  calendar: 'Календарь',
  extras: 'Еще',
}
const subpage2href: Record<Subpage, RouteHref> = {
  todos: appHref(routes.todos, {}, {}),
  reminders: appHref(routes.reminders, {}, {}),
  calendar: appHref(routes.calendar, {}, {}),
  extras: appHref(routes.extras, {}, {}),
}
const subpage2icon: Record<Subpage, ReactNode> = {
  todos: <CheckOutlined />,
  reminders: <BellOutlined />,
  calendar: <CalendarOutlined />,
  extras: <MenuOutlined />,
}

const cssSubpageSelector = bem(styles, 'SubpageSelector');
type SubpageSelectorProps = {
  value: Subpage,
}
const SubpageSelector = ({ value }: SubpageSelectorProps) => {
  const items = useMemo((): ComponentProps<typeof Tabs>['items'] => {
    return enumSubpage.map(sub => {
      const label = (
        <div className={cssSubpageSelector('item')}>
          <div className={cssSubpageSelector('icon')}>
            {subpage2icon[sub]}
          </div>
          <div className={cssSubpageSelector('label')}>
            {subpage2label[sub]}
          </div>
          <RouteLink
            className={cssSubpageSelector('itemLink')}
            href={subpage2href[sub]}
          />
        </div>
      )

      return { key: sub, label }
    })
  }, [])

  return (
    <Tabs
      className={cssSubpageSelector()}
      activeKey={value}
      size='middle'
      centered
      items={items}
    />
  )
}

const css = bem(styles, 'PageMain')
type Props = {
  subpage: Subpage,
}
export const PageMain = ({ subpage }: Props) => {
  return (
    <div className={css()}>
      <div className={css('header')}>{subpage2label[subpage]}</div>
      <div className={css('bodyWrapper')}>
        <div className={css('body')}>
          {(() => {
            if (subpage === 'todos') return <PageMainTodos />;
            if (subpage === 'reminders') return <div>not implemented yet</div>;
            if (subpage === 'calendar') return <div>not implemented yet</div>;
            if (subpage === 'extras') return <PageMainExtras />;
            return assertNever(subpage);
          })()}
        </div>
      </div>
      <div className={css('footer')}>
        <SubpageSelector
          value={subpage}
        />
      </div>
    </div>
  )
}
