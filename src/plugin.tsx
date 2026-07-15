import type { ComponentType } from "react";
import type { ReactElement } from "react";

import { InventoryOverviewPage } from "./web/pages/InventoryOverviewPage";
import { InventoryItemsPage } from "./web/pages/InventoryItemsPage";
import { InventoryLocationsPage } from "./web/pages/InventoryLocationsPage";
import { InventoryTemplatesPage } from "./web/pages/InventoryTemplatesPage";
import { InventoryAttributeTypesPage } from "./web/pages/InventoryAttributeTypesPage";
import { createInventoryApi, type InventoryApi } from "./web/api/inventory-api";
import inventoryStyles from "./web/styles/tokens.css?inline";
import { InventoryLocalizationProvider, inventoryNavLabels } from "./web/localization";

export type AppContext = {
  api: {
    request<T>(path: string, init?: RequestInit): Promise<T>;
  };
  privileges: string[];
  localization?: {
    requested_locale: string;
    locale: string;
    fallback_locale: "en";
  };
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

function ensureInventoryStyles() {
  if (typeof document === "undefined" || document.getElementById("hc-app-inventory-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "hc-app-inventory-styles";
  style.textContent = inventoryStyles;
  document.head.appendChild(style);
}

export function register(appContext: AppContext): InventoryPlugin {
  ensureInventoryStyles();
  const api = createInventoryApi(appContext);
  const locale = appContext.localization?.locale ?? "en";
  const labels = inventoryNavLabels(locale);

  const routes: PluginRoute[] = [
    { path: "", component: InventoryOverviewPage },
    { path: "items", component: InventoryItemsPage },
    { path: "locations", component: InventoryLocationsPage },
    { path: "templates", component: InventoryTemplatesPage },
    { path: "attributes", component: InventoryAttributeTypesPage },
  ];

  const withApi = (Component: ComponentType<{ api: InventoryApi }>): ComponentType<Record<string, never>> => {
    return () =>
      (
        <div className="inventory-app">
          <InventoryLocalizationProvider locale={locale}>
            <Component api={api} />
          </InventoryLocalizationProvider>
        </div>
      ) as ReactElement;
  };

  return {
    routes: routes.map((route) => ({
      path: route.path,
      component: withApi(route.component),
    })),
    nav_entries: [
      { label: labels[0], path: "/app/inventory" },
      { label: labels[1], path: "/app/inventory/items" },
      { label: labels[2], path: "/app/inventory/locations" },
      { label: labels[3], path: "/app/inventory/templates" },
      { label: labels[4], path: "/app/inventory/attributes" },
    ],
  };
}
