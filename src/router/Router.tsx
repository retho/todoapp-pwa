import { useRoutes } from 'src/corelib/router/react-hooks.ts'
import { routerConfig } from './Router.config';

export const Router = () => {
  const currentRouteConfig = useRoutes(routerConfig, {getRoute: x => x.route});

  if (!currentRouteConfig) return <div>404 not found</div>;
  return currentRouteConfig.render();
}
