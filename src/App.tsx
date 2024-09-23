import React, { useState } from 'react';
import { generateText } from './OpenAI';

// Exemple de fausse base de données pour le Club de Futsal d'Avion
const fakeDatabase = {
  matches: [
    {
      type: 'past',
      equipeA: 'Club de Futsal d\'Avion',
      equipeB: 'Kingherseim FC',
      lieu: 'Salle de Futsal d\'Avion',
      heure: '17:00',
      club: 'Club de Futsal d\'Avion',
      score: '5 - 2',
    },
    {
      type: 'current',
      equipeA: 'Club de Futsal d\'Avion',
      equipeB: 'Goal Futsal Club',
      lieu: 'Salle de Futsal d\'Avion',
      heure: '19:00',
      club: 'Club de Futsal d\'Avion',
      score: '3 - 1', // Score actuel
    },
    {
      type: 'upcoming',
      equipeA: 'Club de Futsal d\'Avion',
      equipeB: 'Toulon Elite Futsal',
      lieu: 'Salle de Futsal d\'Avion',
      heure: '20:00',
      club: 'Club de Futsal d\'Avion',
      score: '',
    }
  ],
  classement: [
    { position: 1, equipe: 'Club de Futsal d\'Avion', points: 25 },
    { position: 2, equipe: 'Toulon Elite Futsal', points: 20 },
    { position: 3, equipe: 'Goal Futsal Club', points: 18 },
    { position: 4, equipe: 'Kingherseim FC', points: 15 },
    { position: 5, equipe: 'Herouville Futsal', points: 10 },
  ],
  club: {
    name: "Avion Futsal",
    lieu: "Salle Blezel"
  }
};

