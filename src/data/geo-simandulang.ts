// GeoJSON Polygon Batas Wilayah Administrasi Desa Simandulang, Kec. Kualuh Leidong, Kab. Labuhanbatu Utara
export const SIMANDULANG_BOUNDARY: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Desa Simandulang',
        kecamatan: 'Kualuh Leidong',
        kabupaten: 'Labuhanbatu Utara',
        provinsi: 'Sumatera Utara',
        kode_kemendagri: '12.23.02.2004',
        luas_km2: 48.65,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [99.9520, 2.8180],
            [99.9560, 2.8420],
            [99.9680, 2.8550],
            [99.9850, 2.8500],
            [99.9890, 2.8320],
            [99.9820, 2.8150],
            [99.9660, 2.8110],
            [99.9550, 2.8140],
            [99.9520, 2.8180],
          ],
        ],
      },
    },
  ],
};

// Titik Pusat Administrasi Desa Simandulang (Kec. Kualuh Leidong)
export const VILLAGE_CENTER: [number, number] = [2.8352, 99.9707];
