import type { AppContext } from "../../plugin";

const API_BASE = "/api/v1/apps/app_inventory";

export type InventoryApi = {
  fetchLocations: () => Promise<{ items: Array<{ id: string; parent_id: string | null; name: string; kind_key: string; kind_label: string }> }>;
  createLocation: (payload: { name: string; kind_key: string; parent_id?: string | null }) => Promise<void>;
  fetchLocationKinds: () => Promise<{ items: Array<{ id: string; key: string; label: string; is_builtin: boolean }> }>;
  createLocationKind: (payload: { key: string; label: string }) => Promise<void>;
  fetchAttributeTypes: () => Promise<{
    items: Array<{ id: string; key: string; label: string; data_type: string; is_builtin: boolean; validation_regex: string | null; unique_scope: string }>;
  }>;
  createAttributeType: (payload: {
    key: string;
    label: string;
    data_type: string;
    validation_regex?: string | null;
    unique_scope?: string;
  }) => Promise<void>;
  fetchTemplates: () => Promise<{
    items: Array<{ id: string; name: string; visibility_scope: string; visibility_ref_id: string | null; is_locked: boolean }>;
  }>;
  createTemplate: (payload: {
    name: string;
    visibility_scope: string;
    visibility_ref_id?: string | null;
    fields: Array<{ attribute_type_id: string; required: boolean; sort_order: number }>;
  }) => Promise<void>;
  fetchTemplateFields: (templateId: string) => Promise<{ items: Array<{ attribute_type_id: string; required: boolean }> }>;
  fetchItems: () => Promise<{ items: Array<{ id: string; name: string; inventory_number: string | null }> }>;
  createItem: (payload: {
    name: string;
    inventory_number?: string | null;
    template_id?: string | null;
    location_id?: string | null;
    owner?: { type: string; id: string } | null;
    manager?: { type: string; id: string } | null;
    attributes?: Array<{ attribute_type_id: string; value_string?: string; value_number?: number; value_date?: string }>;
  }) => Promise<void>;
};

export function createInventoryApi(appContext: AppContext): InventoryApi {
  const request = <T,>(path: string, init?: RequestInit) =>
    appContext.api.request<T>(`${API_BASE}${path}`, {
      headers: {
        "content-type": "application/json",
      },
      ...init,
    });

  return {
    fetchLocations: () =>
      request<{ items: Array<{ id: string; parent_id: string | null; name: string; kind_key: string; kind_label: string }> }>(
        "/v1/locations",
      ),
    createLocation: (payload) => request("/v1/locations", { method: "POST", body: JSON.stringify(payload) }),
    fetchLocationKinds: () => request<{ items: Array<{ id: string; key: string; label: string; is_builtin: boolean }> }>("/v1/location-kinds"),
    createLocationKind: (payload) => request("/v1/location-kinds", { method: "POST", body: JSON.stringify(payload) }),
    fetchAttributeTypes: () =>
      request<{
        items: Array<{ id: string; key: string; label: string; data_type: string; is_builtin: boolean; validation_regex: string | null; unique_scope: string }>;
      }>("/v1/attribute-types"),
    createAttributeType: (payload) => request("/v1/attribute-types", { method: "POST", body: JSON.stringify(payload) }),
    fetchTemplates: () =>
      request<{
        items: Array<{ id: string; name: string; visibility_scope: string; visibility_ref_id: string | null; is_locked: boolean }>;
      }>("/v1/templates"),
    createTemplate: (payload) => request("/v1/templates", { method: "POST", body: JSON.stringify(payload) }),
    fetchTemplateFields: (templateId) => request<{ items: Array<{ attribute_type_id: string; required: boolean }> }>(`/v1/templates/${templateId}/fields`),
    fetchItems: () => request<{ items: Array<{ id: string; name: string; inventory_number: string | null }> }>("/v1/items"),
    createItem: (payload) => request("/v1/items", { method: "POST", body: JSON.stringify(payload) }),
  };
}
