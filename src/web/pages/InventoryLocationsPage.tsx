import { useEffect, useMemo, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";

type InventoryLocationsPageProps = {
  api: InventoryApi;
};

export function InventoryLocationsPage({ api }: InventoryLocationsPageProps) {
  const [locations, setLocations] = useState<Array<{
    id: string;
    parent_id: string | null;
    name: string;
    kind_key: string;
    kind_label: string;
  }> | null>(null);
  const [kinds, setKinds] = useState<Array<{ id: string; key: string; label: string; is_builtin: boolean }> | null>(null);
  const [name, setName] = useState("");
  const [kindKey, setKindKey] = useState("room");
  const [parentId, setParentId] = useState<string | null>(null);
  const [newKindKey, setNewKindKey] = useState("");
  const [newKindLabel, setNewKindLabel] = useState("");

  const parentOptions = useMemo(
    () => locations?.map((loc) => ({ id: loc.id, label: `${loc.kind_label}: ${loc.name}` })) ?? [],
    [locations],
  );

  const load = async () => {
    const [locRes, kindRes] = await Promise.all([api.fetchLocations(), api.fetchLocationKinds()]);
    setLocations(locRes.items);
    setKinds(kindRes.items);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateLocation = async () => {
    if (!name || !kindKey) return;
    await api.createLocation({ name, kind_key: kindKey, parent_id: parentId });
    setName("");
    setParentId(null);
    await load();
  };

  const handleCreateKind = async () => {
    if (!newKindKey || !newKindLabel) return;
    await api.createLocationKind({ key: newKindKey, label: newKindLabel });
    setNewKindKey("");
    setNewKindLabel("");
    await load();
  };

  return (
    <div className="inventory-grid">
      <SectionHeader title="Locations" subtitle="Inventory" />

      <div className="surface">
        <div className="inventory-grid two">
          <div>
            <div className="text-sm font-medium">Nová lokace</div>
            <div className="inventory-grid">
              <input placeholder="Název" value={name} onChange={(event) => setName(event.target.value)} />
              <div>
                <label className="muted text-xs">Typ lokace</label>
                <select value={kindKey} onChange={(event) => setKindKey(event.target.value)}>
                  {(kinds ?? []).map((kind) => (
                    <option key={kind.id} value={kind.key}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="muted text-xs">Rodič</label>
                <select value={parentId ?? ""} onChange={(event) => setParentId(event.target.value || null)}>
                  <option value="">(bez rodiče)</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn" onClick={handleCreateLocation}>Vytvořit lokaci</button>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Nový typ lokace</div>
            <div className="inventory-grid">
              <input placeholder="Key (např. aisle)" value={newKindKey} onChange={(event) => setNewKindKey(event.target.value)} />
              <input placeholder="Label (např. Aisle)" value={newKindLabel} onChange={(event) => setNewKindLabel(event.target.value)} />
              <button className="btn btn-secondary" onClick={handleCreateKind}>Vytvořit typ lokace</button>
            </div>
          </div>
        </div>
      </div>

      <div className="surface">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Název</th>
              <th>Typ</th>
              <th>Parent</th>
            </tr>
          </thead>
          <tbody>
            {(locations ?? []).map((loc) => (
              <tr key={loc.id}>
                <td>{loc.name}</td>
                <td className="muted">{loc.kind_label}</td>
                <td className="muted">{locations?.find((parent) => parent.id === loc.parent_id)?.name ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
