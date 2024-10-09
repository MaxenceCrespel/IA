import React, { useState } from 'react';
import { generateText } from './OpenAI';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';
import axios from 'axios';
import { useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
const fakeDatabase = {
  matches: [
    {
      type: 'past',
      equipeA: 'Avion Futsal',
      equipeB: 'Kingherseim FC',
      lieu: 'Salle Blezel',
      date: '10/09/2024',
      heure: '17:00',
      club: 'Avion Futsal',
      score: '5 - 2',
      league: 1,
      events: "",
      stat: "",
    },
    {
      type: 'current',
      equipeA: 'Goal Futsal Club',
      equipeB: 'Avion Futsal',
      lieu: 'SALLE JEANNE TROUILLET',
      date: '30/09/2024',
      heure: '19:00',
      club: 'Avion Futsal',
      score: '3 - 1',
      league: 1,
      events: "",
      stat: "",
    },
    {
      type: 'upcoming',
      equipeA: 'Avion Futsal',
      equipeB: 'Toulon Elite Futsal',
      lieu: 'Salle Blezel',
      date: '12/10/2024',
      heure: '20:00',
      club: 'Avion Futsal',
      score: '',
      league: 1,
      events: '',
      stat: "",
    }
  ],
  classement: [
    [
      { position: 1, equipe: 'Avion Futsal', points: 25, league: "Ligue 1" },
      { position: 2, equipe: 'Toulon Elite Futsal', points: 24, league: "Ligue 1" },
      { position: 3, equipe: 'Goal Futsal Club', points: 23, league: "Ligue 1" },
      { position: 4, equipe: 'Kingherseim FC', points: 15, league: "test" },
      { position: 5, equipe: 'Herouville Futsal', points: 10, league: "test" }
    ]
  ],
  club: {
    name: "Lille",
    lieu: "Salle Blezel",
    couleur: "rouge et blanc",
  },
  league: new Map<number, string>()
};

const contentTypes = [
  {
    id: 1,
    label: 'Annonce Match',
    prompt: 'En tant que responsable de la communication de {clubName}, rédige une annonce passionnante pour le match à venir entre {equipeA} et {equipeB}. Mentionne le lieu à {lieu} à {heure} le {date}, et utilise un ton engageant pour motiver les supporters à venir encourager leur équipe. Prends en compte la position de {equipeA} est en {positionA} position avec {pointsA} et {equipeB}, qui est en {positionB} position avec {pointsB} points. Une victoire vaut 3 points, un match nul 1 point et une défaite 0 points. Les couleurs de {clubName} sont {clubColors}. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram.'
  },
  {
    id: 2,
    label: "Score en Direct",
    prompt: "En tant que responsable de la communication de {clubName}, écris un message percutant en fonction de la tournure du match pour {clubName} afin d'annoncer le score en direct du match entre {equipeA} et {equipeB}. Actuellement, le score est de {score}. {clubName} {matchStatus}. Mentionne également le dernier but marqué : {lastGoal}. Mets en avant la position de {equipeA}, qui est en {positionA} position avec {pointsA} points, et {equipeB}, qui est en {positionB} position avec {pointsB} points. Utilise un ton énergique pour captiver l'auditoire ! Adapte le texte en fonction de si {clubName} est en train de gagner ou de perdre. Une victoire vaut 3 points, un match nul 1 point et une défaite 0 points. Les couleurs de {clubName} sont {clubColors}. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram."
  },
  {
    id: 3,
    label: 'Repas d\'Avant Match',
    prompt: 'Rédige une annonce engageante pour un repas d\'avant match qui se déroulera à {lieu} avant le match entre {equipeA} et {equipeB}. Incite les membres et supporters à se joindre à nous pour partager un moment convivial et faire le plein d\'énergie avant le match. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram.'
  },
  {
    id: 4,
    label: 'Journée Porte Ouverte',
    prompt: 'Rédige un message chaleureux et invitant pour encourager les supporters et les nouveaux membres à participer à notre journée porte ouverte au club. Explique ce qui les attend et pourquoi c\'est une excellente occasion de découvrir le club et ses activités. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram.'
  },
  {
    id: 5,
    label: 'Programme du Mois',
    prompt: 'Crée un programme détaillé du mois présentant tous les matchs de {club}. Inclue les dates, les heures et les équipes adverses, tout en ajoutant un commentaire engageant pour chaque événement afin d’inciter les supporters à assister. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram.'
  },
  {
    id: 6,
    label: 'Campagne d\'Abonnement',
    prompt: 'Écris un message accrocheur et convaincant pour inciter les supporters à s\'abonner ou se réabonner. Mets en avant les avantages exclusifs réservés aux abonnés et encourage-les à rejoindre notre communauté passionnée. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram.'
  },
  {
    id: 7,
    label: 'Assemblée Générale',
    prompt: 'Rédige une annonce claire et informative pour l\'assemblée générale du club. Mentionne la date, l\'heure et le lieu, tout en soulignant l\'importance de la participation des membres pour discuter des futurs projets du club. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram.'
  },
  {
    id: 8,
    label: 'Bus des Supporters',
    prompt: 'Annonce la mise en place d\'un bus pour les supporters se rendant au match entre {equipeA} et {equipeB}. Détaille les horaires, le point de départ, et encourage les supporters à réserver leur place pour se rendre au match ensemble. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram.'
  },
  {
    id: 9,
    label: 'Débrief du Match',
    prompt: 'En tant que responsable de la communication de {clubName},rédige un débrief complet du dernier match {equipeA} contre {equipeB} avec un score de {score}. Discute du classement de {clubName} avec les statistiques ci-après: le classement est comme suit {equipeA} est à la {positionA} avec {pointsA} points position et {equipeB} est à la {positionB} avec {pointsB} points . Inclue des statistiques clés dans {statistiques}, les évènements {events} du match  et des commentaires sur les performances des joueurs. Les couleurs du club sont {clubColors}. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram. '
  },
  {
    id: 10,
    label: 'Classement',
    prompt: 'En tant que responsable de la communication de {club}, Écris un message informatif sur son classement actuel: {classement}. Les couleurs du club sont {clubColors}. Fais 3 propositions, une pour X, une pour Facebook et une pour instagram dans lesquelles tu intègreras le classement dans le message.'
  }
];

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState(contentTypes[0]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const parseDateDDMMYYYY = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleGenerateText = async () => {
    setLoading(true);
    setError(null);

    let prompt = selectedContentType.prompt;

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
    let repr_class = "";
    if (selectedContentType.id === 9) {

      let matches = fakeDatabase.matches.filter(elt => elt.type === "past").sort((a, b) => {
        const dateA = parseDateDDMMYYYY(a.date);
        const dateB = parseDateDDMMYYYY(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      const lastMatch = matches[matches.length - 1];
      if (match) {
        match.date = lastMatch.date;
        match.equipeA = lastMatch.equipeA;
        match.equipeB = lastMatch.equipeB;
        match.heure = lastMatch.equipeB;
        match.lieu = lastMatch.lieu;
        match.score = lastMatch.score;
        match.type = lastMatch.type;
        match.league = lastMatch.league;
        match.stat = lastMatch.stat;
        match.events = lastMatch.events;
      }

    }
    else if (selectedContentType.id === 10) {
      let club_classmnt: any[] = [];
      for (let elt in fakeDatabase.classement) {
        if (fakeDatabase.classement[elt].length > 0) {
          for (let rang of fakeDatabase.classement[elt]) {
            if (rang.equipe === fakeDatabase.club.name) club_classmnt.push(rang);
          }
        }
      }
      console.log("ranking", club_classmnt);

      for (let c of club_classmnt) {
        let r = String("Dans la " + fakeDatabase.league.get(Number(c.league)) + ",l'équipe " + c.equipe + " est à la " + c.position + " avec " + c.points + "\n")
        repr_class += r;
      }
    }


    if (match) {
      let classment: any[] = [];

      for (let elt in fakeDatabase.classement) {
        if (fakeDatabase.classement[elt].length > 0) {
          if (match.league === Number(fakeDatabase.classement[elt][0].league)) classment = fakeDatabase.classement[elt];
        }
      }

      const pointsA = classment.find(equipe => equipe.equipe === match.equipeA)?.points || 0;
      const pointsB = classment.find(equipe => equipe.equipe === match.equipeB)?.points || 0;

      const positionA = classment.findIndex(equipe => equipe.equipe === match.equipeA) + 1;
      const positionB = classment.findIndex(equipe => equipe.equipe === match.equipeB) + 1;

      const [scoreA, scoreB] = match.score.split(' - ').map(Number);
      const clubScore = match.club === match.equipeA ? scoreA : scoreB;
      const opponentScore = match.club === match.equipeA ? scoreB : scoreA;

      console.log(match.events);
      const lastGoalEvent = match.events
        .split('.')
        .filter(event => event.toLowerCase().includes('goal') || event.toLowerCase().includes('penalty') && !event.toLowerCase().includes('confirmed'))
        .pop();
      console.log("dernier but: ", lastGoalEvent);
      let goalAnnouncement = '';
      if (lastGoalEvent) {
        if (lastGoalEvent.includes(match.club)) {
          goalAnnouncement = `⚽️ GOOOAAALLLL pour ${match.club} ! ${lastGoalEvent}`;
        } else {
          goalAnnouncement = `⚽️ Aïe... But pour ${match.equipeB} ! ${lastGoalEvent}`;
        }
      }
      console.log(goalAnnouncement);

      let matchStatus = '';
      if (clubScore > opponentScore) {
        matchStatus = 'est actuellement en train de gagner !';
      } else if (clubScore < opponentScore) {
        matchStatus = 'est actuellement en train de perdre...';
      } else {
        matchStatus = 'est à égalité.';
      }
      let positions: Record<string, string> = {}
      for (let elt in classment) {
        if (classment[elt].equipe === match.equipeA) positions["equipeA"] = String(classment[elt].position);
        else if (classment[elt].equipe === match.equipeB) positions["equipeB"] = String(classment[elt].position);
      }
      prompt = prompt
        .replace(/{score}/g, match.score || 'N/A')
        .replace(/{equipeA}/g, match.equipeA)
        .replace(/{equipeB}/g, match.equipeB)
        .replace(/{pointsA}/g, pointsA.toString())
        .replace(/{pointsB}/g, pointsB.toString())
        .replace(/{positionA}/g, positionA.toString())
        .replace(/{positionB}/g, positionB.toString())
        .replace(/{lieu}/g, match.lieu)
        .replace(/{date}/g, match.date)
        .replace(/{heure}/g, match.heure)
        .replace(/{clubName}/g, match.club)
        .replace(/clubColors/g, fakeDatabase.club.couleur)
        .replace(/{matchStatus}/g, matchStatus)
        .replace(/{positionA}/g, positions.equipeA)
        .replace(/{positionB}/g, positions.equipeB)
        .replace(/{statistiques}/g, match.stat)
        .replace(/{events}/g, match.events)
        .replace(/{lastGoal}/g, goalAnnouncement || 'Pas de but pour l\'instant.')
    }
    console.log("classement", repr_class);
    prompt = prompt
      .replace(/{classement}/g, repr_class)
      .replace(/{club}/g, fakeDatabase.club.name)
      .replace(/clubColors/g, fakeDatabase.club.couleur)
    console.log("prompt", prompt)

    console.log(prompt);

    try {
      const generatedText = await generateText(prompt);
      setText(generatedText);
    } catch (err) {
      setError('Erreur lors de la génération du texte.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeagueData = async (id: string) => {
    const options = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/standings',
      params: {
        league: id,
        season: '2024'
      },
      headers: {
        'x-rapidapi-key': '8cfde1e9b0msh5ab936b883095bep1a8bc8jsn087d9cdcaa15',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      return response.data.response[0].league;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const fetchFixtureDataById = async (id: any) => {
    const options = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
      params: { id: id },
      headers: {
        'x-rapidapi-key': '8cfde1e9b0msh5ab936b883095bep1a8bc8jsn087d9cdcaa15',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    };
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error: any) {
      console.error('Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const fetchTeamData = async () => {
    const options = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/teams',
      params: { id: '79' },
      headers: {
        'x-rapidapi-key': '8cfde1e9b0msh5ab936b883095bep1a8bc8jsn087d9cdcaa15',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      return response.data.response[0].team.name;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'équipe:', error);
    }
  };
  let data: any[] = []

  function checkEventStatus(dateString: string): string {
    const eventDate = new Date(dateString);
    const now = new Date();

    const difference = eventDate.getTime() - now.getTime();
    const ninetyMinutesInMilliseconds = 90 * 60 * 1000;

    if (difference < -ninetyMinutesInMilliseconds) {
      return "past";
    } else if (difference >= -ninetyMinutesInMilliseconds && difference <= 0) {
      return "current";
    } else {
      return "upcoming";
    }
  }

  const fetchFixtureData = async () => {
    const options = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
      params: {
        season: '2024',
        team: '79'
      },
      headers: {
        'x-rapidapi-key': '8cfde1e9b0msh5ab936b883095bep1a8bc8jsn087d9cdcaa15',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    };

    try {
      const team = await fetchTeamData();
      const response = await axios.request(options);
      const datas = response.data.response;
      for (const elt in datas) {
        const fixtureData = await fetchFixtureDataById(datas[elt].fixture.id);
        let events = fixtureData.response[0].events;
        let evts = [];
        for (let event of events) {
          let evenement: Record<string, string> = {};
          evenement["type"] = event.detail;
          evenement["team"] = event.team.name;
          evenement["player"] = event.player.name;
          evenement["time"] = event.time.elapsed;
          evts.push(evenement);
        }
        let evenement_str = ""
        for (let elt of evts) {
          let str = String("Le joueur " + elt.player + " de l'équipe " + elt.team + " a fait un " + elt.type + " à la " + elt.time + "ème de minutes.")
          evenement_str += str;
        }
        let stat = fixtureData.response[0].statistics;
        console.log("avnt_push")
        let resume_stat = "";
        let stats = [];
        if (stat.length > 0) {
          for (let s of stat) {
            let repr = String("La statistique de l'équipe " + s.team.name + " pendant le match:\n ")
            if (s.statistics.length > 0) {
              for (let sta of s.statistics) {
                repr += String(sta.type + " a pour valeur " + String(sta.value) + "\n")
              }
            }
            resume_stat += repr;
          }
        } else resume_stat = " Il n'y a aucune statistique enregistrée";
        let tmp: Record<string, string> = {};
        const date = datas[elt].fixture.date;
        const dateObj = new Date(date);
        tmp["date"] = `${dateObj.getUTCDate().toString().padStart(2, '0')}/${(dateObj.getUTCMonth() + 1).toString().padStart(2, '0')}/${dateObj.getUTCFullYear()}`;
        tmp["heure"] = `${dateObj.getUTCHours().toString().padStart(2, '0')}:${dateObj.getUTCMinutes().toString().padStart(2, '0')}`;
        tmp["type"] = checkEventStatus(date);
        tmp["equipeA"] = datas[elt].teams.home.name;
        tmp["equipeB"] = datas[elt].teams.away.name;
        tmp["score"] = String(datas[elt].goals.home) + " - " + String(datas[elt].goals.away);
        tmp["lieu"] = datas[elt].fixture.venue.name;
        tmp["club"] = team;
        tmp["league"] = datas[elt].league.id;
        tmp["events"] = evenement_str;
        tmp["stat"] = resume_stat;
        data.push(tmp);
        fakeDatabase.league.set(datas[elt].league.id, datas[elt].league.name);
      }
      fakeDatabase.matches = data;
      let classes: any[] = [];
      const leagues = Array.from(fakeDatabase.league.entries());
      for (const value of leagues) {
        const classement = await fetchLeagueData(String(value[0]));
        let ranking: any[] = [];
        if (classement) {
          for (let elt of classement.standings[0]) {
            let tmp: Record<string, string> = {};
            tmp["position"] = elt.rank;
            tmp["equipe"] = elt.team.name;
            tmp["points"] = elt.points;
            tmp["league"] = classement.id;
            ranking.push(tmp);
          }
        }
        classes.push(ranking);
      }

      fakeDatabase.classement = classes;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'équipe:', error);
    }
  };

  const [classement, setClassement] = useState<any>(null);
  useEffect(() => {
    const fetchClassement = async () => {
      try {
        const response = await axios.get('http://localhost:5000/classement');
        setClassement(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du classement', error);
      }
    };

    fetchClassement();
    fetchFixtureData(); // Vous devez définir cette fonction ailleurs.
  }, []);

  // Utilisation d'un autre useEffect pour afficher le classement une fois mis à jour
  useEffect(() => {
    if (classement) {
      console.log(classement);
    }
  }, [classement]);

  const qrCodeUrl = 'https://app.sfeira.com/abonnement/1727162185';

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

      {/* <div style={{ marginTop: '20px' }}>
        <label htmlFor="image-upload">Ajouter une image :</label>
        <input type="file" id="image-upload" onChange={handleImageUpload} />
      </div> */}

      <button onClick={handleGenerateText} disabled={loading} style={{ marginTop: '20px' }}>
        {loading ? 'Génération en cours...' : 'Générer le texte'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '20px' }}>
        <h2>Texte généré :</h2>
        <div style={{ whiteSpace: 'pre-line' }}>
          {text}
        </div>
        {/* {imagePreview && (
          <div style={{ marginTop: '10px' }}>
            <h3>Image incluse :</h3>
            <img src={imagePreview} alt="Image pour le partage" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        )} */}
      </div>
      <QRCodeCanvas value={qrCodeUrl} size={256} level={"H"} />

      <h2>Classement Futsal National D1</h2>

      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Équipe</th>
            <th>Points</th>
            <th>Matchs joués</th>
            <th>Matchs gagnés</th>
            <th>Matchs nuls</th>
            <th>Matchs perdus</th>
            <th>Buts Marqués</th>
            <th>Buts Contre</th>
            <th>Différence de Buts</th>
          </tr>
        </thead>
        <tbody>
          {classement && classement.map((equipe: any, index: any) => {
            return (
              <tr key={index}>
                <td className="text-center">{equipe.position}</td>
                <td className="text-center">{equipe.equipe}</td>
                <td className="text-center">{equipe.points}</td>
                <td className="text-center">{equipe.jeux}</td>
                <td className="text-center">{equipe.gagnés}</td>
                <td className="text-center">{equipe.nuls}</td>
                <td className="text-center">{equipe.perdus}</td>
                <td className="text-center">{equipe.p}</td>
                <td className="text-center">{equipe.c}</td>
                <td className="text-center">{equipe.diff}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default App;