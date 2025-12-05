export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: 'green' | 'yellow' | 'red'): string {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status] || colors.red;
}

export function getStatusBadgeColor(status: 'green' | 'yellow' | 'red'): string {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };
  return colors[status] || colors.red;
}

export function calculateYearsMonths(years: number): { years: number; months: number } {
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  return { years: wholeYears, months };
}
