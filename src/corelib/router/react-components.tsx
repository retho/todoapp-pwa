import { useCallback, useLayoutEffect, useMemo, useRef, type MouseEvent, type ReactNode } from "react";
import { assertNever, useForceRender, useRefedFn } from "../common";
import { type History } from "history";
import { decodeSearchParam, encodeSearchParam, getQueryEncoded, updateQueryKey, type RouteHref } from "./core";
import { ctxRouter, getCurrentUrl, useRouterContext, type RouterContext } from "./react-components.utils";
import { useHistory } from "./react-hooks";

type RouterHistory = {
  push: (to: RouteHref, state?: unknown) => void,
  replace: (to: RouteHref, state?: unknown) => void,
} & Pick<History, 'location'>

const useQueryParamsUpdater = (val: unknown, onStateChange: () => void) => {
  const stateRef = useRef<null | unknown>(val);
  stateRef.current = val;

  const onStateChangeRefed = useRefedFn(onStateChange);
  const setState = useCallback(<T extends unknown>(fn: (s: null | T) => null | T) => {
    stateRef.current = fn(stateRef.current as null | T);
    onStateChangeRefed();
  }, [stateRef, onStateChangeRefed]);

  return {
    stateRef,
    setState,
  }
}

const useQueryParams = (history: History) => {
  const forceRender = useForceRender();
  useLayoutEffect(() => {
    const unlisten = history.listen(forceRender);
    return unlisten;
  }, [history, forceRender]);

  const searchStr = history.location.search;
  const { encodedQuery } = useMemo(() => getQueryEncoded(searchStr), [searchStr]);

  const decodedContext = useMemo(() =>
    encodedQuery.context && decodeSearchParam(encodedQuery.context)
    , [encodedQuery.context])
  const decodedParams = useMemo(() =>
    encodedQuery.params && decodeSearchParam(encodedQuery.params)
    , [encodedQuery.params])

  const needUpdateRouteContextRef = useRef(false);
  const needUpdateSearchParamsRef = useRef(false);

  const promiseUrlUpdateRef = useRef<null | Promise<void>>(null);
  const requestUrlUpdate = () => {
    if (promiseUrlUpdateRef.current) return;

    promiseUrlUpdateRef.current = Promise.resolve().then(() => {
      let url = getCurrentUrl(history.location);
      if (needUpdateRouteContextRef.current) {
        needUpdateRouteContextRef.current = false;
        url = updateQueryKey(url, 'context', encodeSearchParam(decodedContextRef.current));
      }
      if (needUpdateSearchParamsRef.current) {
        needUpdateSearchParamsRef.current = false;
        url = updateQueryKey(url, 'params', encodeSearchParam(decodedParamsRef.current));
      }

      history.replace(url.toString());

      promiseUrlUpdateRef.current = null;
    })
  }

  const { stateRef: decodedContextRef, setState: setQueryParamContext } =
    useQueryParamsUpdater(decodedContext, () => {
      needUpdateRouteContextRef.current = true;
      requestUrlUpdate();
    });
  const { stateRef: decodedParamsRef, setState: setQueryParamParams } =
    useQueryParamsUpdater(decodedParams, () => {
      needUpdateSearchParamsRef.current = true;
      requestUrlUpdate();
    });

  const decodedQuery: RouterContext['decodedQuery'] = { context: decodedContext, params: decodedParams }
  const setQueryParam: RouterContext['setQueryParam'] = (key, fn) => {
    if (key === 'context') return setQueryParamContext(fn);
    if (key === 'params') return setQueryParamParams(fn);
    return assertNever(key);
  }

  return { decodedQuery, setQueryParam }
}

type Props = {
  history: History,
  children: ReactNode,
}
export const RouterProvider = ({ history, children }: Props) => {
  const forceRender = useForceRender();
  useLayoutEffect(() => {
    const unlisten = history.listen(forceRender)
    return unlisten
  }, [history, forceRender])

  const routerHistory = useMemo((): RouterHistory => {
    const updateRouteUrl = (to: RouteHref) => {
      const currentUrl = getCurrentUrl(history.location);
      const url = new URL(to);
      const { encodedQuery } = getQueryEncoded(currentUrl.search);
      return updateQueryKey(url, 'context', encodedQuery.context).toString();
    }

    return {
      get location() {
        return history.location;
      },
      push: (to, state) => history.push(updateRouteUrl(to), state),
      replace: (to, state) => {
        history.replace(updateRouteUrl(to), state)
      },
    }
  }, [history]);

  const { decodedQuery, setQueryParam } = useQueryParams(history);

  const ctx: RouterContext = useMemo(() => ({
    history: routerHistory,
    historyOrigin: history,
    decodedQuery, setQueryParam,
  }), [routerHistory, history, decodedQuery, setQueryParam]);

  return (
    <ctxRouter.Provider value={ctx}>
      {children}
    </ctxRouter.Provider>
  )
}

type LinkProps = { href: null | RouteHref } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>;
export const RouteLink =
  ({ href: hrefProp, onClick, target, ...restProps }: LinkProps) => {
    const { historyOrigin } = useRouterContext()

    const href = useMemo(() => {
      if (!hrefProp) return null;

      const { encodedQuery } = getQueryEncoded(historyOrigin.location.search);
      const contextStr = encodedQuery.context;

      return updateQueryKey(new URL(hrefProp), 'context', contextStr).toString() as RouteHref;
    }, [hrefProp, historyOrigin.location.search])

    const handleClick = useRefedFn((e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (href) {
        historyOrigin.push(href);
      }
      if (onClick) onClick(e);
    })

    return (
      <a
        href={href ?? undefined}
        target={target}
        rel='noopener noreferrer'
        onClick={target !== '_blank' ? handleClick : undefined}
        {...restProps}
      />
    );
  }


type RedirectProps = { to: RouteHref }
export const Redirect = ({ to }: RedirectProps) => {
  const history = useHistory()

  useLayoutEffect(() => {
    Promise.resolve().then(() => history.replace(to))
  }, [history, to]);

  return null;
}


