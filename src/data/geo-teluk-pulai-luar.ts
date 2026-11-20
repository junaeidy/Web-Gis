// GeoJSON Polygon Batas Wilayah Administrasi Desa Teluk Pulai Luar, Kec. Kualuh Leidong
export const TELUK_PULAI_LUAR_BOUNDARY: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Desa Teluk Pulai Luar',
        kecamatan: 'Kualuh Leidong',
        kabupaten: 'Labuhanbatu Utara',
        provinsi: 'Sumatera Utara',
        kode_kemendagri: '12.23.02.2003',
        luas_km2: 52.79,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [99.9320, 2.6820],
            [99.9360, 2.7050],
            [99.9480, 2.7180],
            [99.9650, 2.7120],
            [99.9690, 2.6950],
            [99.9590, 2.6780],
            [99.9450, 2.6720],
            [99.9350, 2.6750],
            [99.9320, 2.6820],
          ],
        ],
      },
    },
  ],
};

export const VILLAGE_CENTER: [number, number] = [2.6914, 99.9463];
