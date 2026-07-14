import { useEffect, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";

type InventoryAttributeTypesPageProps = {
  api: InventoryApi;
};

export function InventoryAttributeTypesPage({ api }: InventoryAttributeTypesPageProps) {
  const [types, setTypes] = useState<Array<{
    id: string;
    key: string;
    label: string;
    data_type: string;
    is_builtin: boolean;
    validation_regex: string | null;
    unique_scope: string;
  }> | null>(null);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [dataType, setDataType] = useState("string");
  const [regex, setRegex] = useState("");
  const [uniqueScope, setUniqueScope] = useState("none");

  const load = async () => {
    const response = await api.fetchAttributeTypes();
    setTypes(response.items);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!key || !label) return;
    await api.createAttributeType({
      key,
      label,
      data_type: dataType,
      validation_regex: regex || null,
      unique_scope: uniqueScope,
    });
    setKey("");
    setLabel("");
    setRegex("");
    setUniqueScope("none");
    await load();
  };

  return (
    <div className="inventory-page">
      <SectionHeader
        title="Attribute types"
        subtitle="Inventory"
        description="Data types, validation, and uniqueness rules for custom fields."
        aside={`${types?.length ?? 0} types`}
      />

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">New attribute type</div>
            <div className="inventory-card-note">Define a custom field for items and templates.</div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-grid two">
            <div className="inventory-field">
              <label>Key</label>
              <input placeholder="chair_id" value={key} onChange={(event) => setKey(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>Label</label>
              <input placeholder="Chair ID" value={label} onChange={(event) => setLabel(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>Data type</label>
              <select value={dataType} onChange={(event) => setDataType(event.target.value)}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
            </div>
            <div className="inventory-field">
              <label>Unique scope</label>
              <select value={uniqueScope} onChange={(event) => setUniqueScope(event.target.value)}>
                <option value="none">None</option>
                <option value="tenant">Tenant</option>
                <option value="location">Location</option>
              </select>
            </div>
            <div className="inventory-field">
              <label>Validation regex</label>
              <input
                placeholder="Optional"
                value={regex}
                onChange={(event) => setRegex(event.target.value)}
              />
            </div>
          </div>
          <div className="inventory-form-actions">
            <button className="btn" onClick={handleCreate}>Create type</button>
          </div>
        </div>
      </div>

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">Attribute type list</div>
            <div className="inventory-card-note">Built-in and tenant-defined attributes.</div>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Key</th>
                <th>Type</th>
                <th>Unique</th>
              </tr>
            </thead>
            <tbody>
              {(types ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.label}</td>
                  <td className="muted">{item.key}</td>
                  <td><span className="inventory-chip">{item.data_type}</span></td>
                  <td className="muted">{item.unique_scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(types ?? []).length === 0 && <div className="inventory-empty">No attribute types.</div>}
        </div>
      </div>
    </div>
  );
}
