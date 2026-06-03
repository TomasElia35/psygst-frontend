export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="empty-state bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-10 flex flex-col items-center justify-center text-center">
            {Icon && (
                <div className="mb-4 text-[var(--text-muted)] opacity-50">
                    <Icon size={48} strokeWidth={1.5} />
                </div>
            )}
            <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">{title}</h3>
            {description && <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">{description}</p>}
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
