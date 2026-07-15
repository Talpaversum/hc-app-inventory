import { createContext, useContext, type ReactNode } from "react";

const en = {
  inventory: "Inventory", overview: "Overview", items: "Items", locations: "Locations", templates: "Templates", attributeTypes: "Attribute types",
  overviewDescription: "Summary of the tenant inventory, its structure, and configuration.", trackedObjects: "Tracked objects",
  locationSummary: "Rooms, buildings, and other locations", templateSummary: "Attribute definitions for items", attributeSummary: "Available fields and validation rules",
  itemsDescription: "Physical and logical objects in the tenant inventory.", itemsCount: "{{count}} items", newItem: "New item",
  newItemNote: "Basic identification, location, and attributes.", name: "Name", inventoryNumber: "Inventory number", template: "Template", noTemplate: "No template",
  location: "Location", noLocation: "No location", createItem: "Create item", itemList: "Item list", itemListNote: "Latest inventory records.", noItems: "No items.",
  locationsDescription: "Location hierarchy for physical items in the tenant inventory.", recordsCount: "{{count}} records", newLocation: "New location",
  newLocationNote: "A location can be assigned to a parent location.", locationType: "Location type", parent: "Parent", noParent: "No parent",
  createLocation: "Create location", locationTypes: "Location types", locationTypesNote: "Custom location classifications.", typesCount: "{{count}} types",
  key: "Key", label: "Label", createLocationType: "Create location type", locationList: "Location list", locationListNote: "Current location hierarchy.", type: "Type", noLocations: "No locations.",
  templatesDescription: "Reusable attribute sets for inventory item types.", templatesCount: "{{count}} templates", newTemplate: "New template",
  newTemplateNote: "Select fields and required attributes.", scope: "Scope", department: "Department", group: "Group", user: "User", scopeReference: "Scope reference",
  templateAttributes: "Template attributes", templateAttributesNote: "Add fields in the order in which they should be completed.", addAttribute: "Add attribute",
  attribute: "Attribute", selectAttribute: "Select attribute", required: "Required", removeAttribute: "Remove attribute", noTemplateAttributes: "The template has no attributes yet.",
  createTemplate: "Create template", templateList: "Template list", templateListNote: "Tenant templates for inventory items.", locked: "Locked", yes: "Yes", no: "No", noTemplates: "No templates.",
  attributesDescription: "Data types, validation, and uniqueness rules for custom fields.", newAttributeType: "New attribute type",
  newAttributeTypeNote: "Define a custom field for items and templates.", dataType: "Data type", string: "String", number: "Number", date: "Date",
  uniqueScope: "Unique scope", none: "None", tenant: "Tenant", validationRegex: "Validation regex", optional: "Optional", createType: "Create type",
  attributeTypeList: "Attribute type list", attributeTypeListNote: "Built-in and tenant-defined attributes.", unique: "Unique", noAttributeTypes: "No attribute types.",
  exampleItem: "Epson projector", exampleLocation: "Warehouse A", exampleKind: "Aisle", exampleTemplate: "Office equipment", exampleAttribute: "Chair ID",
  area: "Area", building: "Building", room: "Room", defaultItem: "Default item",
} as const;

