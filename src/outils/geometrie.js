export function centroide(geoShape) {
  const geometry = geoShape.geometry || geoShape
  const ring = geometry.type === 'MultiPolygon'
    ? geometry.coordinates[0][0]
    : geometry.coordinates[0]
  let lonSum = 0, latSum = 0
  for (const [lon, lat] of ring) {
    lonSum += lon
    latSum += lat
  }
  return { lon: lonSum / ring.length, lat: latSum / ring.length }
}

export function padBureauDeVote(nom) {
  const match = nom.match(/^(\d+)([A-Za-z]?)$/)
  if (!match) return nom
  const [, chiffres, suffixe] = match
  const num = parseInt(chiffres, 10)
  return suffixe
    ? String(num).padStart(3, '0') + suffixe
    : String(num).padStart(4, '0')
}
