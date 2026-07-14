import { useEffect, useMemo, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";

type InventoryTemplatesPageProps = {
  api: InventoryApi;
};

type TemplateFieldDraft = {
  attribute_type_id: string;
  required: boolean;
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
  const [visibilityScope, setVisibilityScope] = useState("tenant");
  const [visibilityRefId, setVisibilityRefId] = useState("");
  const [fields, setFields] = useState<TemplateFieldDraft[]>([]);

  const load = async () => {
    const [tmplRes, typeRes] = await Promise.all([api.fetchTemplates(), api.fetchAttributeTypes()]);
    setTemplates(tmplRes.items);
    setTypes(typeRes.items.map((item) => ({ id: item.id, label: item.label, key: item.key })));
  };

  useEffect(() => {
    void load();
  }, []);

  const selectedIds = useMemo(() => fields.map((field) => field.attribute_type_id).filter(Boolean), [fields]);

  const addField = () => {
    const nextType = (types ?? []).find((type) => !selectedIds.includes(type.id));
    setFields((prev) => [...prev, { attribute_type_id: nextType?.id ?? "", required: false }]);
  };

  const updateField = (index: number, patch: Partial<TemplateFieldDraft>) => {
    setFields((prev) => prev.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...patch } : field)));
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, fieldIndex) => fieldIndex !== index));
  };

  const handleCreate = async () => {
    if (!name) return;
    const normalizedFields = fields.filter((field) => field.attribute_type_id);
    await api.createTemplate({
      name,
      visibility_scope: visibilityScope,
      visibility_ref_id: visibilityScope === "tenant" ? null : visibilityRefId || null,
      fields: normalizedFields.map((field, index) => ({
        attribute_type_id: field.attribute_type_id,
        required: field.required,
        sort_order: index,
      })),
    });
    setName("");
    setVisibilityScope("tenant");
    setVisibilityRefId("");
    setFields([]);
    await load();
  };

  return (
    <div className="inventory-page">
      <SectionHeader
        title="Templates"
        subtitle="Inventory"
        description="Reusable attribute sets for inventory item types."
        aside={`${templates?.length ?? 0} templates`}
      />

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">New template</div>
            <div className="inventory-card-note">Select fields and required attributes.</div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-grid two">
            <div className="inventory-field">
              <label>Name</label>
              <input placeholder="Office equipment" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>Scope</label>
              <select value={visibilityScope} onChange={(event) => setVisibilityScope(event.target.value)}>
                <option value="tenant">Tenant</option>
                <option value="department">Department</option>
                <option value="group">Group</option>
                <option value="user">User</option>
              </select>
            </div>
            {visibilityScope !== "tenant" && (
              <div className="inventory-field">
                <label>Scope reference</label>
                <input
                  placeholder={`${visibilityScope}_id`}
                  value={visibilityRefId}
                  onChange={(event) => setVisibilityRefId(event.target.value)}
                />
              </div>
            )}
          </div>

          <div className="inventory-field-builder inventory-subsection">
            <div className="inventory-card-header compact">
              <div>
                <div className="inventory-card-title">Template attributes</div>
                <div className="inventory-card-note">Add fields in the order in which they should be completed.</div>
              </div>
              <button className="btn btn-secondary" onClick={addField}>+ Add attribute</button>
            </div>

            <div className="inventory-field-list">
              {fields.map((field, index) => {
                const optionIds = new Set([...selectedIds.filter((id) => id !== field.attribute_type_id), ""]);
                const options = (types ?? []).filter((type) => !optionIds.has(type.id) || type.id === field.attribute_type_id);
                return (
                  <div className="inventory-field-row" key={`${field.attribute_type_id}-${index}`}>
                    <div className="inventory-row-index">{index + 1}</div>
                    <div className="inventory-field">
                      <label>Attribute</label>
                      <select
                        value={field.attribute_type_id}
                        onChange={(event) => updateField(index, { attribute_type_id: event.target.value })}
                      >
                        <option value="">Select attribute</option>
                        {options.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label} ({type.key})
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="inventory-required-toggle">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(event) => updateField(index, { required: event.target.checked })}
                      />
                      Required
                    </label>
                    <button className="btn btn-icon btn-danger" onClick={() => removeField(index)} aria-label="Remove attribute">
                      ×
                    </button>
                  </div>
                );
              })}
              {fields.length === 0 && <div className="inventory-empty compact">The template has no attributes yet.</div>}
            </div>
          </div>

          <div className="inventory-form-actions">
            <button className="btn" onClick={handleCreate}>Create template</button>
          </div>
        </div>
      </div>

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">Template list</div>
            <div className="inventory-card-note">Tenant templates for inventory items.</div>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Scope</th>
                <th>Locked</th>
              </tr>
            </thead>
            <tbody>
              {(templates ?? []).map((template) => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td><span className="inventory-chip">{template.visibility_scope}</span></td>
                  <td className="muted">{template.is_locked ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(templates ?? []).length === 0 && <div className="inventory-empty">No templates.</div>}
        </div>
      </div>
    </div>
  );
}
