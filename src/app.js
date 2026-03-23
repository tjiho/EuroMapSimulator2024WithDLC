import carte from './singletons/carte.js'
import donnees from './singletons/donnees.js'
import { electionsParNom } from './elections/index.js'
import { surChangementElection, surChangementMode, electionParDefaut, modeParDefaut } from './composants/selecteurs.js'
import { masquerPanneau, afficherPanneau } from './composants/panneau.js'
import { creerToutesLesZones, supprimerToutesLesZones } from './visualisations/zone.js'
import { creerMarqueurCamembert, creerMarqueurPoint, creerMarqueurMelange } from './visualisations/marqueurs.js'
import { agregerLesVoix } from './outils/geometrie.js'

let marqueurs = []
let electionActuelle = electionParDefaut()
let modeActuel = modeParDefaut()

async function chargerEtAfficher() {
  supprimerLesMarqueurs()
  const election = electionsParNom[electionActuelle]
  const indexFusionne = await donnees.charger(election)
  afficherLesDonnees(indexFusionne, election, modeActuel)
}

function supprimerLesMarqueurs() {
  for (const m of marqueurs) m.remove()
  marqueurs = []
  supprimerToutesLesZones()
}

function afficherLesDonnees(indexFusionne, election, mode) {
  if (mode === 'zone') {
    creerToutesLesZones(indexFusionne, election)
    return
  }

  for (const { coordonnees, bureaux } of Object.values(indexFusionne)) {
    try {
      const creerMarqueur = mode === 'point'
        ? creerMarqueurPoint
        : mode === 'melange'
          ? creerMarqueurMelange
          : creerMarqueurCamembert

      const resultatsAgreges = agregerLesVoix(bureaux)
      const element = creerMarqueur(resultatsAgreges, election.couleurs)

      element.addEventListener('click', (e) => {
        e.stopPropagation()
        afficherPanneau(bureaux, election)
      })

      const marqueur = new maplibregl.Marker({ element })
        .setLngLat(coordonnees)
        .addTo(carte)
      marqueurs.push(marqueur)
    } catch (error) {
      console.warn('Marqueur ignoré :', error)
    }
  }
}

let derniereTaille = 0
function mettreAJourTailleMarqueurs() {
  const zoom = carte.getZoom()
  const zoomBorne = Math.max(12, Math.min(15, zoom))
  const taille = Math.round(16 + ((zoomBorne - 12) * (50 - 16)) / 3)
  if (taille === derniereTaille) return
  derniereTaille = taille
  document.documentElement.style.setProperty('--taille-marqueur', taille + 'px')
}

carte.on('load', () => {
  mettreAJourTailleMarqueurs()
  chargerEtAfficher()
})

carte.on('zoom', mettreAJourTailleMarqueurs)
carte.on('click', masquerPanneau)

surChangementElection((nom) => {
  electionActuelle = nom
  chargerEtAfficher()
})

surChangementMode((mode) => {
  modeActuel = mode
  chargerEtAfficher()
})
