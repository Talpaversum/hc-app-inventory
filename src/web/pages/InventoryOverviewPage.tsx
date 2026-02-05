import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";

type InventoryOverviewPageProps = {
  api: InventoryApi;
};

export function InventoryOverviewPage({ api: _api }: InventoryOverviewPageProps) {
  return (
    <div className="inventory-grid">
      <SectionHeader title="Přehled" subtitle="Inventory" />
      <div className="surface">
        <div className="text-sm">Přehled inventáře (MVP)</div>
        <p className="muted text-sm">Zvolte sekci vlevo pro práci s lokacemi, šablonami a položkami.</p>
      </div>
    </div>
  );
}
