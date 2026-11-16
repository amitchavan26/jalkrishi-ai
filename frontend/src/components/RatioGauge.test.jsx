import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RatioGauge from './RatioGauge';

describe('RatioGauge', () => {
  it('hasAccessibleLabel', () => {
    render(<RatioGauge ratio={0.65} />);
    expect(screen.getByRole('img', { name: 'Ratio gauge 0.65' })).toBeInTheDocument();
  });

  it('handlesOutOfRangeValues', () => {
    const { unmount } = render(<RatioGauge ratio={3} />);
    expect(screen.getByRole('img', { name: 'Ratio gauge 3.00' })).toBeInTheDocument();
    unmount();

    render(<RatioGauge ratio={0} />);
    expect(screen.getByRole('img', { name: 'Ratio gauge 0.00' })).toBeInTheDocument();
  });
});