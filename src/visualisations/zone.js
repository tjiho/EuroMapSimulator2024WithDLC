import carte from '../singletons/carte.js'
import { afficherPanneau } from '../composants/panneau.js'

let donneesParZone = {}
let idSurvole = null
let handleMousemove = null
let handleMouseleave = null
let handleClick = null

export function creerToutesLesZones(indexFusionne, election) {
  const features = []
  donneesParZone = {}
  let id = 0

  for (const { shape, bureaux } of Object.values(indexFusionne)) {
    if (!shape) continue

    const premierBureau = Object.values(bureaux)[0]
    const couleur = election.couleurDuBureau(premierBureau.resultats)
    const opaciteBase = election.opaciteDuBureau(premierBureau.resultats)
    const geometry = shape.geometry || shape
    const abstention = premierBureau['inscrits'] - premierBureau['votant']
  
    features.push({
      type: 'Feature',
      id,
      geometry,
      properties: { couleur, opaciteBase },
    })

    donneesParZone[id] = { bureaux, election }
    id++
  }

  const featureCollection = { type: 'FeatureCollection', features }

  carte.addSource('zones-source', { type: 'geojson', data: featureCollection })

  carte.addLayer({
    id: 'zones-fill',
    type: 'fill',
    source: 'zones-source',
    paint: {
      'fill-color': ['get', 'couleur'],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'survol'], false],
        1,
        ['get', 'opaciteBase'],
      ],
    },
  })

  carte.addLayer({
    id: 'zones-outline',
    type: 'line',
    source: 'zones-source',
    paint: {
      'line-color': '#000',
      'line-width': 1,
    },
  })

  handleMousemove = (e) => {
    if (e.features.length === 0) return
    carte.getCanvas().style.cursor = 'pointer'
    const nouvelId = e.features[0].id

    if (idSurvole !== null && idSurvole !== nouvelId) {
      carte.setFeatureState({ source: 'zones-source', id: idSurvole }, { survol: false })
    }

    idSurvole = nouvelId
    carte.setFeatureState({ source: 'zones-source', id: idSurvole }, { survol: true })
  }

  handleMouseleave = () => {
    carte.getCanvas().style.cursor = ''
    if (idSurvole !== null) {
      carte.setFeatureState({ source: 'zones-source', id: idSurvole }, { survol: false })
      idSurvole = null
    }
  }

  handleClick = (e) => {
    if (e.features.length === 0) return
    const featureId = e.features[0].id
    const donnees = donneesParZone[featureId]
    if (donnees) {
      afficherPanneau(donnees.bureaux, donnees.election)
    }
  }

  carte.on('mousemove', 'zones-fill', handleMousemove)
  carte.on('mouseleave', 'zones-fill', handleMouseleave)
  carte.on('click', 'zones-fill', handleClick)
}

export function supprimerToutesLesZones() {
  if (handleMousemove) carte.off('mousemove', 'zones-fill', handleMousemove)
  if (handleMouseleave) carte.off('mouseleave', 'zones-fill', handleMouseleave)
  if (handleClick) carte.off('click', 'zones-fill', handleClick)

  if (carte.getLayer('zones-fill')) carte.removeLayer('zones-fill')
  if (carte.getLayer('zones-outline')) carte.removeLayer('zones-outline')
  if (carte.getSource('zones-source')) carte.removeSource('zones-source')

  donneesParZone = {}
  idSurvole = null
  handleMousemove = null
  handleMouseleave = null
  handleClick = null
}
