import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Farms from './Farms';
import { api } from '../api';
import { searchPlaces } from '../geocode';

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

vi.mock('../geocode', () => ({
  searchPlaces: vi.fn(),
}));

describe('Farms page - location search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('findLocationFillsCoordinates', async () => {
    searchPlaces.mockResolvedValue([
      { label: 'Pimpalgaon, Niphad, Nashik, Maharashtra, India', lat: 20.07, lon: 73.98 },
      { label: 'Pimpalgaon Baswant, Maharashtra, India', lat: 20.1, lon: 73.95 }
    ]);
    api.get.mockResolvedValue({ data: [] });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );

    await screen.findByText('No farms yet.');

    await user.type(screen.getByLabelText('Village'), 'Pimpalgaon');
    await user.type(screen.getByLabelText('District'), 'Nashik');
    await user.click(screen.getByRole('button', { name: 'Find location' }));

    expect(searchPlaces).toHaveBeenCalledWith({
      country: '',
      state: '',
      district: 'Nashik',
      taluka: '',
      village: 'Pimpalgaon'
    });

    const resultButton = screen.getByRole('button', { name: 'Pimpalgaon, Niphad, Nashik, Maharashtra, India' });
    await user.click(resultButton);

    expect(screen.getByLabelText('Latitude')).toHaveValue(20.07);
    expect(screen.getByLabelText('Longitude')).toHaveValue(73.98);
  });

  it('showsMessageWhenNothingFound', async () => {
    searchPlaces.mockResolvedValue([]);
    api.get.mockResolvedValue({ data: [] });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );

    await screen.findByText('No farms yet.');

    await user.type(screen.getByLabelText('Village'), 'Nowhere');
    await user.click(screen.getByRole('button', { name: 'Find location' }));

    expect(await screen.findByText(/No place found/)).toBeInTheDocument();
  });

  it('asksForAtLeastOneField', async () => {
    api.get.mockResolvedValue({ data: [] });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );

    await screen.findByText('No farms yet.');

    await user.click(screen.getByRole('button', { name: 'Find location' }));

    expect(await screen.findByText(/Enter at least a village, district or state/)).toBeInTheDocument();
    expect(searchPlaces).not.toHaveBeenCalled();
  });

  it('showsErrorWhenSearchFails', async () => {
    searchPlaces.mockRejectedValue(new Error('Search failed'));
    api.get.mockResolvedValue({ data: [] });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );

    await screen.findByText('No farms yet.');

    await user.type(screen.getByLabelText('Village'), 'X');
    await user.click(screen.getByRole('button', { name: 'Find location' }));

    expect(await screen.findByText(/Could not search places/)).toBeInTheDocument();
  });

  it('sendsLocationFieldsWithTheFarm', async () => {
    searchPlaces.mockResolvedValue([
      { label: 'Pimpalgaon, Niphad, Nashik, Maharashtra, India', lat: 20.07, lon: 73.98 }
    ]);
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({
      data: {
        id: 'f9',
        name: 'My Farm',
        lat: 18.52,
        lon: 73.85,
        areaHa: 2.5,
        soilType: 'Loam',
        storedWaterLitres: 0,
        groundwaterLitres: 0,
        country: 'India',
        state: 'Maharashtra',
        district: 'Nashik',
        taluka: 'Niphad',
        village: 'Pimpalgaon'
      }
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    );

    await screen.findByText('No farms yet.');

    await user.type(screen.getByLabelText('Country'), 'India');
    await user.type(screen.getByLabelText('State'), 'Maharashtra');
    await user.type(screen.getByLabelText('District'), 'Nashik');
    await user.type(screen.getByLabelText('Taluka'), 'Niphad');
    await user.type(screen.getByLabelText('Village'), 'Pimpalgaon');
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
      country: 'India',
      state: 'Maharashtra',
      district: 'Nashik',
      taluka: 'Niphad',
      village: 'Pimpalgaon'
    });
  });
});