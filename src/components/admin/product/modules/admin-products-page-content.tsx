"use client";

import { useId, useState } from "react";
import { LayersIcon, PackagePlusIcon, PackageIcon } from "lucide-react";
import { AddProductForm } from "@/components/admin/product/modules/add-product-form";
import { CatalogSetup } from "@/components/admin/product/modules/catalog-setup";
import {
  cardClassName,
  segmentListClassName,
  segmentTabClassName,
} from "@/lib/panel-styles";
import { AdminProductsList } from "@/components/admin/product/list";
import { useAppDispatch } from "@/hooks";
import { clearProductDetail } from "@/store/slices/productSlice";
import { cn } from "@/lib/utils";

type AdminProductsView = "products" | "add" | "catalog";

const VIEW_TABS: {
  id: AdminProductsView;
  label: string;
  description: string;
  icon: typeof PackageIcon;
}[] = [
  {
    id: "products",
    label: "Products",
    description: "Browse, search, and manage items in your catalog.",
    icon: PackageIcon,
  },
  {
    id: "add",
    label: "Add Product",
    description: "Create a listing with images, variants, and pricing.",
    icon: PackagePlusIcon,
  },
  {
    id: "catalog",
    label: "Catalog Setup",
    description: "Manage categories and colors used across products.",
    icon: LayersIcon,
  },
];

export function AdminProductsPageContent() {
  const dispatch = useAppDispatch();
  const [activeView, setActiveView] = useState<AdminProductsView>("products");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const tabListId = useId();
  const activeMeta = VIEW_TABS.find((tab) => tab.id === activeView);
  const isEditing = activeView === "add" && editingProductId !== null;

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setActiveView("add");
  };

  const handleFormCancel = () => {
    setEditingProductId(null);
    dispatch(clearProductDetail());
    setActiveView("products");
  };

  const handleFormSaved = () => {
    setEditingProductId(null);
    dispatch(clearProductDetail());
    setActiveView("products");
  };

  const handleTabChange = (view: AdminProductsView) => {
    if (view === "add") {
      setEditingProductId(null);
      dispatch(clearProductDetail());
    }
    setActiveView(view);
  };

  return (
    <section className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
            Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Products
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {isEditing
              ? "Update listing details, images, variants, and visibility."
              : activeMeta?.description}
          </p>
        </div>

        <div
          id={tabListId}
          role="tablist"
          aria-label="Admin Products Views"
          className={segmentListClassName}
        >
          {VIEW_TABS.map((tab) => {
            const isActive = activeView === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${tabListId}-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`${tabListId}-${tab.id}-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  segmentTabClassName(isActive),
                  "inline-flex items-center gap-2",
                )}
              >
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                {tab.id === "add" && isEditing ? "Edit Product" : tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className={cardClassName}>
        {VIEW_TABS.map((tab) => {
          const isActive = activeView === tab.id;

          return (
            <div
              key={tab.id}
              id={`${tabListId}-${tab.id}-panel`}
              role="tabpanel"
              aria-labelledby={`${tabListId}-${tab.id}`}
              hidden={!isActive}
              className={cn(
                "p-5 sm:p-6 lg:p-8",
                !isActive && "hidden",
              )}
            >
              {tab.id === "products" && (
                <AdminProductsList onEditProduct={handleEditProduct} />
              )}
              {tab.id === "add" && (
                <AddProductForm
                  productId={editingProductId}
                  onCancel={isEditing ? handleFormCancel : undefined}
                  onSaved={isEditing ? handleFormSaved : undefined}
                />
              )}
              {tab.id === "catalog" && <CatalogSetup embedded />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
