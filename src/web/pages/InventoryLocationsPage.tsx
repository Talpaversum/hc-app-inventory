import { useEffect, useMemo, useState } from "react";

import type { InventoryApi } from "../api/inventory-api";
import { SectionHeader } from "../components/SectionHeader";
import { localizeBuiltin, useInventoryLocalization } from "../localization";

type InventoryLocationsPageProps = {
  api: InventoryApi;
};

export function InventoryLocationsPage({ api }: InventoryLocationsPageProps) {
  const { t } = useInventoryLocalization();
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
    () => locations?.map((loc) => ({ id: loc.id, label: `${localizeBuiltin(loc.kind_key, loc.kind_label, t)}: ${loc.name}` })) ?? [],
    [locations, t],
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
        title={t("locations")}
        subtitle={t("inventory")}
        description={t("locationsDescription")}
        aside={t("recordsCount", { count: locations?.length ?? 0 })}
      />

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">{t("newLocation")}</div>
            <div className="inventory-card-note">{t("newLocationNote")}</div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-grid two">
            <div className="inventory-field">
              <label>{t("name")}</label>
              <input placeholder={t("exampleLocation")} value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>{t("locationType")}</label>
              <select value={kindKey} onChange={(event) => setKindKey(event.target.value)}>
                {(kinds ?? []).map((kind) => (
                  <option key={kind.id} value={kind.key}>
                    {kind.is_builtin ? localizeBuiltin(kind.key, kind.label, t) : kind.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="inventory-field">
              <label>{t("parent")}</label>
              <select value={parentId ?? ""} onChange={(event) => setParentId(event.target.value || null)}>
                <option value="">{t("noParent")}</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="inventory-form-actions">
            <button className="btn" onClick={handleCreateLocation}>{t("createLocation")}</button>
          </div>
        </div>
      </div>

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">{t("locationTypes")}</div>
            <div className="inventory-card-note">{t("locationTypesNote")}</div>
          </div>
          <span className="inventory-pill">{t("typesCount", { count: kinds?.length ?? 0 })}</span>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-grid two">
            <div className="inventory-field">
              <label>{t("key")}</label>
              <input placeholder="aisle" value={newKindKey} onChange={(event) => setNewKindKey(event.target.value)} />
            </div>
            <div className="inventory-field">
              <label>{t("label")}</label>
              <input placeholder={t("exampleKind")} value={newKindLabel} onChange={(event) => setNewKindLabel(event.target.value)} />
            </div>
          </div>
          <div className="inventory-form-actions">
            <button className="btn btn-secondary" onClick={handleCreateKind}>{t("createLocationType")}</button>
          </div>
        </div>
      </div>

      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <div className="inventory-card-title">{t("locationList")}</div>
            <div className="inventory-card-note">{t("locationListNote")}</div>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("type")}</th>
                <th>{t("parent")}</th>
              </tr>
            </thead>
            <tbody>
              {(locations ?? []).map((loc) => (
                <tr key={loc.id}>
                  <td>{loc.name}</td>
                  <td><span className="inventory-chip">{localizeBuiltin(loc.kind_key, loc.kind_label, t)}</span></td>
                  <td className="muted">{locations?.find((parent) => parent.id === loc.parent_id)?.name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(locations ?? []).length === 0 && <div className="inventory-empty">{t("noLocations")}</div>}
        </div>
      </div>
    </div>
  );
}
