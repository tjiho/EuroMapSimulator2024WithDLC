import { fusionnerParCoordonnees } from '../outils/geometrie.js'

class Donnees {
  #cache = new Map()

  async charger(election) {
    if (this.#cache.has(election)) return this.#cache.get(election)

    const [resultatsJson, geometrieJson] = await Promise.all([
      this.#recupererJson(election.fichierResultats),
      this.#recupererJson(election.fichierGeometrie),
    ])

    const indexParBureau = election.indexerParBureauDeVote(resultatsJson)
    election.augmenterAvecGeometrie(indexParBureau, geometrieJson)
    const indexFusionne = fusionnerParCoordonnees(indexParBureau)

    this.#cache.set(election, indexFusionne)
    return indexFusionne
  }

  obtenir(election) {
    return this.#cache.get(election) || null
  }

  async #recupererJson(url) {
    const res = await fetch(url)
    return res.json()
  }
}

const donnees = new Donnees()
export default donnees
