const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

async function getClassement() {
  console.log('Démarrage de Puppeteer...'); // Indique que Puppeteer démarre
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Aller sur la page du classement
  console.log('Accès à la page du classement...'); // Indique que le navigateur va à la page
  await page.goto('https://www.dna.fr/sport/classement/futsal/national-d1', {
    waitUntil: 'networkidle2',
  });

  console.log('Page chargée. Début du scraping des données...'); // Indique que la page est chargée

  // Scraper les données du classement général
  const classementGeneral = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.rankingGeneral tbody tr'));
    return rows.map(row => {
      const columns = row.querySelectorAll('td');
      // Vérifiez que la ligne a suffisamment de colonnes
      if (columns.length >= 8) {
        const points = columns[0].innerText.trim();
        const jeux = columns[1].innerText.trim();
        const gagnés = columns[2].innerText.trim();
        const nuls = columns[3].innerText.trim();
        const perdus = columns[4].innerText.trim();
        const p = columns[5].innerText.trim();
        const c = columns[6].innerText.trim();
        const diff = columns[7].innerText.trim();
        
        return { points, jeux, gagnés, nuls, perdus, p, c, diff };
      }
      return null; // Si la ligne n'a pas les bonnes colonnes, retourner null
    }).filter(Boolean); // Filtrer les lignes nulles
  });

  // Scraper les données du classement global
  const classementGlobal = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.rankingGlobal tbody tr'));
    return rows.map(row => {
      const position = row.querySelector('td.tr b').innerText.trim();
      const equipe = row.querySelector('td.tl a').innerText.trim();
      const url = row.querySelector('td.tl a').href; // Lien vers l'équipe
      return { position, equipe, url };
    }).filter(Boolean); // Filtrer les lignes nulles
  });

  console.log('Données récupérées - Classement Général :', classementGeneral); // Affiche les données récupérées
  console.log('Données récupérées - Classement Global :', classementGlobal); // Affiche les données récupérées

  await browser.close();
  console.log('Puppeteer fermé.'); // Indique que Puppeteer se ferme
  return { classementGeneral, classementGlobal }; // Retourne les deux classements
}

app.get('/classement', async (req, res) => {
  console.log('Requête reçue sur /classement'); // Indique qu'une requête a été reçue
  try {
    const classement = await getClassement();
    res.json(classement);
    console.log('Réponse envoyée :', classement); // Affiche la réponse envoyée
  } catch (error) {
    console.error('Erreur lors du scraping :', error); // Affiche l'erreur en cas de problème
    res.status(500).send('Erreur lors du scraping');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`); // Indique que le serveur fonctionne
});
