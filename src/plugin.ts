import type { ComponentType } from "react";
import type { ReactElement } from "react";

import { InventoryOverviewPage } from "./web/pages/InventoryOverviewPage";
import { InventoryItemsPage } from "./web/pages/InventoryItemsPage";
import { InventoryLocationsPage } from "./web/pages/InventoryLocationsPage";
import { InventoryTemplatesPage } from "./web/pages/InventoryTemplatesPage";
import { InventoryAttributeTypesPage } from "./web/pages/InventoryAttributeTypesPage";
import { createInventoryApi, type InventoryApi } from "./web/api/inventory-api";

export type AppContext = {
  api: {
    request<T>(path: string, init?: RequestInit): Promise<T>;
  };
  privileges: string[];
  // TODO: add tenant/user/license context provided by core
};

export type PluginRoute = {
  path: string;
  component: ComponentType<{ api: InventoryApi }>;
};

export type PluginNavEntry = {
  label: string;
  path: string;
  required_privileges?: string[];
};

export type InventoryPlugin = {
  routes: PluginRoute[];
  nav_entries: PluginNavEntry[];
};

export function register(appContext: AppContext): InventoryPlugin {
  const api = createInventoryApi(appContext);

  const routes: PluginRoute[] = [
    { path: "", component: InventoryOverviewPage },
    { path: "items", component: InventoryItemsPage },
    { path: "locations", component: InventoryLocationsPage },
    { path: "templates", component: InventoryTemplatesPage },
    { path: "attributes", component: InventoryAttributeTypesPage },
  ];

  const withApi = (Component: ComponentType<{ api: InventoryApi }>): ComponentType<Record<string, never>> => {
    return () => <Component api={api} /> as ReactElement;
  };

  return {
    routes: routes.map((route) => ({
      path: route.path,
      component: withApi(route.component),
    })),
    nav_entries: [
      { label: "Přehled", path: "/app/inventory" },
      { label: "Položky", path: "/app/inventory/items" },
      { label: "Lokace", path: "/app/inventory/locations" },
      { label: "Šablony", path: "/app/inventory/templates" },
      { label: "Typy atributů", path: "/app/inventory/attributes" },
    ],
  };
}
