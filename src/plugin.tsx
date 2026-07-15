import { useEffect, useState, type ComponentType } from "react";
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
  dashboard_widgets: InventoryDashboardWidget[];
};

type InventoryDashboardWidget = {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredPrivileges: string[];
  supportedScopes: readonly ("user" | "tenant" | "platform")[];
  defaultVisible: boolean;
  defaultSize: "small" | "medium" | "wide";
  supportedSizes: readonly ("small" | "medium" | "wide")[];
  presentation: "kpi" | "summary" | "list";
  defaultPosition: number;
  defaultSettings: Record<string, unknown>;
  component: ComponentType<{ settings: Record<string, unknown> }>;
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
  const widgetLabels = locale === "cs"
    ? { title: "Položky inventáře", description: "Celkový počet evidovaných položek.", category: "Inventář", loading: "Načítání…", error: "Data inventáře nelze načíst." }
    : { title: "Inventory items", description: "Total number of registered inventory items.", category: "Inventory", loading: "Loading…", error: "Inventory data could not be loaded." };

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

  const InventorySummaryWidget = () => {
    const [count, setCount] = useState<number | null>(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
      let active = true;
      void api.fetchItems().then((result) => { if (active) setCount(result.items.length); }).catch(() => { if (active) setFailed(true); });
      return () => { active = false; };
    }, []);
    return <div className="inventory-app"><InventoryLocalizationProvider locale={locale}><div><div className="text-3xl font-semibold">{failed ? "—" : count ?? "…"}</div><p className="mt-2 text-sm text-hc-muted">{failed ? widgetLabels.error : count === null ? widgetLabels.loading : widgetLabels.description}</p></div></InventoryLocalizationProvider></div>;
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
    dashboard_widgets: [{
      id: "com.talpaversum.inventory.item-summary",
      title: widgetLabels.title,
      description: widgetLabels.description,
      category: widgetLabels.category,
      requiredPrivileges: ["inventory.read"],
      supportedScopes: ["tenant"],
      defaultVisible: false,
      defaultSize: "small",
      supportedSizes: ["small", "medium"],
      presentation: "kpi",
      defaultPosition: 1000,
      defaultSettings: {},
      component: InventorySummaryWidget,
    }],
  };
}
