import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "@/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
export { usePurchaseAuth } from "@/hooks/use-purchase-auth";
export { useProductSearchSuggestions } from "@/hooks/use-product-search-suggestions";
export { useStorefrontNavigation } from "@/hooks/use-storefront-navigation";
export { useClientMounted } from "@/hooks/use-client-mounted";
export { usePurchaseActivityPolling } from "@/hooks/use-purchase-activity-polling";
