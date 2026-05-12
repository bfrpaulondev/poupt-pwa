import useStore from '../store/useStore';
import { modeColors } from '../utils/helpers';
import { Shield, AlertTriangle, Phone, FileText, Heart, ArrowRight, ExternalLink } from 'lucide-react';

export default function SurvivalMode() {
  const { user } = useStore();
  const modeColor = modeColors.sobrevivencia;

  const emergencyActions = [
    { icon: AlertTriangle, title: 'Ver dividas em atraso', desc: 'Prioriza o que esta vencido', screen: 'debts' },
    { icon: FileText, title: 'Negociar com credores', desc: 'Templates de negociacao prontos', action: 'templates' },
    { icon: Shield, title: 'Mapa Banco de Portugal', desc: 'Verificar registo de credito', action: 'bdp' },
    { icon: Heart, title: 'Recursos de apoio', desc: 'DECO, Linha Sobreendividado', action: 'resources' },
  ];

  const resources = [
    { name: 'DECO Proteste', phone: '213 710 200', desc: 'Associacao de defesa do consumidor' },
    { name: 'Linha de Apoio ao Sobreendividado', phone: '213 880 600', desc: 'Apoyo gratuito do Banco de Portugal' },
    { name: 'Banco de Portugal - Central de Responsabilidades', phone: '213 213 000', desc: 'Consultar registo de credito' },
  ];

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Emergency Header */}
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))`, border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} style={{ color: '#EF4444' }} />
          <h2 className="text-lg font-bold" style={{ color: '#EF4444' }}>Modo Sobrevivencia</h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Foca-te nas acoes imediatas. Um passo de cada vez. Vais superar isto.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Acoes Imediatas
        </h3>
        <div className="space-y-2">
          {emergencyActions.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Icon size={18} style={{ color: '#EF4444' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Budget Minimalista */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#EF4444' }}>
          Orcamento Minimalista
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Rendimento</span>
            <span className="font-semibold" style={{ color: '#10B981' }}>
              {(user?.income || 0).toFixed(0)} EUR
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Sobrevivencia (50%)</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {(user?.income * 0.5 || 0).toFixed(0)} EUR
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Dividas (40%)</span>
            <span className="font-semibold" style={{ color: '#EF4444' }}>
              {(user?.income * 0.4 || 0).toFixed(0)} EUR
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Reserva (10%)</span>
            <span className="font-semibold" style={{ color: 'var(--gold)' }}>
              {(user?.income * 0.1 || 0).toFixed(0)} EUR
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Resources */}
      <div>
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Recursos de Emergencia
        </h3>
        <div className="space-y-2">
          {resources.map(r => (
            <div key={r.name} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Phone size={14} style={{ color: 'var(--gold)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
              <p className="text-xs font-mono" style={{ color: 'var(--gold)' }}>{r.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational */}
      <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)' }}>
        <p className="text-sm italic" style={{ color: 'var(--gold)' }}>
          "O homem que encontra um meio de ganhar, por menor que seja, começa a construir a sua fortuna."
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          - O Homem Mais Rico da Babilonia
        </p>
      </div>
    </div>
  );
}
