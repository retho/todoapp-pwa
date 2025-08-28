import { useHistory, useRoutes } from 'src/corelib/router/react-hooks.ts'
import { routerConfig } from './Router.config';
import { getCurrentUrl } from 'src/corelib/router/react-components.utils';
import { baseURL } from 'src/corelib/router/core';
import { Redirect } from 'src/corelib/router/react-components';
import { appHref, routes } from './routes';

export const Router = () => {
  const history = useHistory();
  const currentRouteConfig = useRoutes(routerConfig, { getRoute: x => x.route });

  if (getCurrentUrl(history.location).toString() === baseURL) {
    return <Redirect to={appHref(routes.root, {}, {})} />
  }
  if (!currentRouteConfig) return <div>404 not found</div>;
  return currentRouteConfig.render();
}
