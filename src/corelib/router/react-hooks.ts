import { useMemo, useRef } from "react";
import { BASE_URL, calcPathname, matchRoute, type InferRoutePathParams, type InferRouteSearchParams, type PathParamsUnknown, type Route, type SearchParamsUnknown, type UsedQueryKey } from "./core";
import { getCurrentUrl, useRouterContext } from "./react-components.utils"
import { panic, useRefedFn } from "../common";

export const useHistory = () => useRouterContext().history;

export const useRoutes = <R>(routesList: R[], { getRoute }: {
  getRoute: (item: R) => Route<PathParamsUnknown, SearchParamsUnknown>,
}): null | R => {
  const history = useHistory();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentUrl = useMemo(() => getCurrentUrl(history.location), [history.location.pathname]);

  const getRouteRefed = useRefedFn(getRoute)
  const matchedRoute = useMemo(() => {
    for (const r of routesList) {
      const matched = matchRoute(getRouteRefed(r), currentUrl);
      if (matched) return r;
    }
    return null;
  }, [routesList, currentUrl, getRouteRefed])

  return matchedRoute;
}

type SetState<T> = (val_or_fn: T | ((s: T) => T)) => void;
type UseStateResult<T> = [T, SetState<T>];

const useQueryParam = <
  QueryPayload extends SearchParamsUnknown,
  K extends keyof QueryPayload,
>(
  queryKey: UsedQueryKey,
  payloadKey: K,
  defaultState: QueryPayload[K] | (() => QueryPayload[K])
): UseStateResult<QueryPayload[K]> => {
  const { decodedQuery, setQueryParam } = useRouterContext();

  type State = QueryPayload[K];

  const defaultSt = useMemo((): State => {
    // @ts-expect-error ...
    if (typeof defaultState === 'function') return defaultState();
    return defaultState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setState: SetState<State> = useRefedFn((val_or_fn) => {
    setQueryParam<QueryPayload>(queryKey, s => {
      const currQuery = s ?? {} as QueryPayload;
      const currVal = currQuery[payloadKey] ?? defaultSt;
      // @ts-expect-error ...
      currQuery[payloadKey] = typeof val_or_fn === 'function' ? val_or_fn(currVal) : val_or_fn;
      return currQuery;
    })
  })
  const state: State = (decodedQuery[queryKey] as QueryPayload)?.[payloadKey] ?? defaultSt;

  return [state, setState];
}

export const useRouteSearchParams = <
  R extends Route<PathParamsUnknown, SearchParamsUnknown>,
  K extends keyof InferRouteSearchParams<R>,
>(
  route: R,
  key: K,
  defaultState: InferRouteSearchParams<R>[K] | (() => InferRouteSearchParams<R>[K])
): UseStateResult<InferRouteSearchParams<R>[K]> => {

  const { history } = useRouterContext();

  const matched = useMemo(() =>
    matchRoute(route, getCurrentUrl(history.location))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [history.location.pathname])
  if (!matched) panic(`route "${route.pattern}" not matched`);

  const res = useQueryParam<InferRouteSearchParams<R>, K>('params', key, defaultState);

  return res;
}

export const useRouteContext = <
  RouteContext extends SearchParamsUnknown,
  K extends keyof RouteContext,
>(
  key: K,
  defaultState: RouteContext[K] | (() => RouteContext[K])
): UseStateResult<RouteContext[K]> => {
  return useQueryParam<RouteContext, K>('context', key, defaultState);
}

export const useRoutePathParams = <
  R extends Route<PathParamsUnknown, SearchParamsUnknown>,
  K extends keyof InferRoutePathParams<R>,
>(
  route: R,
  key: K,
  defaultState: InferRoutePathParams<R>[K] | (() => InferRoutePathParams<R>[K])
): UseStateResult<InferRoutePathParams<R>[K]> => {
  type PathParams = InferRoutePathParams<R>;

  const { historyOrigin } = useRouterContext();

  const matched = useMemo(() =>
    matchRoute(route, getCurrentUrl(historyOrigin.location))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [historyOrigin.location.pathname])
  if (!matched) panic(`route "${route.pattern}" not matched`);

  const pathParams = matched!.pathParams as PathParams;

  type State = PathParams[K];

  const defaultSt = useMemo((): State => {
    if (typeof defaultState === 'function') return defaultState();
    return defaultState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const state: State = pathParams[key] ?? defaultSt;


  const updatedStateRef = useRef(state);
  updatedStateRef.current = state;


  const isUpdatePlannedRef = useRef(false);
  const planUpdate = () => {
    if (isUpdatePlannedRef.current) return;
    isUpdatePlannedRef.current = true;

    Promise.resolve().then(() => {
      isUpdatePlannedRef.current = false;

      const pathname = calcPathname(route.pattern, { ...pathParams, [key]: updatedStateRef.current });
      const url = new URL(pathname, BASE_URL);
      url.search = historyOrigin.location.search;
      historyOrigin.replace(url.toString());
    })
  }


  const setState: SetState<State> = useRefedFn((val_or_fn) => {
    planUpdate();
    const currVal = updatedStateRef.current;
    const nextVal = typeof val_or_fn === 'function' ? val_or_fn(currVal) : val_or_fn;
    updatedStateRef.current = nextVal;
  })

  return [state, setState];
}
