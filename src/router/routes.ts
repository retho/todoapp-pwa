import { panic, type Brand } from "src/corelib/common";
import { createRouteHref, declareRoute, type EmptyParams, type InferRoutePathParams, type InferRouteSearchParams, type PathParamsUnknown, type Route, type RouteHref, type SearchParamsUnknown } from "src/corelib/router/core";

import { useRouteContext } from "src/corelib/router/react-hooks"

export type AppRoute<PathParams extends PathParamsUnknown, SearchParams extends SearchParamsUnknown>
  = Brand<'AppRoute', Route<PathParams, SearchParams>>;

const alreadyRegisteredRoutes: Set<string> = new Set();
const addRoute = <PathParams extends PathParamsUnknown, SearchParams extends SearchParamsUnknown>(
  pattern: string
): AppRoute<PathParams, SearchParams> => {
  if (import.meta.env.DEV) {
    if (alreadyRegisteredRoutes.has(pattern)) {
      return panic(`Route with pattern "${pattern}" was already registered`);
    }
    alreadyRegisteredRoutes.add(pattern);
  }
  return declareRoute<PathParams, SearchParams>(pattern) as AppRoute<PathParams, SearchParams>;
}

type AppHref = Brand<'AppHref', RouteHref>;

type AppRouteContext = {
  __contextFieldExample: unknown,
}
export const useAppRouteContext = <K extends keyof AppRouteContext>(key: K, defaultState: AppRouteContext[K] | (() => AppRouteContext[K])) =>
  useRouteContext<AppRouteContext, K>(key, defaultState)

export const appHref = <R extends AppRoute<PathParamsUnknown, SearchParamsUnknown>>(
  route: R,
  pathParams: InferRoutePathParams<R>,
  searchParams: Partial<InferRouteSearchParams<R>>,
): AppHref => createRouteHref(route, pathParams, searchParams) as AppHref

export const routes = {
  root: addRoute<EmptyParams, EmptyParams>('/'),

  demoRoot: addRoute<EmptyParams, EmptyParams>('/demo'),
  demoViteReactStarter: addRoute<EmptyParams, EmptyParams>('/demo/vite-react-starter'),

  todos: addRoute<EmptyParams, EmptyParams>('/todos'),
  reminders: addRoute<EmptyParams, EmptyParams>('/reminders'),
  calendar: addRoute<EmptyParams, EmptyParams>('/calendar'),
  extras: addRoute<EmptyParams, EmptyParams>('/extras'),
}
