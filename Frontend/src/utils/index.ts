// Utility functions for the PLAY11 application

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const calculateTimeRemaining = (targetDate: string | Date): string => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return 'Expired';
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const getPlayerPositionColor = (position: string): string => {
  const colors = {
    GK: 'bg-yellow-100 text-yellow-800',
    DEF: 'bg-blue-100 text-blue-800',
    MID: 'bg-green-100 text-green-800',
    FWD: 'bg-red-100 text-red-800',
  };
  return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const calculateWinPercentage = (won: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((won / total) * 100);
};

export const generateTeamCode = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getMatchStatus = (startTime: string): 'upcoming' | 'live' | 'completed' => {
  const now = new Date();
  const matchStart = new Date(startTime);
  const matchEnd = new Date(matchStart.getTime() + 90 * 60 * 1000); // 90 minutes match
  
  if (now < matchStart) {
    return 'upcoming';
  } else if (now >= matchStart && now <= matchEnd) {
    return 'live';
  } else {
    return 'completed';
  }
};

export const sortPlayers = (players: any[], sortBy: 'name' | 'points' | 'credits', order: 'asc' | 'desc' = 'asc') => {
  return [...players].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'points':
        comparison = a.points - b.points;
        break;
      case 'credits':
        comparison = a.credits - b.credits;
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

export const getFormattedMatchTime = (dateString: string): { date: string; time: string } => {
  const date = new Date(dateString);
  
  return {
    date: date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };
};