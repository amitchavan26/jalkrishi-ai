export function chartColors(theme) {
  const dark = theme === 'dark';
  return {
    text: dark ? '#9fb5ad' : '#475569',
    grid: dark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)',
    supply: dark ? '#34d399' : '#047857',
    demand: dark ? '#38bdf8' : '#0369a1',
    warn: dark ? '#fbbf24' : '#b45309',
    danger: dark ? '#fb7185' : '#be123c',
  };
}