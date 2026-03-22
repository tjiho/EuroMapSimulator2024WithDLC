import { creerMarqueurCamembert, creerMarqueurPoint, creerMarqueurMelange } from './marqueurs.js'
import { afficherPanneau } from './panneau.js'
import { creerToutesLesZones, supprimerToutesLesZones } from './zone.js'

let marqueurs = []
const cache = {}

export async function chargerElection(map, election, mode = 'zone') {
    supprimerLesMarqueurs(map)

    const cle = election.fichierResultats
    if (!cache[cle]) {
        const [donnees, donneesGeometrique] = await Promise.all([
            recupererJson(election.fichierResultats),
            recupererJson(election.fichierGeometrie)
        ])
        const indexParBureauDeVote = indexerParBureauDeVote(donnees, election)
        augmenterLesResultatsAvecLesDonneesGeometrique(indexParBureauDeVote, donneesGeometrique)
        cache[cle] = fusionnerParCoordonnees(indexParBureauDeVote)
    }

    afficherLesDonnees(map, cache[cle], election, mode)
}

export function supprimerLesMarqueurs(map) {
    for (const marqueur of marqueurs) {
        marqueur.remove()
    }
    marqueurs = []
    supprimerToutesLesZones(map)
}

async function recupererJson(url) {
    const res = await fetch(url)
    return await res.json()
}

function indexerParBureauDeVote(donneesDesBureauxDeVote, election) {
    const bureauxDeVote = {}
    for (const bureauDeVote of donneesDesBureauxDeVote) {
        bureauxDeVote[bureauDeVote["column_7"]] = {
            resultats: traiterLesResultatsParListe(bureauDeVote, election)
        }
    }
    return bureauxDeVote
}

// Les colonnes du CSV : les voix du candidat i sont dans column_(i*2 + 20)
function traiterLesResultatsParListe(donneesDUnBureau, election) {
    const resultats = {}
    for (let i = 0; i < election.nomDesListes.length; i += 1) {
        const nomDeLaListe = election.nomDesListes[i]
        const nombreDeVoix = donneesDUnBureau[`column_${i * 2 + 20}`]
        resultats[nomDeLaListe] = nombreDeVoix
    }
    return Object.entries(resultats).sort((a, b) => b[1] - a[1])
}

function centroide(geoShape) {
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

function augmenterLesResultatsAvecLesDonneesGeometrique(resultats, geometrie) {
    for (const lieu of geometrie) {
        if (lieu.bureaux) {
            const centre = lieu.geo_shape ? centroide(lieu.geo_shape) : lieu.geo_point_2d
            for (const nomDeBureauDeVote of lieu.bureaux) {
                const cle = padBureauDeVote(nomDeBureauDeVote)
                if (resultats[cle]){
                    resultats[cle].geometrie = centre
                    resultats[cle].shape = lieu.geo_shape
                }
            }
        } else if (lieu.bureau) {
            const centre = lieu.geo_shape ? centroide(lieu.geo_shape) : lieu.geo_point_2d
            const cle = padBureauDeVote(lieu.bureau)
            if (resultats[cle]) {
                resultats[cle].geometrie = centre
                resultats[cle].shape = lieu.geo_shape
            }
        }

    }
}

function padBureauDeVote(nom) {
    return nom.length === 3 ? "0" + nom : nom
}

function fusionnerParCoordonnees(indexParBureauDeVote) {
    const indexFusionne = {}
    for (const [nomDeBureauDeVote, donneesDuBureauDeVote] of Object.entries(indexParBureauDeVote)) {
        const geo = donneesDuBureauDeVote['geometrie']
        const cle = geo ? `${geo['lon']}-${geo['lat']}` : "0-0"
        const forme = donneesDuBureauDeVote['shape']
        if (!indexFusionne[cle]) {
            indexFusionne[cle] = { coordonnees: geo, shape: forme, bureaux: {} }
        }
        indexFusionne[cle].bureaux[nomDeBureauDeVote] = donneesDuBureauDeVote
    }
    return indexFusionne
}

function agregerLesVoix(bureaux) {
    const totaux = {}
    for (const donnees of Object.values(bureaux)) {
        for (const [liste, voix] of donnees.resultats) {
            totaux[liste] = (totaux[liste] || 0) + voix
        }
    }
    return Object.entries(totaux).sort((a, b) => b[1] - a[1])
}

function afficherLesDonnees(map, indexFusionneParCoordonnees, election, mode) {
    if (mode === 'zone') {
        creerToutesLesZones(map, indexFusionneParCoordonnees, election)
        return
    }

    for (const { coordonnees, bureaux } of Object.values(indexFusionneParCoordonnees)) {
        try {
            const creerMarqueur = mode === 'point' ? creerMarqueurPoint
                : mode === 'melange' ? creerMarqueurMelange
                : creerMarqueurCamembert
            const resultatsAgreges = agregerLesVoix(bureaux)
            const element = creerMarqueur(resultatsAgreges, election.couleurs)

            element.addEventListener('click', (e) => {
                e.stopPropagation()
                afficherPanneau(bureaux, election.couleurs)
            })

            const marqueur = new maplibregl.Marker({ element })
                .setLngLat(coordonnees)
                .addTo(map)
            marqueurs.push(marqueur)
        } catch (error) {
            console.warn("Marqueur ignoré :", error)
        }
    }
}
