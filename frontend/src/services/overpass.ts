export async function buscarFarmacias(
  latitude: number,
  longitude: number
) {
  const query = `
    [out:json];
    (
      node["amenity"="pharmacy"](around:5000,${latitude},${longitude});
      way["amenity"="pharmacy"](around:5000,${latitude},${longitude});
      relation["amenity"="pharmacy"](around:5000,${latitude},${longitude});
    );
    out center;
  `;

  const response = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      body: query,
    }
  );

  return await response.json();
}