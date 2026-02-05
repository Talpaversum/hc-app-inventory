type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div>
      {subtitle && <div className="muted text-xs uppercase tracking-wide">{subtitle}</div>}
      <div className="mt-1 text-2xl font-semibold">{title}</div>
    </div>
  );
}
