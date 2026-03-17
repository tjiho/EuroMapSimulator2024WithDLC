import { COULEUR_AUTRES } from './const/couleurs.js'

const elPanneau = document.getElementById('panneau')
const elTitre = document.getElementById('panneau-titre')
const elContenu = document.getElementById('panneau-contenu')

export function afficherPanneau(bureaux, couleurs) {
    elContenu.innerHTML = ''

    const entries = Object.entries(bureaux)

    elTitre.textContent = entries.length === 1
        ? `Bureau ${entries[0][0]}`
        : `${entries.length} bureaux de vote`

    for (const [nomDeBureauDeVote, donnees] of entries) {
        const section = document.createElement('div')
        section.className = 'panneau-bureau'

        if (entries.length > 1) {
            const h3 = document.createElement('h3')
            h3.textContent = `Bureau ${nomDeBureauDeVote}`
            section.appendChild(h3)
        }

        for (const [nom, voix] of donnees.resultats) {
            const ligne = document.createElement('div')
            ligne.className = 'panneau-ligne'

            const carre = document.createElement('span')
            carre.className = 'panneau-carre'
            carre.style.backgroundColor = couleurs[nom] || COULEUR_AUTRES

            const texte = document.createElement('span')
            texte.textContent = `${nom} : ${voix}`

            ligne.appendChild(carre)
            ligne.appendChild(texte)
            section.appendChild(ligne)
        }

        elContenu.appendChild(section)
    }

    elPanneau.style.display = 'block'
}

export function masquerPanneau() {
    elPanneau.style.display = 'none'
}
