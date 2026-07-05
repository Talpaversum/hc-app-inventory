type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  description?: string;
  aside?: string;
};

export function SectionHeader({ title, subtitle, description, aside }: SectionHeaderProps) {
  return (
    <div className="inventory-header">
      <div>
        {subtitle && <div className="inventory-eyebrow">{subtitle}</div>}
        <div className="inventory-title">{title}</div>
        {description && <div className="inventory-subtitle">{description}</div>}
      </div>
      {aside && <div className="inventory-pill">{aside}</div>}
    </div>
  );
}
