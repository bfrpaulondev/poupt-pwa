import { useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { Coins, Play, Gift, Star, Shield, CreditCard, MessageCircle, Palette, Check } from 'lucide-react';

const shopItems = [
  { id: 'coach_question', label: '1 Pergunta ao Coach', cost: 100, icon: MessageCircle, desc: 'Faz uma pergunta extra ao teu AI Coach' },
  { id: 'ocr_scan', label: 'Scanner OCR', cost: 50, icon: CreditCard, desc: 'Digitaliza um recibo automaticamente' },
  { id: 'weekly_report', label: 'Relatorio Semanal', cost: 30, icon: Star, desc: 'Relatorio detalhado da semana' },
  { id: 'creditor_template', label: 'Template Credor', cost: 10, icon: Shield, desc: 'Modelo de mensagem para credores' },
  { id: 'premium_theme', label: 'Tema Premium', cost: 200, icon: Palette, desc: 'Desbloqueia um tema exclusivo' },
];

export default function MoedasStore() {
  const { user, updateUser } = useStore();
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [purchasing, setPurchasing] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleWatchAd = async () => {
    setWatchingAd(true);
    setAdProgress(0);

    const interval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    setTimeout(async () => {
      clearInterval(interval);
      try {
        const res = await api.earnMoedas('watch_ad');
        updateUser({ poupMoedas: res.data.balance });
        setSuccess(`+${res.data.earned} PoupMoedas!`);
        setTimeout(() => setSuccess(null), 2000);
      } catch (err) {
        console.error(err);
      }
      setWatchingAd(false);
      setAdProgress(0);
    }, 3500);
  };

  const handleSpend = async (item) => {
    setPurchasing(item.id);
    try {
      const res = await api.spendMoedas(item.id);
      updateUser({ poupMoedas: res.data.balance });
      setSuccess(`${item.label} desbloqueado!`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setSuccess(err.message);
      setTimeout(() => setSuccess(null), 3000);
    }
    setPurchasing(null);
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Balance Card */}
      <div className="gold-gradient p-6 rounded-2xl text-center">
        <Coins size={32} className="mx-auto mb-2 text-white" />
        <p className="text-3xl font-bold text-white">{user?.poupMoedas || 0}</p>
        <p className="text-sm text-white/80">PoupMoedas</p>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="p-3 rounded-xl text-sm font-medium text-center animate-fade-in"
          style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
          {success}
        </div>
      )}

      {/* Watch Ad */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Play size={20} style={{ color: 'var(--gold)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Ver Anuncio</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ganha 50 PoupMoedas por anuncio</p>
          </div>
        </div>
        {watchingAd ? (
          <div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full gold-gradient transition-all"
                style={{ width: `${adProgress}%` }} />
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
              A ver anuncio...
            </p>
          </div>
        ) : (
          <button onClick={handleWatchAd}
            className="w-full py-3 rounded-xl text-sm font-bold text-white gold-gradient">
            Ver Anuncio (+50 moedas)
          </button>
        )}
      </div>

      {/* Shop */}
      <div>
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Loja
        </h3>
        <div className="space-y-2">
          {shopItems.map(item => {
            const canAfford = (user?.poupMoedas || 0) >= item.cost;
            return (
              <div key={item.id} className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(212,160,23,0.15)' }}>
                  <item.icon size={18} style={{ color: 'var(--gold)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
                <button onClick={() => handleSpend(item)} disabled={!canAfford || purchasing === item.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                  style={{
                    background: canAfford ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                    color: canAfford ? 'var(--gold)' : 'var(--text-muted)',
                    border: canAfford ? '1px solid var(--gold)' : '1px solid var(--border)'
                  }}>
                  <Coins size={12} /> {item.cost}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
