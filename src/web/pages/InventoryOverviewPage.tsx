import { useEffect, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";

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
        title="Přehled"
        subtitle="Inventory"
        description="Souhrn tenant inventáře, jeho struktury a konfiguračních prvků."
        aside="MVP"
      />

      <div className="inventory-grid three">
        <div className="inventory-stat">
          <div className="inventory-stat-label">Položky</div>
          <div className="inventory-stat-value">{stats?.items ?? "-"}</div>
          <div className="inventory-stat-detail">Evidované objekty</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">Lokace</div>
          <div className="inventory-stat-value">{stats?.locations ?? "-"}</div>
          <div className="inventory-stat-detail">Místnosti, budovy a další umístění</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">Šablony</div>
          <div className="inventory-stat-value">{stats?.templates ?? "-"}</div>
          <div className="inventory-stat-detail">Předpisy atributů pro položky</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">Typy atributů</div>
          <div className="inventory-stat-value">{stats?.attributes ?? "-"}</div>
          <div className="inventory-stat-detail">Dostupná pole a validace</div>
        </div>
      </div>
    </div>
  );
}
