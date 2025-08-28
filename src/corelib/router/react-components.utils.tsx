import { createContext, useContext } from "react";
import { panic } from "../common";
import { type History } from "history";
import { baseURL, type RouteHref, type UsedQueryKey } from "./core";

type RouterHistory = {
  push: (to: RouteHref, state?: unknown) => void,
  replace: (to: RouteHref, state?: unknown) => void,
} & Pick<History, 'location'>

export const getCurrentUrl = (location: RouterHistory['location']) => {
  const url = new URL(location.pathname, baseURL);
  url.search = location.search;
  url.hash = location.hash;
  return url;
}

export type RouterContext = {
  history: RouterHistory,
  historyOrigin: History,
  decodedQuery: Record<UsedQueryKey, null | unknown>,
  setQueryParam: <QueryPayload>(key: UsedQueryKey, fn: (s: null | QueryPayload) => QueryPayload) => void,
}
export const ctxRouter = createContext<null | RouterContext>(null)
export const useRouterContext = () => useContext(ctxRouter) || panic('no <RouterProvider /> was found');
