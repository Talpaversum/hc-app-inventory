import { useEffect, useMemo, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";

type InventoryTemplatesPageProps = {
  api: InventoryApi;
};

export function InventoryTemplatesPage({ api }: InventoryTemplatesPageProps) {
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    visibility_scope: string;
    visibility_ref_id: string | null;
    is_locked: boolean;
  }> | null>(null);
  const [types, setTypes] = useState<Array<{ id: string; label: string; key: string }> | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [requiredMap, setRequiredMap] = useState<Record<string, boolean>>({});

  const load = async () => {
    const [tmplRes, typeRes] = await Promise.all([api.fetchTemplates(), api.fetchAttributeTypes()]);
    setTemplates(tmplRes.items);
    setTypes(typeRes.items.map((item) => ({ id: item.id, label: item.label, key: item.key })));
  };

  useEffect(() => {
    void load();
  }, []);

  const selectedTypes = useMemo(() => types?.filter((type) => selected.includes(type.id)) ?? [], [types, selected]);

  const toggleType = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    setRequiredMap((prev) => ({ ...prev, [id]: prev[id] ?? false }));
  };

  const handleCreate = async () => {
    if (!name) return;
    await api.createTemplate({
      name,
      visibility_scope: "tenant",
      fields: selectedTypes.map((type, index) => ({
        attribute_type_id: type.id,
        required: requiredMap[type.id] ?? false,
        sort_order: index,
      })),
    });
    setName("");
    setSelected([]);
    setRequiredMap({});
    await load();
  };

  return (
    <div className="inventory-grid">
      <SectionHeader title="Templates" subtitle="Inventory" />

      <div className="surface">
        <div className="inventory-grid two">
          <input placeholder="Název šablony" value={name} onChange={(event) => setName(event.target.value)} />
          <div>
            <button className="btn" onClick={handleCreate}>Vytvořit šablonu</button>
          </div>
        </div>
        <div className="inventory-grid two" style={{ marginTop: 12 }}>
          {(types ?? []).map((type) => (
            <label key={type.id} className="muted text-sm" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={selected.includes(type.id)}
                onChange={() => toggleType(type.id)}
              />
              {type.label}
              {selected.includes(type.id) && (
                <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={requiredMap[type.id] ?? false}
                    onChange={(event) =>
                      setRequiredMap((prev) => ({ ...prev, [type.id]: event.target.checked }))
                    }
                  />
                  Required
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="surface">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Název</th>
              <th>Scope</th>
              <th>Locked</th>
            </tr>
          </thead>
          <tbody>
            {(templates ?? []).map((template) => (
              <tr key={template.id}>
                <td>{template.name}</td>
                <td className="muted">{template.visibility_scope}</td>
                <td className="muted">{template.is_locked ? "Ano" : "Ne"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
