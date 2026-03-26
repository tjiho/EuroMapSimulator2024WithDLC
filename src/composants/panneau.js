import { COULEUR_AUTRES } from "../outils/couleurs.js";
import { html, render } from "../../libs/preact.mjs";
import { elections } from '../elections/index.js'

const elPanneau = document.getElementById("panneau");

export function afficherPanneau(nomDuBureau, electionActuelle) {
  render(
    html`<${Panneau} nomDuBureau=${nomDuBureau} electionActuelle=${electionActuelle}/>`,
    elPanneau,
  );

  elPanneau.style.display = "block";
}

export function masquerPanneau() {
  elPanneau.style.display = "none";
}

function Panneau({ nomDuBureau, electionActuelle }) {
  return html`
    <aside>
      <h1>Bureau ${nomDuBureau}</h1>
      ${elections.map(election => html`<${ElectionResultats} nomDuBureau=${nomDuBureau} election=${election} electionActuelle=${electionActuelle}/>`)}
    </aside>
  `;
}

function ElectionResultats({ nomDuBureau, election, electionActuelle }) {
  const donnees = election.donnees[nomDuBureau];
  if (!donnees) return null
  const participation = ((donnees.votants) / donnees.inscrits * 100).toFixed(2)
  return html`
    <details ref=${el => el && (el.open = election.nom === electionActuelle)}>
      <summary>${election.nom}</summary>
      <div class="participation"><span class="participation__label">Participation:</span> <span class="participation__number">${participation}%</span></div>
      <div class="resultats">
        ${donnees.resultats.map(
          (res) => html`
            <${Resultats}
              candidat=${res[0]}
              nombreDeVoix=${res[1]}
              total=${donnees.votants}
              couleur=${election.couleurs[res[0]]}
            />
          `,
        )}

        <${Resultats}
          candidat="Blancs et Nuls"
          nombreDeVoix=${donnees.blanc + donnees.nul}
          total=${donnees.votants}
          couleur=${COULEUR_AUTRES}
        />
      </div>
    </details>
  `;
}

function Resultats({ candidat, nombreDeVoix, total, couleur }) {
  return html`
    <section class="line-resultat">
      <h3>${candidat}</h3>

      <progress
        class="resultat__progress"
        value=${nombreDeVoix}
        max=${total}
        style=${{ accentColor: couleur }}
      />
      <span class="resultat__percentage"
        >${((nombreDeVoix / total) * 100).toFixed(2)}%</span
      >
      <span class="resultat__number">${nombreDeVoix}</span>
    </section>
  `;
}
