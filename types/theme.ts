export type ThemeType = 'light' | 'dark';

interface ThemeColors {
  background: string;
  card: string;
  cardAlt: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  border: string;
  statusBar: 'light-content' | 'dark-content';
  indicators: {
    income: {
      text: string;
      background: string;
    };
    expense: {
      text: string;
      background: string;
    };
  };
}

export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    background: '#f8fafc', // slate-50
    card: '#ffffff',
    cardAlt: '#f1f5f9', // slate-100
    text: {
      primary: '#1e293b', // slate-800
      secondary: '#64748b', // slate-500
      accent: '#2563eb', // blue-600
    },
    border: '#e2e8f0', // slate-200
    statusBar: 'dark-content',
    indicators: {
      income: {
        text: '#22c55e',
        background: '#dcfce7',
      },
      expense: {
        text: '#ef4444',
        background: '#fee2e2',
      },
    },
  },
  dark: {
    background: '#0f172a', // slate-900
    card: '#1e293b', // slate-800
    cardAlt: '#334155', // slate-700
    text: {
      primary: '#f8fafc', // slate-50
      secondary: '#94a3b8', // slate-400
      accent: '#60a5fa', // blue-400
    },
    border: '#334155', // slate-700
    statusBar: 'light-content',
    indicators: {
      income: {
        text: '#4ade80',
        background: '#22c55e20',
      },
      expense: {
        text: '#f87171',
        background: '#ef444420',
      },
    },
  },
}; 