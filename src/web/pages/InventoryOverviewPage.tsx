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
        title="Overview"
        subtitle="Inventory"
        description="Summary of the tenant inventory, its structure, and configuration."
        aside="MVP"
      />

      <div className="inventory-grid three">
        <div className="inventory-stat">
          <div className="inventory-stat-label">Items</div>
          <div className="inventory-stat-value">{stats?.items ?? "-"}</div>
          <div className="inventory-stat-detail">Tracked objects</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">Locations</div>
          <div className="inventory-stat-value">{stats?.locations ?? "-"}</div>
          <div className="inventory-stat-detail">Rooms, buildings, and other locations</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">Templates</div>
          <div className="inventory-stat-value">{stats?.templates ?? "-"}</div>
          <div className="inventory-stat-detail">Attribute definitions for items</div>
        </div>
        <div className="inventory-stat">
          <div className="inventory-stat-label">Attribute types</div>
          <div className="inventory-stat-value">{stats?.attributes ?? "-"}</div>
          <div className="inventory-stat-detail">Available fields and validation rules</div>
        </div>
      </div>
    </div>
  );
}
