import { useEffect, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";
import { localizeBuiltin, useInventoryLocalization } from "../localization";

type InventoryAttributeTypesPageProps = {
  api: InventoryApi;
};

export function InventoryAttributeTypesPage({ api }: InventoryAttributeTypesPageProps) {
  const { t } = useInventoryLocalization();
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
        title={t("attributeTypes")}
        subtitle={t("inventory")}
        description={t("attributesDescription")}
        aside={t("typesCount", { count: types?.length ?? 0 })}
      />

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">{t("newAttributeType")}</div>
            <div className="inventory-card-note">{t("newAttributeTypeNote")}</div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-grid two">
            <div className="inventory-field">
              <label>{t("key")}</label>
              <input placeholder="chair_id" value={key} onChange={(event) => setKey(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>{t("label")}</label>
              <input placeholder={t("exampleAttribute")} value={label} onChange={(event) => setLabel(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>{t("dataType")}</label>
              <select value={dataType} onChange={(event) => setDataType(event.target.value)}>
                <option value="string">{t("string")}</option>
                <option value="number">{t("number")}</option>
                <option value="date">{t("date")}</option>
              </select>
            </div>
            <div className="inventory-field">
              <label>{t("uniqueScope")}</label>
              <select value={uniqueScope} onChange={(event) => setUniqueScope(event.target.value)}>
                <option value="none">{t("none")}</option>
                <option value="tenant">{t("tenant")}</option>
                <option value="location">{t("location")}</option>
              </select>
            </div>
            <div className="inventory-field">
              <label>{t("validationRegex")}</label>
              <input
                placeholder={t("optional")}
                value={regex}
                onChange={(event) => setRegex(event.target.value)}
              />
            </div>
          </div>
          <div className="inventory-form-actions">
            <button className="btn" onClick={handleCreate}>{t("createType")}</button>
          </div>
        </div>
      </div>

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">{t("attributeTypeList")}</div>
            <div className="inventory-card-note">{t("attributeTypeListNote")}</div>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>{t("label")}</th>
                <th>{t("key")}</th>
                <th>{t("type")}</th>
                <th>{t("unique")}</th>
              </tr>
            </thead>
            <tbody>
              {(types ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.is_builtin ? localizeBuiltin(item.key, item.label, t) : item.label}</td>
                  <td className="muted">{item.key}</td>
                  <td><span className="inventory-chip">{item.data_type}</span></td>
                  <td className="muted">{item.unique_scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(types ?? []).length === 0 && <div className="inventory-empty">{t("noAttributeTypes")}</div>}
        </div>
      </div>
    </div>
  );
}
