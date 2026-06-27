import { useAppSelector } from "@/hooks";
import { useClientMounted } from "@/hooks/use-client-mounted";
import {
  getStorefrontCatalogHref,
  getStorefrontHomeHref,
  getStorefrontSearchBasePath,
} from "@/lib/storefront-categories";
import {
  selectAuthInitialized,
  selectAuthUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";

/** Auth-aware storefront links that match SSR until the client has mounted and auth is ready. */
export function useStorefrontNavigation() {
  const mounted = useClientMounted();
  const authReady = useAppSelector(selectAuthInitialized);
  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canUseAuth = mounted && authReady;
  const role = canUseAuth ? user?.role : undefined;

  return {
    authReady: canUseAuth,
    user,
    isAuthenticated,
    showAuthenticatedChrome: canUseAuth && isAuthenticated,
    homeHref: getStorefrontHomeHref(role),
    searchBasePath: getStorefrontSearchBasePath(role),
    catalogHref: getStorefrontCatalogHref(role),
  };
}
