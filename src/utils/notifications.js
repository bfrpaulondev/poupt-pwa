export const notificationTypes = {
  divida_vencida: 'Dívida vencida',
  pagamento_proximo: 'Pagamento próximo',
  meta_atingida: 'Meta atingida',
  transicao_modo: 'Transição de modo',
  streak_quebrado: 'Sequência quebrada',
  conquista: 'Conquista',
  lembrete_poupanca: 'Lembrete de poupança',
  divida_informal: 'Dívida informal',
  relatorio_semanal: 'Relatório semanal',
  dica_coach: 'Dica do Coach',
  sistema: 'Sistema',
};

export const notificationPriorities = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const getNotificationLabel = (type) => notificationTypes[type] || notificationTypes.sistema;
export const getNotificationPriorityLabel = (priority) => notificationPriorities[priority] || notificationPriorities.media;

export const sortNotificationsByPriority = (notifications = []) => {
  const priorityWeight = { critica: 4, alta: 3, media: 2, baixa: 1 };
  return [...notifications].sort((a, b) => {
    const priorityDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
};
