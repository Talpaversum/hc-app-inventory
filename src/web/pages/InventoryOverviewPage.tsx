import { useEffect, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";
import { useInventoryLocalization } from "../localization";

type InventoryOverviewPageProps = {
  api: InventoryApi;
};

type OverviewStats = {
  items: number;
  locations: number;
  templates: number;
  attributes: number;
};

export function InventoryOverviewPage({ api }: InventoryOverviewPageProps) {
  const { t } = useInventoryLocalization();
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [items, locations, templates, attributes] = await Promise.all([
        api.fetchItems(),
        api.fetchLocations(),
        api.fetchTemplates(),
        api.fetchAttributeTypes(),
      ]);

      if (!cancelled) {
        setStats({
          items: items.items.length,
          locations: locations.items.length,
          templates: templates.items.length,
          attributes: attributes.items.length,
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <div className="inventory-page">
      <SectionHeader
        title={t("overview")}
        subtitle={t("inventory")}
        description={t("overviewDescription")}
        aside="MVP"
      />

      <div className="inventory-grid three">
        <div className="inventory-stat">
          <div className="inventory-stat-label">{t("items")}</div>
          <div className="inventory-stat-value">{stats?.items ?? "-"}</div>
          <div className="inventory-stat-detail">{t("trackedObjects")}</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">{t("locations")}</div>
          <div className="inventory-stat-value">{stats?.locations ?? "-"}</div>
          <div className="inventory-stat-detail">{t("locationSummary")}</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">{t("templates")}</div>
          <div className="inventory-stat-value">{stats?.templates ?? "-"}</div>
          <div className="inventory-stat-detail">{t("templateSummary")}</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">{t("attributeTypes")}</div>
          <div className="inventory-stat-value">{stats?.attributes ?? "-"}</div>
          <div className="inventory-stat-detail">{t("attributeSummary")}</div>
        </div>
      </div>
    </div>
  );
}
