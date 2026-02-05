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
    <div className="inventory-grid">
      <SectionHeader title="Attribute types" subtitle="Inventory" />

      <div className="surface">
        <div className="inventory-grid two">
          <input placeholder="Key (např. chair_id)" value={key} onChange={(event) => setKey(event.target.value)} />
          <input placeholder="Label (např. Chair ID)" value={label} onChange={(event) => setLabel(event.target.value)} />
          <div>
            <label className="muted text-xs">Datový typ</label>
            <select value={dataType} onChange={(event) => setDataType(event.target.value)}>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </select>
          </div>
          <div>
            <label className="muted text-xs">Unique scope</label>
            <select value={uniqueScope} onChange={(event) => setUniqueScope(event.target.value)}>
              <option value="none">None</option>
              <option value="tenant">Tenant</option>
              <option value="location">Location</option>
            </select>
          </div>
          <input
            placeholder="Validation regex (volitelné)"
            value={regex}
            onChange={(event) => setRegex(event.target.value)}
          />
          <div>
            <button className="btn" onClick={handleCreate}>Vytvořit typ</button>
          </div>
        </div>
      </div>

      <div className="surface">
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
                <td className="muted">{item.data_type}</td>
                <td className="muted">{item.unique_scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
