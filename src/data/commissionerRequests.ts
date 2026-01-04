export type CommissionerDocumentKey =
  | 'sportPassport'
  | 'medicalCertificate'
  | 'antidopingCharter'
  | 'identityCard'
  | 'trackingConsent'
  | 'motivationLetter'

export type CommissionerDocumentStatus = 'validated' | 'review' | 'rejected'

export type CommissionerDocument = {
  key: CommissionerDocumentKey
  filename: string
  status: CommissionerDocumentStatus
}

export type CommissionerRequest = {
  id: number
  user: string
  role: string
  documents: CommissionerDocument[]
}

export const commissionerRequests: CommissionerRequest[] = [
  {
    id: 1,
    user: 'Alex Martin',
    role: 'SPORTIF',
    documents: [
      { key: 'sportPassport', filename: 'passeport_sportif_alex.pdf', status: 'review' },
      { key: 'medicalCertificate', filename: 'certificat_medical_alex.pdf', status: 'review' },
      { key: 'antidopingCharter', filename: 'charte_antidopage_alex.pdf', status: 'review' },
      { key: 'identityCard', filename: 'carte_identite_alex.pdf', status: 'review' },
      { key: 'trackingConsent', filename: 'accord_tracabilite_alex.pdf', status: 'review' },
    ],
  },
  {
    id: 2,
    user: 'Sofia Lambert',
    role: 'SPORTIF',
    documents: [
      { key: 'sportPassport', filename: 'passeport_sportif_sofia.pdf', status: 'review' },
      { key: 'medicalCertificate', filename: 'certificat_medical_sofia.pdf', status: 'review' },
      { key: 'antidopingCharter', filename: 'charte_antidopage_sofia.pdf', status: 'review' },
      { key: 'identityCard', filename: 'carte_identite_sofia.pdf', status: 'review' },
      { key: 'trackingConsent', filename: 'accord_tracabilite_sofia.pdf', status: 'review' },
    ],
  },
  {
    id: 3,
    user: 'Nadia Perez',
    role: 'VOLONTAIRE',
    documents: [
      { key: 'identityCard', filename: 'carte_identite_nadia.pdf', status: 'review' },
      { key: 'motivationLetter', filename: 'lettre_motivation_nadia.pdf', status: 'review' },
    ],
  },
  {
    id: 4,
    user: 'Lucas Bernard',
    role: 'VOLONTAIRE',
    documents: [
      { key: 'identityCard', filename: 'carte_identite_lucas.pdf', status: 'review' },
      { key: 'motivationLetter', filename: 'lettre_motivation_lucas.pdf', status: 'review' },
    ],
  },
]
