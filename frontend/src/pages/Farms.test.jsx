import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Farms from './Farms';
import { api } from '../api';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock('../components/FarmMap', () => ({
  default: ({ onPick }) => (
    <button type="button" onClick={() => onPick(18.52, 73.85)}>
      Pick location
    </button>
  ),
}));

describe('Farms page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('showsEmptyState', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );
    expect(screen.getByText('Loading farms...')).toBeInTheDocument();
    expect(await screen.findByText('No farms yet.')).toBeInTheDocument();
  });

  it('rendersFarmsFromApi', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { id: 'f1', name: 'North Field', areaHa: 2, lat: 10, lon: 20, soilType: 'Loam', storedWaterLitres: 0, groundwaterLitres: 0 },
        { id: 'f2', name: 'South Field', areaHa: 3, lat: 11, lon: 21, soilType: 'Sandy', storedWaterLitres: 0, groundwaterLitres: 0 },
      ],
    });
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );
    expect(await screen.findByText('North Field')).toBeInTheDocument();
    expect(screen.getByText('South Field')).toBeInTheDocument();
    expect(screen.getByText('2 ha')).toBeInTheDocument();
    expect(screen.getByText('3 ha')).toBeInTheDocument();
  });

  it('mapPickFillsCoordinates', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );
    await screen.findByText('No farms yet.');
    const pickBtn = screen.getByRole('button', { name: 'Pick location' });
    fireEvent.click(pickBtn);

    expect(screen.getByLabelText('Latitude')).toHaveValue(18.52);
    expect(screen.getByLabelText('Longitude')).toHaveValue(73.85);
  });

  it('createsAFarm', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockResolvedValueOnce({
      data: {
        id: 'f9',
        name: 'My Farm',
        lat: 18.52,
        lon: 73.85,
        areaHa: 2.5,
        soilType: 'Loam',
        storedWaterLitres: 0,
        groundwaterLitres: 0,
      },
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );

    await screen.findByText('No farms yet.');

    await user.type(screen.getByLabelText('Name'), 'My Farm');
    await user.click(screen.getByRole('button', { name: 'Pick location' }));
    await user.type(screen.getByLabelText('Area (ha)'), '2.5');

    await user.click(screen.getByRole('button', { name: 'Add farm' }));

    expect(api.post).toHaveBeenCalledWith('/api/farms', {
      name: 'My Farm',
      lat: 18.52,
      lon: 73.85,
      areaHa: 2.5,
      soilType: 'Loam',
      storedWaterLitres: 0,
      groundwaterLitres: 0,
    });

    expect(await screen.findByText('My Farm')).toBeInTheDocument();
  });

  it('deletesAFarm', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 'f1',
          name: 'North Field',
          areaHa: 2,
          lat: 10,
          lon: 20,
          soilType: 'Loam',
          storedWaterLitres: 0,
          groundwaterLitres: 0,
        },
      ],
    });
    api.delete.mockResolvedValueOnce({});

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );

    expect(await screen.findByText('North Field')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteBtn);

    expect(api.delete).toHaveBeenCalledWith('/api/farms/f1');
    await waitFor(() => {
      expect(screen.queryByText('North Field')).not.toBeInTheDocument();
    });
  });
});