// Liste des types de contenu
const contentTypes = [
  {
    id: 1,
    label: 'Annonce Match',
    prompt: 'En tant que responsable de la communication du Club de Futsal d\'Avion, rédige une annonce passionnante pour le match à venir entre {equipeA} et {equipeB}. Mentionne le lieu à {lieu} à {heure}, et utilise un ton engageant pour motiver les supporters à venir encourager leur équipe.'
  },
  {
    id: 2,
    label: 'Score en Direct',
    prompt: 'Écris un message percutant pour annoncer le score en direct du match entre {equipeA} et {equipeB}. Actuellement, le score est de {score}. Mets en avant la position de {equipeA}, qui est en {positionA} position avec {pointsA} points, et {equipeB}, qui est en {positionB} position avec {pointsB} points. Utilise un ton énergique pour captiver l\'auditoire!'
  },
  {
    id: 3,
    label: 'Repas d\'Avant Match',
    prompt: 'Rédige une annonce engageante pour un repas d\'avant match qui se déroulera à {lieu} avant le match entre {equipeA} et {equipeB}. Incite les membres et supporters à se joindre à nous pour partager un moment convivial et faire le plein d\'énergie avant le match.'
  },
  {
    id: 4,
    label: 'Journée Porte Ouverte',
    prompt: 'Rédige un message chaleureux et invitant pour encourager les supporters et les nouveaux membres à participer à notre journée porte ouverte au club. Explique ce qui les attend et pourquoi c\'est une excellente occasion de découvrir le club et ses activités.'
  },
  {
    id: 5,
    label: 'Programme du Mois',
    prompt: 'Crée un programme détaillé du mois présentant tous les matchs de {club}. Inclue les dates, les heures et les équipes adverses, tout en ajoutant un commentaire engageant pour chaque événement afin d’inciter les supporters à assister.'
  },
  {
    id: 6,
    label: 'Campagne d\'Abonnement',
    prompt: 'Écris un message accrocheur et convaincant pour inciter les supporters à s\'abonner ou se réabonner. Mets en avant les avantages exclusifs réservés aux abonnés et encourage-les à rejoindre notre communauté passionnée.'
  },
  {
    id: 7,
    label: 'Assemblée Générale',
    prompt: 'Rédige une annonce claire et informative pour l\'assemblée générale du club. Mentionne la date, l\'heure et le lieu, tout en soulignant l\'importance de la participation des membres pour discuter des futurs projets du club.'
  },
  {
    id: 8,
    label: 'Bus des Supporters',
    prompt: 'Annonce la mise en place d\'un bus pour les supporters se rendant au match entre {equipeA} et {equipeB}. Détaille les horaires, le point de départ, et encourage les supporters à réserver leur place pour se rendre au match ensemble.'
  },
  {
    id: 9,
    label: 'Débrief du Match',
    prompt: 'Rédige un débrief complet du dernier match de {club}, où ils ont battu {equipeB} avec un score de {score}. Discute de la manière dont cette victoire a influencé le classement et a permis à {club} de maintenir sa position de leader avec {pointsA} points, tandis que {equipeB} est à {pointsB} points. Inclue des statistiques clés et des commentaires sur les performances des joueurs.'
  },
  {
    id: 10,
    label: 'Classement',
    prompt: 'Écris un message informatif sur le classement actuel des équipes de futsal, en mettant en avant comment les performances récentes des équipes, notamment celles de {club}, ont influencé leur position. Décris les matchs à venir qui pourraient affecter le classement et encourage les supporters à soutenir leur équipe pour maintenir ou améliorer sa position.'
  }
];

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState(contentTypes[0]);

  const handleGenerateText = async () => {
    setLoading(true);
    setError(null);

    let prompt = selectedContentType.prompt;

    // Cherche le match correspondant
    const match = fakeDatabase.matches.find(m => {
      if (selectedContentType.id === 1) return m.type === 'upcoming';
      if (selectedContentType.id === 2) return m.type === 'current';
      if (selectedContentType.id === 3) return m.type === 'upcoming';
      if (selectedContentType.id === 4) return m.type === 'upcoming';
      if (selectedContentType.id === 5) return m.type === 'upcoming';
      if (selectedContentType.id === 6) return m.type === 'upcoming';
      if (selectedContentType.id === 7) return m.type === 'upcoming';
      if (selectedContentType.id === 8) return m.type === 'past';
      if (selectedContentType.id === 9) return m.type === 'past';
      return false;
    });

    if (match) {
      // Obtenez les points des équipes
      const pointsA = fakeDatabase.classement.find(equipe => equipe.equipe === match.equipeA)?.points || 0;
      const pointsB = fakeDatabase.classement.find(equipe => equipe.equipe === match.equipeB)?.points || 0;

      // Obtenez les positions des équipes
      const positionA = fakeDatabase.classement.findIndex(equipe => equipe.equipe === match.equipeA) + 1;
      const positionB = fakeDatabase.classement.findIndex(equipe => equipe.equipe === match.equipeB) + 1;

      // Remplacez les valeurs dans le prompt
      prompt = prompt
        .replace(/{score}/g, match.score || 'N/A')
        .replace(/{equipeA}/g, match.equipeA)
        .replace(/{equipeB}/g, match.equipeB)
        .replace(/{pointsA}/g, pointsA.toString())
        .replace(/{pointsB}/g, pointsB.toString())
        .replace(/{positionA}/g, positionA.toString())
        .replace(/{positionB}/g, positionB.toString())
        .replace(/{lieu}/g, match.lieu)
        .replace(/{heure}/g, match.heure)
        .replace(/{club}/g, fakeDatabase.club.name);
    }

    try {
      const generatedText = await generateText(prompt);
      setText(generatedText);
    } catch (err) {
      setError('Erreur lors de la génération du texte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Générateur de Contenu</h1>

      <div>
        <label htmlFor="content-type-select">Choisissez un type de contenu :</label>
        <select
          id="content-type-select"
          value={selectedContentType.id}
          onChange={(e) => {
            const contentType = contentTypes.find(type => type.id === parseInt(e.target.value));
            if (contentType) {
              setSelectedContentType(contentType);
            }
          }}
        >
          {contentTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleGenerateText} disabled={loading}>
        {loading ? 'Génération en cours...' : 'Générer le texte'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginTop: '20px' }}>
        <h2>Texte généré :</h2>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default App;