const cs: Record<keyof typeof en, string> = {
  ...en,
  inventory: "Inventář", overview: "Přehled", items: "Položky", locations: "Umístění", templates: "Šablony", attributeTypes: "Typy atributů",
  overviewDescription: "Shrnutí inventáře tenantu, jeho struktury a nastavení.", trackedObjects: "Evidované objekty",
  locationSummary: "Místnosti, budovy a další umístění", templateSummary: "Definice atributů položek", attributeSummary: "Dostupná pole a validační pravidla",
  itemsDescription: "Fyzické a logické objekty v inventáři tenantu.", itemsCount: "Položky: {{count}}", newItem: "Nová položka",
  newItemNote: "Základní identifikace, umístění a atributy.", name: "Název", inventoryNumber: "Inventární číslo", template: "Šablona", noTemplate: "Bez šablony",
  location: "Umístění", noLocation: "Bez umístění", createItem: "Vytvořit položku", itemList: "Seznam položek", itemListNote: "Nejnovější záznamy inventáře.", noItems: "Žádné položky.",
  locationsDescription: "Hierarchie umístění fyzických položek v inventáři tenantu.", recordsCount: "Záznamy: {{count}}", newLocation: "Nové umístění",
  newLocationNote: "Umístění lze přiřadit nadřazenému umístění.", locationType: "Typ umístění", parent: "Nadřazené umístění", noParent: "Bez nadřazeného umístění",
  createLocation: "Vytvořit umístění", locationTypes: "Typy umístění", locationTypesNote: "Vlastní klasifikace umístění.", typesCount: "Typy: {{count}}",
  key: "Klíč", label: "Popisek", createLocationType: "Vytvořit typ umístění", locationList: "Seznam umístění", locationListNote: "Aktuální hierarchie umístění.", type: "Typ", noLocations: "Žádná umístění.",
  templatesDescription: "Opakovaně použitelné sady atributů pro typy inventárních položek.", templatesCount: "Šablony: {{count}}", newTemplate: "Nová šablona",
  newTemplateNote: "Vyberte pole a povinné atributy.", scope: "Rozsah", department: "Oddělení", group: "Skupina", user: "Uživatel", scopeReference: "Reference rozsahu",
  templateAttributes: "Atributy šablony", templateAttributesNote: "Přidejte pole v pořadí, ve kterém se mají vyplňovat.", addAttribute: "Přidat atribut",
  attribute: "Atribut", selectAttribute: "Vyberte atribut", required: "Povinný", removeAttribute: "Odebrat atribut", noTemplateAttributes: "Šablona zatím nemá žádné atributy.",
  createTemplate: "Vytvořit šablonu", templateList: "Seznam šablon", templateListNote: "Šablony inventárních položek tenantu.", locked: "Uzamčeno", yes: "Ano", no: "Ne", noTemplates: "Žádné šablony.",
  attributesDescription: "Datové typy, validace a pravidla jedinečnosti vlastních polí.", newAttributeType: "Nový typ atributu",
  newAttributeTypeNote: "Definujte vlastní pole pro položky a šablony.", dataType: "Datový typ", string: "Text", number: "Číslo", date: "Datum",
  uniqueScope: "Rozsah jedinečnosti", none: "Žádný", tenant: "Tenant", validationRegex: "Validační regulární výraz", optional: "Volitelné", createType: "Vytvořit typ",
  attributeTypeList: "Seznam typů atributů", attributeTypeListNote: "Vestavěné a tenantem definované atributy.", unique: "Jedinečnost", noAttributeTypes: "Žádné typy atributů.",
  exampleItem: "Projektor Epson", exampleLocation: "Sklad A", exampleKind: "Ulička", exampleTemplate: "Kancelářské vybavení", exampleAttribute: "ID židle",
  area: "Oblast", building: "Budova", room: "Místnost", defaultItem: "Výchozí položka",
};

type Key = keyof typeof en;
type Localization = { t: (key: Key, values?: Record<string, string | number>) => string };
const Context = createContext<Localization>({ t: (key) => en[key] });

export function InventoryLocalizationProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const messages = locale === "cs" ? cs : en;
  const t = (key: Key, values: Record<string, string | number> = {}) =>
    Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)), messages[key]);
  return <Context.Provider value={{ t }}>{children}</Context.Provider>;
}

export function useInventoryLocalization() {
  return useContext(Context);
}

export function localizeBuiltin(key: string, fallback: string, t: Localization["t"]) {
  const keys: Partial<Record<string, Key>> = {
    area: "area", building: "building", room: "room", name: "name", inventory_number: "inventoryNumber",
  };
  return keys[key] ? t(keys[key]!) : fallback;
}

export function inventoryNavLabels(locale: string) {
  const messages = locale === "cs" ? cs : en;
  return [messages.overview, messages.items, messages.locations, messages.templates, messages.attributeTypes];
}
