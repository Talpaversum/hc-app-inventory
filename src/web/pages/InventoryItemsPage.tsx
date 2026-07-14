import { useEffect, useMemo, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";

type InventoryItemsPageProps = {
  api: InventoryApi;
};

export function InventoryItemsPage({ api }: InventoryItemsPageProps) {
  const [items, setItems] = useState<Array<{ id: string; name: string; inventory_number: string | null }>>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [types, setTypes] = useState<Array<{ id: string; label: string; data_type: string }>>([]);
  const [templateFields, setTemplateFields] = useState<Array<{ attribute_type_id: string; required: boolean }>>([]);
  const [name, setName] = useState("");
  const [inventoryNumber, setInventoryNumber] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});

  const load = async () => {
    const [itemRes, tmplRes, locRes, typeRes] = await Promise.all([
      api.fetchItems(),
      api.fetchTemplates(),
      api.fetchLocations(),
      api.fetchAttributeTypes(),
    ]);
    setItems(itemRes.items);
    setTemplates(tmplRes.items.map((item) => ({ id: item.id, name: item.name })));
    setLocations(locRes.items.map((item) => ({ id: item.id, name: item.name })));
    setTypes(typeRes.items.map((item) => ({ id: item.id, label: item.label, data_type: item.data_type })));
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!name) return;
    const requiredIds = templateFields.filter((field) => field.required).map((field) => field.attribute_type_id);
    const missing = requiredIds.filter((id) => !attributeValues[id]);
    if (missing.length > 0) return;
    await api.createItem({
      name,
      inventory_number: inventoryNumber || null,
      template_id: templateId,
      location_id: locationId,
      attributes: types
        .map((type) => {
          const value = attributeValues[type.id];
          if (!value) return null;
          if (type.data_type === "number") {
            return { attribute_type_id: type.id, value_number: Number(value) };
          }
          if (type.data_type === "date") {
            return { attribute_type_id: type.id, value_date: value };
          }
          return { attribute_type_id: type.id, value_string: value };
        })
        .filter(Boolean) as Array<{ attribute_type_id: string; value_string?: string; value_number?: number; value_date?: string }>,
    });
    setName("");
    setInventoryNumber("");
    setTemplateId(null);
    setLocationId(null);
    setAttributeValues({});
    await load();
  };

  const visibleTypes = useMemo(
    () => types.filter((type) => templateFields.length === 0 || templateFields.some((f) => f.attribute_type_id === type.id)),
    [types, templateFields],
  );

  return (
    <div className="inventory-page">
      <SectionHeader
        title="Items"
        subtitle="Inventory"
        description="Physical and logical objects in the tenant inventory."
        aside={`${items.length} items`}
      />

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">New item</div>
            <div className="inventory-card-note">Basic identification, location, and attributes.</div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-grid two">
            <div className="inventory-field">
              <label>Name</label>
              <input placeholder="Epson projector" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>Inventory number</label>
              <input
                placeholder="INV-2026-001"
                value={inventoryNumber}
                onChange={(event) => setInventoryNumber(event.target.value)}
              />
            </div>
            <div className="inventory-field">
              <label>Template</label>
              <select
                value={templateId ?? ""}
                onChange={async (event) => {
                  const next = event.target.value || null;
                  setTemplateId(next);
                  if (!next) {
                    setTemplateFields([]);
                    return;
                  }
                  const response = await api.fetchTemplateFields(next);
                  setTemplateFields(response.items);
                }}
              >
                <option value="">No template</option>
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="inventory-field">
              <label>Location</label>
              <select value={locationId ?? ""} onChange={(event) => setLocationId(event.target.value || null)}>
                <option value="">No location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visibleTypes.length > 0 && (
            <div className="inventory-grid two inventory-subsection">
              {visibleTypes.map((type) => (
                <div className="inventory-field" key={type.id}>
                  <label>{type.label}</label>
                  <input
                    placeholder={type.data_type}
                    value={attributeValues[type.id] ?? ""}
                    onChange={(event) => setAttributeValues((prev) => ({ ...prev, [type.id]: event.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="inventory-form-actions">
            <button className="btn" onClick={handleCreate}>Create item</button>
          </div>
        </div>
      </div>

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">Item list</div>
            <div className="inventory-card-note">Latest inventory records.</div>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Inventory number</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="muted">{item.inventory_number ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <div className="inventory-empty">No items.</div>}
        </div>
      </div>
    </div>
  );
}
