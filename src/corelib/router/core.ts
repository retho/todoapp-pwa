import { isEmpty } from "lodash-es";
import type { Brand } from "../common";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '')
export const baseURL = location.origin + BASE_URL;

export type PathParamsUnknown = Record<string, string>;
export type SearchParamsUnknown = Record<string, undefined | null | unknown>;

export type EmptyParams = Record<string, never>;

export type Route<PathParams extends PathParamsUnknown, SearchParams extends SearchParamsUnknown> = {
  pattern: string;
  __params__: PathParams;
  __query__: SearchParams;
};
export type InferRoutePathParams<R extends Route<PathParamsUnknown, SearchParamsUnknown>> =
  R extends Route<infer PathParams, SearchParamsUnknown> ? PathParams : never;
export type InferRouteSearchParams<R extends Route<PathParamsUnknown, SearchParamsUnknown>> =
  R extends Route<PathParamsUnknown, infer SearchParams> ? SearchParams : never;

export const declareRoute = <
  PathParams extends PathParamsUnknown,
  SearchParams extends SearchParamsUnknown
>(
  pattern: string
): Route<PathParams, SearchParams> => {
  return {
    pattern: BASE_URL + pattern,
    __params__: null as unknown as PathParams,
    __query__: null as unknown as SearchParams,
  };
};

export type RouteHref = Brand<"RouteUrl", string>;

export const encodeSearchParam = <T>(val: T): string => btoa(JSON.stringify(val));
export const decodeSearchParam = <T>(str: string): T => JSON.parse(atob(str));

export const calcPathname = (pattern: string, pathParams: PathParamsUnknown) => {
  return Object.entries(pathParams).reduce(
    (acc, [key, value]) => acc.replaceAll(`:${key}`, value),
    pattern
  );
}

export const createRouteHref = <
  R extends Route<PathParamsUnknown, SearchParamsUnknown>
>(
  route: R,
  pathParams: InferRoutePathParams<R>,
  searchParams: Partial<InferRouteSearchParams<R>>
): RouteHref => {
  const pathname = calcPathname(route.pattern, pathParams);
  const url = new URL(pathname, baseURL);
  if (!isEmpty(searchParams)) {
    url.searchParams.set('params', encodeSearchParam(searchParams))
  }
  const path = url.toString();

  return path as RouteHref;
}

export type UsedQueryKey = 'params' | 'context';
export const updateQueryKey = (url: URL, key: UsedQueryKey, encodedValue: null | string): URL => {
  const newUrl = new URL(url);
  if (encodedValue) {
    newUrl.searchParams.set(key, encodedValue)
  } else {
    newUrl.searchParams.delete(key);
  }
  return newUrl;
}

export const getQueryEncoded = (searchStr: string) => {
  const urlSearch = new URLSearchParams(searchStr);
  const params = urlSearch.get('params');
  const context = urlSearch.get('context');
  const encodedQuery: Record<UsedQueryKey, null | string> = { context, params }
  return { encodedQuery }
}

export const matchRoute = (route: Route<PathParamsUnknown, SearchParamsUnknown>, url: URL) => {
  const pattern = new URLPattern({ pathname: route.pattern, baseURL });

  const matched = pattern.exec(url)
  if (!matched) return null;

  const pathParams: PathParamsUnknown = matched.pathname.groups as PathParamsUnknown;
  const searchStr = matched.search.input;

  return { pathParams, searchStr };
}
