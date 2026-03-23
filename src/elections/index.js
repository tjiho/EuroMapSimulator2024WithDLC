import municipales2026T2 from './Municipales2026T2.js'
import municipales2026T1 from './Municipales2026T1.js'
import europeennes2024 from './Europeennes2024.js'

export const elections = [
  municipales2026T2,
  municipales2026T1,
  europeennes2024,
]

export const electionsParNom = Object.fromEntries(
  elections.map(e => [e.nom, e])
)
