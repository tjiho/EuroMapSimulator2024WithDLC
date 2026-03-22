import { afficherPanneau } from './panneau.js'

let donneesParZone = {}
let idSurvole = null
let handleMousemove = null
let handleMouseleave = null
let handleClick = null

export function creerToutesLesZones(map, indexFusionne, election) {
    const features = []
    donneesParZone = {}
    let id = 0

    for (const { shape, bureaux } of Object.values(indexFusionne)) {
        if (!shape) continue

        const premierBureau = Object.values(bureaux)[0]
        const couleur = election.couleurs[premierBureau.resultats[0][0]]
        const totalVoix = premierBureau.resultats.reduce((total, res) => total + res[1], 0)
        const opaciteBase = premierBureau.resultats[0][1] / totalVoix

        const geometry = shape.geometry || shape

        features.push({
            type: 'Feature',
            id,
            geometry,
            properties: { couleur, opaciteBase }
        })

        donneesParZone[id] = { bureaux, couleurs: election.couleurs }
        id++
    }

    const featureCollection = { type: 'FeatureCollection', features }

    map.addSource('zones-source', { type: 'geojson', data: featureCollection })

    map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'zones-source',
        paint: {
            'fill-color': ['get', 'couleur'],
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'survol'], false],
                1,
                ['get', 'opaciteBase']
            ]
        }
    })

    map.addLayer({
        id: 'zones-outline',
        type: 'line',
        source: 'zones-source',
        paint: {
            'line-color': '#000',
            'line-width': 1
        }
    })

    handleMousemove = (e) => {
        if (e.features.length === 0) return
        map.getCanvas().style.cursor = 'pointer'
        const nouvelId = e.features[0].id

        if (idSurvole !== null && idSurvole !== nouvelId) {
            map.setFeatureState({ source: 'zones-source', id: idSurvole }, { survol: false })
        }

        idSurvole = nouvelId
        map.setFeatureState({ source: 'zones-source', id: idSurvole }, { survol: true })
    }

    handleMouseleave = () => {
        map.getCanvas().style.cursor = ''
        if (idSurvole !== null) {
            map.setFeatureState({ source: 'zones-source', id: idSurvole }, { survol: false })
            idSurvole = null
        }
    }

    handleClick = (e) => {
        if (e.features.length === 0) return
        const featureId = e.features[0].id
        const donnees = donneesParZone[featureId]
        if (donnees) {
            afficherPanneau(donnees.bureaux, donnees.couleurs)
        }
    }

    map.on('mousemove', 'zones-fill', handleMousemove)
    map.on('mouseleave', 'zones-fill', handleMouseleave)
    map.on('click', 'zones-fill', handleClick)
}

export function supprimerToutesLesZones(map) {
    if (handleMousemove) map.off('mousemove', 'zones-fill', handleMousemove)
    if (handleMouseleave) map.off('mouseleave', 'zones-fill', handleMouseleave)
    if (handleClick) map.off('click', 'zones-fill', handleClick)

    if (map.getLayer('zones-fill')) map.removeLayer('zones-fill')
    if (map.getLayer('zones-outline')) map.removeLayer('zones-outline')
    if (map.getSource('zones-source')) map.removeSource('zones-source')

    donneesParZone = {}
    idSurvole = null
    handleMousemove = null
    handleMouseleave = null
    handleClick = null
}
