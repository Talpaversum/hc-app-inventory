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
    <div className="inventory-page">
      <SectionHeader
        title="Locations"
        subtitle="Inventory"
        description="Location hierarchy for physical items in the tenant inventory."
        aside={`${locations?.length ?? 0} records`}
      />

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">New location</div>
            <div className="inventory-card-note">A location can be assigned to a parent location.</div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-grid two">
            <div className="inventory-field">
              <label>Name</label>
              <input placeholder="Warehouse A" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>Location type</label>
              <select value={kindKey} onChange={(event) => setKindKey(event.target.value)}>
                {(kinds ?? []).map((kind) => (
                  <option key={kind.id} value={kind.key}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="inventory-field">
              <label>Parent</label>
              <select value={parentId ?? ""} onChange={(event) => setParentId(event.target.value || null)}>
                <option value="">No parent</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="inventory-form-actions">
            <button className="btn" onClick={handleCreateLocation}>Create location</button>
          </div>
        </div>
      </div>

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">Location types</div>
            <div className="inventory-card-note">Custom location classifications.</div>
          </div>
          <span className="inventory-pill">{kinds?.length ?? 0} types</span>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-grid two">
            <div className="inventory-field">
              <label>Key</label>
              <input placeholder="aisle" value={newKindKey} onChange={(event) => setNewKindKey(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>Label</label>
              <input placeholder="Aisle" value={newKindLabel} onChange={(event) => setNewKindLabel(event.target.value)} />
            </div>
          </div>
          <div className="inventory-form-actions">
            <button className="btn btn-secondary" onClick={handleCreateKind}>Create location type</button>
          </div>
        </div>
      </div>

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">Location list</div>
            <div className="inventory-card-note">Current location hierarchy.</div>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Parent</th>
              </tr>
            </thead>
            <tbody>
              {(locations ?? []).map((loc) => (
                <tr key={loc.id}>
                  <td>{loc.name}</td>
                  <td><span className="inventory-chip">{loc.kind_label}</span></td>
                  <td className="muted">{locations?.find((parent) => parent.id === loc.parent_id)?.name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(locations ?? []).length === 0 && <div className="inventory-empty">No locations.</div>}
        </div>
      </div>
    </div>
  );
}
