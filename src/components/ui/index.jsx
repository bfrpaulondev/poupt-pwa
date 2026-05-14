import { ChevronRight } from 'lucide-react';

export function Page({ eyebrow, title, description, action, children, className = '' }) {
  return (
    <div className={`ui-page ${className}`}>
      {(eyebrow || title || description || action) && (
        <div className="ui-page-header">
          <div>
            {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
            {title && <h1 className="ui-page-title">{title}</h1>}
            {description && <p className="ui-page-description">{description}</p>}
          </div>
          {action && <div className="ui-page-action">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Card({ children, className = '', compact = false, interactive = false, ...props }) {
  return (
    <div
      className={`ui-card ${compact ? 'ui-card--compact' : ''} ${interactive ? 'ui-card--interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, description, action, className = '' }) {
  return (
    <div className={`ui-section-header ${className}`}>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button className={`ui-button ui-button--${variant} ui-button--${size} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function StatCard({ icon: Icon, label, value, tone = 'default', footer, className = '' }) {
  return (
    <Card compact className={`ui-stat ui-stat--${tone} ${className}`}>
      <div className="ui-stat-icon">{Icon && <Icon size={17} />}</div>
      <div>
        <p className="ui-stat-label">{label}</p>
        <p className="ui-stat-value">{value}</p>
        {footer && <p className="ui-stat-footer">{footer}</p>}
      </div>
    </Card>
  );
}

export function ProgressBar({ value = 0, max = 100, tone = 'primary', className = '' }) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={`ui-progress ui-progress--${tone} ${className}`}>
      <div style={{ width: `${percentage}%` }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="ui-empty-state">
      {Icon && <div className="ui-empty-icon"><Icon size={30} /></div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function MoneyValue({ value, muted = false, className = '' }) {
  return <span className={`ui-money ${muted ? 'ui-money--muted' : ''} ${className}`}>{value}</span>;
}

export function TransactionItem({ title, subtitle, amount, type, onClick }) {
  const isIncome = type === 'income' || type === 'receita';

  return (
    <button type="button" onClick={onClick} className="ui-transaction-item">
      <div className={`ui-transaction-dot ${isIncome ? 'income' : 'expense'}`} />
      <div className="ui-transaction-main">
        <p>{title}</p>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className={`ui-transaction-amount ${isIncome ? 'income' : 'expense'}`}>
        {amount}
      </div>
      <ChevronRight size={15} className="ui-transaction-chevron" />
    </button>
  );
}
