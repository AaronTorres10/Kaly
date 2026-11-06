export const SEED_PROFILE_IDS = {
  host: '11111111-1111-4111-8111-111111111111',
  guest: '22222222-2222-4222-8222-222222222222',
};

export const SEED_COUNTS = {
  profiles: 2,
  listings: 3,
  images: 2,
  availability: 4,
  reservations: 0,
};

export const EXAMPLE_PROFILES = [
  {
    id: SEED_PROFILE_IDS.host,
    fullName: 'Mara Solís',
    avatarUrl: null,
  },
  {
    id: SEED_PROFILE_IDS.guest,
    fullName: 'Leo Navarro',
    avatarUrl: null,
  },
];

export const EXAMPLE_LISTINGS = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    hostProfileId: SEED_PROFILE_IDS.host,
    title: 'Casa Brisa',
    description: 'Una casa luminosa con terraza y vistas abiertas.',
    location: 'Valle de Bravo',
    latitude: 19.1922,
    longitude: -100.131,
    pricePerNight: 12500,
    capacity: 4,
    amenities: ['wifi', 'terraza', 'cocina'],
    images: [
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        sourceUrl:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
        license: 'Unsplash License',
        attribution: 'Foto de Hutomo Abrianto en Unsplash',
        position: 0,
      },
      {
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        sourceUrl:
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
        license: 'Unsplash License',
        attribution: 'Foto de Hutomo Abrianto en Unsplash',
        position: 1,
      },
    ],
    availability: [
      { id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', date: '2027-05-10', isAvailable: true },
      { id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', date: '2027-05-11', isAvailable: true },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab',
    hostProfileId: SEED_PROFILE_IDS.host,
    title: 'Estudio Niebla',
    description: 'Un estudio tranquilo para una escapada sencilla.',
    location: 'Tepoztlán',
    latitude: 18.9847,
    longitude: -99.0931,
    pricePerNight: 7800,
    capacity: 2,
    amenities: ['wifi'],
    images: [],
    availability: [
      { id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', date: '2027-06-01', isAvailable: true },
      { id: '10101010-1010-4010-8010-101010101010', date: '2027-06-02', isAvailable: true },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac',
    hostProfileId: SEED_PROFILE_IDS.host,
    title: 'Refugio Silente',
    description: 'Un refugio publicado a la espera de configurar su calendario.',
    location: 'Mazamitla',
    latitude: 19.9161,
    longitude: -103.0206,
    pricePerNight: 9900,
    capacity: 3,
    amenities: ['chimenea'],
    images: [],
    availability: [],
  },
];
