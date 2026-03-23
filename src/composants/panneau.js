import { COULEUR_AUTRES } from '../outils/couleurs.js'
import { html, render } from '../../libs/preact.mjs'
const elPanneau = document.getElementById('panneau')
const elTitre = document.getElementById('panneau-titre')
const elContenu = document.getElementById('panneau-contenu')

export function afficherPanneau(bureaux, election) {
  render(
      html`<${Panneau} bureaux=${bureaux} election=${election}/>`,
      elPanneau
  );

  elPanneau.style.display = 'block'
}

export function masquerPanneau() {
  elPanneau.style.display = 'none'
}

function Panneau({bureaux, election}) {
  const bureauxNoms = Object.keys(bureaux)
  const titre = `Bureau ${bureauxNoms[0]}`
  const donnees = bureaux[bureauxNoms[0]]
  console.log(donnees)
  return html`
    <aside>
      <h1>${titre}</h1>
      ${donnees.resultats.map(res => html`
        <${Resultats} candidat=${res[0]} nombreDeVoix=${res[1]} total=${donnees['votants']} couleur=${election.couleurs[res[0]]}/>
      `)}
      
      <${Resultats} candidat="Blancs et Nuls" nombreDeVoix=${donnees['blanc'] + donnees['nul']} total=${donnees['votants']} couleur=${COULEUR_AUTRES}/>

    </aside>
  `

}

function Resultats({candidat, nombreDeVoix, total, couleur}) {
  return html`
    <section class="line-resultat">
      <h3>${candidat}</h3>
      <div class="line-resultat__res">
        <progress value=${nombreDeVoix} max=${total} style=${{ accentColor: couleur }}/>
        <span>${(nombreDeVoix / total * 100).toFixed(2)}%</span>
        <span>:</span>
        <span>${nombreDeVoix}</span>
      </div>
    </section>
  `
}