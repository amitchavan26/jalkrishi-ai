import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Alerts from './Alerts';
import * as api from '../api';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return { ...actual, api: { get: vi.fn() } };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Alerts', () => {
  it('shows empty state', async () => {
    api.api.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Alerts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No alerts. Your crops look safe.')).toBeInTheDocument();
    });
  });

  it('lists alerts with links', async () => {
    api.api.get.mockResolvedValue({
      data: [
        {
          assessmentId: 'a1',
          farmId: 'f1',
          cropId: 'c1',
          message: 'NOT_RECOMMENDED: water ratio is 0.40, driven by low effective rainfall.',
          createdAt: '2026-11-06T10:00:00Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <Alerts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('NOT_RECOMMENDED: water ratio is 0.40, driven by low effective rainfall.')).toBeInTheDocument();
    });

    const viewLink = screen.getByRole('link', { name: 'View result' });
    expect(viewLink).toHaveAttribute('href', '/assessments/a1');
  });
});