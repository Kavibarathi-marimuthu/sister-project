export const mockDiseaseResult = {
  detected: true,
  disease: {
    name: 'பாக்டீரியா இலை கருகல்',
    nameEn: 'Bacterial Leaf Blight (BLB)',
    pathogen: 'Xanthomonas oryzae pv. oryzae',
    severity: 'medium',
    confidence: 89,
    affectedArea: '35%',
    description: 'இலைகளின் நுனியில் தொடங்கி மஞ்சள் நிற வரைகள் பரவுகின்றன. தண்ணீர் தேங்கிய இடங்களில் அதிகமாக பரவும்.',
    descriptionEn: 'Yellow lesions starting from leaf tips spreading inward. Spreads rapidly in waterlogged conditions.',
  },
  treatment: {
    immediate: [
      'தாக்கப்பட்ட இலைகளை உடனடியாக அகற்றுங்கள்',
      'வயலில் தண்ணீர் தேங்காமல் பார்த்துக்கொள்ளுங்கள்',
      'Copper oxychloride 3 கிராம்/லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்',
    ],
    immediateEn: [
      'Remove and destroy affected leaves immediately',
      'Ensure proper drainage to avoid waterlogging',
      'Spray Copper oxychloride 3g/L water',
    ],
    followUp: 'Streptocycline 200 ppm + Copper oxychloride 3g/L கலவையை 7 நாட்கள் இடைவெளியில் 2 முறை தெளிக்கவும்.',
    followUpEn: 'Spray Streptocycline 200 ppm + Copper oxychloride 3g/L mixture twice at 7-day intervals.',
    prevention: 'நோய் எதிர்ப்பு திறன் மிகுந்த நெல் ரகங்கள் (CO 47, BPT 5204) பயன்படுத்தவும்.',
    preventionEn: 'Use BLB-resistant rice varieties (CO 47, BPT 5204).',
  },
  nearbyOutbreaks: [
    { location: 'கோடியக்கரை', distance: '12 கி.மீ', severity: 'high' },
    { location: 'முத்துப்பேட்டை', distance: '18 கி.மீ', severity: 'medium' },
  ],
}

export const mockDiseaseHistory = [
  { id: 'dh1', date: '2024-01-15', crop: 'நெல்', disease: 'BLB', severity: 'medium', treated: true, image: '📷' },
  { id: 'dh2', date: '2023-11-02', crop: 'தக்காளி', disease: 'Early Blight', severity: 'low', treated: true, image: '📷' },
  { id: 'dh3', date: '2023-09-20', crop: 'வாழை', disease: 'Panama Wilt', severity: 'high', treated: false, image: '📷' },
]
