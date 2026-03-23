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
  return nom.length === 3 ? '0' + nom : nom
}

export function fusionnerParCoordonnees(indexParBureauDeVote) {
  const indexFusionne = {}
  for (const [nomDeBureauDeVote, donneesDuBureauDeVote] of Object.entries(indexParBureauDeVote)) {
    const geo = donneesDuBureauDeVote.geometrie
    const cle = geo ? `${geo.lon}-${geo.lat}` : '0-0'
    const forme = donneesDuBureauDeVote.shape
    if (!indexFusionne[cle]) {
      indexFusionne[cle] = { coordonnees: geo, shape: forme, bureaux: {} }
    }
    indexFusionne[cle].bureaux[nomDeBureauDeVote] = donneesDuBureauDeVote
  }
  return indexFusionne
}

export function agregerLesVoix(bureaux) {
  const totaux = {}
  for (const donnees of Object.values(bureaux)) {
    for (const [liste, voix] of donnees.resultats) {
      totaux[liste] = (totaux[liste] || 0) + voix
    }
  }
  return Object.entries(totaux).sort((a, b) => b[1] - a[1])
}
