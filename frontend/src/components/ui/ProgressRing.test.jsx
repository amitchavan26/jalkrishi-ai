import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('labelsTheValue', () => {
    render(<ProgressRing value={72} label="Water health" />);
    expect(screen.getByRole('img', { name: 'Water health 72 percent' })).toBeInTheDocument();
  });

  test('clampsOutOfRangeValues', () => {
    // Test value 150
    const { unmount } = render(<ProgressRing value={150} label="Progress" />);
    expect(screen.getByRole('img', { name: 'Progress 100 percent' })).toBeInTheDocument();
    unmount();
    
    // Test value -5
    render(<ProgressRing value={-5} label="Progress" />);
    expect(screen.getByRole('img', { name: 'Progress 0 percent' })).toBeInTheDocument();
  });
});