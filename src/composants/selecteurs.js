import { elections } from '../elections/index.js'

const elElection = document.getElementById('election-select')
const elMode = document.getElementById('mode-select')

for (const election of elections) {
  const option = document.createElement('option')
  option.value = election.nom
  option.textContent = election.nom
  elElection.appendChild(option)
}

export function surChangementElection(callback) {
  elElection.addEventListener('change', (e) => callback(e.target.value))
}

export function surChangementMode(callback) {
  elMode.addEventListener('change', (e) => callback(e.target.value))
}

export function electionParDefaut() {
  return elections[0].nom
}

export function modeParDefaut() {
  return 'zone'
}
