import type { ReactNode } from "react";
import type { PathParamsUnknown, Route, SearchParamsUnknown } from "src/corelib/router/core";
import { panic, type InferRecordValues } from "src/corelib/common";
import { appHref, routes } from "./routes";
import { PageMain } from "src/pages/PageMain/PageMain";
import PageReactViteStarter from "src/pages/PageReactViteStarter/PageReactViteStarter";
import { Redirect, RouteLink } from "src/corelib/router/react-components";

type RouteConfig = {
  route: Route<PathParamsUnknown, SearchParamsUnknown>,
  render: () => ReactNode,
}

const routesThatNeedsConfig: Set<InferRecordValues<typeof routes>> = (() => {
  if (!import.meta.env.DEV) return new Set();
  return new Set(Object.values(routes));
})()
const addConf = (
  route: InferRecordValues<typeof routes>,
  render: () => ReactNode,
): RouteConfig => {
  if (import.meta.env.DEV) {
    if (!routesThatNeedsConfig.has(route)) {
      return panic(`Route with pattern "${route.pattern}" was already configured`);
    }
    routesThatNeedsConfig.delete(route);
  }
  return ({ route, render })
}
const check = () => {
  if (import.meta.env.DEV) {
    const firstNonConfiguredRoute = routesThatNeedsConfig.values().next().value ?? null;
    if (firstNonConfiguredRoute) {
      return panic(`Route with pattern "${firstNonConfiguredRoute.pattern}" should be configured`);
    }
  }
}

export const routerConfig: RouteConfig[] = [
  addConf(routes.root, () => <Redirect to={appHref(routes.todos, {}, {})} />),

  addConf(routes.demoRoot, () => <div>not implemented</div>),
  addConf(routes.demoViteReactStarter, () => <PageReactViteStarter />),

  addConf(routes.todos, () => <PageMain subpage='todos' />),
  addConf(routes.reminders, () => <PageMain subpage='reminders' />),
  addConf(routes.calendar, () => <PageMain subpage='calendar' />),
  addConf(routes.extras, () => <PageMain subpage='extras' />),
]
check();
