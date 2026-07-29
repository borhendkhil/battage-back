const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'battage',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

app.post('/login', async (req, res) => {
  console.log('POST /login', req.body);
  const { username, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT * FROM utilisateurs WHERE username = ? AND password = ?',
      [username, password]
    );
    await conn.end();
    if (rows.length === 1) {
      res.json({ success: true, role: rows[0].role });
    } else {
      res.json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
  } catch (err) {
    console.error('Erreur SQL /login:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
});

// Route API pour récupérer les utilisateurs
app.get('/utilisateurs', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM utilisateurs');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /utilisateurs' });
  }
});

// Route API pour ajouter un utilisateur
app.post('/utilisateurs', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO utilisateurs (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /utilisateurs' });
  }
});

// Route API pour modifier un utilisateur
app.put('/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'UPDATE utilisateurs SET username = ?, password = ?, role = ? WHERE id = ?',
      [username, password, role, id]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /utilisateurs' });
  }
});

// Route API pour supprimer un utilisateur
app.delete('/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM utilisateurs WHERE id = ?', [id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /utilisateurs' });
  }
});

// Route API pour récupérer les agro_combinats
app.get('/agro-combinats', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM agro_combinats');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /agro-combinats' });
  }
});

// Route API pour supprimer un agro_combinat
app.delete('/agro-combinats/:COD_SOC', async (req, res) => {
  const { COD_SOC } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM agro_combinats WHERE COD_SOC = ?', [COD_SOC]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /agro-combinats' });
  }
});

// Route API pour ajouter un agro_combinat
app.post('/agro-combinats', async (req, res) => {
  const { COD_SOC, LIB_SOC } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO agro_combinats (COD_SOC, LIB_SOC) VALUES (?, ?)',
      [COD_SOC, LIB_SOC]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur POST /agro-combinats:', err); // Ajout du log détaillé
    res.status(500).json({ message: 'Erreur serveur /agro-combinats', error: err.message });
  }
});

// Route API pour modifier un agro_combinat
app.put('/agro-combinats/:COD_SOC', async (req, res) => {
  const { COD_SOC } = req.params;
  const { LIB_SOC } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'UPDATE agro_combinats SET LIB_SOC = ? WHERE COD_SOC = ?',
      [LIB_SOC, COD_SOC]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur PUT /agro-combinats:', err); // Ajout du log détaillé
    res.status(500).json({ message: 'Erreur serveur /agro-combinats', error: err.message });
  }
});

// Récupérer toutes les associations agro_cultures
app.get('/agro-cultures', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM agro_cultures');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /agro-cultures', error: err.message });
  }
});

// Ajouter une association agro_culture
app.post('/agro-cultures', async (req, res) => {
  const { COD_SOC, id_cereale, id_foin, id_legumineuse } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    if (id_cereale) {
      await conn.execute(
        'INSERT INTO agro_cultures (COD_SOC, id_cereale) VALUES (?, ?)',
        [COD_SOC, id_cereale]
      );
    }
    if (id_foin) {
      await conn.execute(
        'INSERT INTO agro_cultures (COD_SOC, id_foin) VALUES (?, ?)',
        [COD_SOC, id_foin]
      );
    }
    if (id_legumineuse) {
      await conn.execute(
        'INSERT INTO agro_cultures (COD_SOC, id_legumineuse) VALUES (?, ?)',
        [COD_SOC, id_legumineuse]
      );
    }
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /agro-cultures', error: err.message });
  }
});

// Supprimer toutes les cultures d'un agro
app.delete('/agro-cultures/:COD_SOC', async (req, res) => {
  const { COD_SOC } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM agro_cultures WHERE COD_SOC = ?', [COD_SOC]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /agro-cultures', error: err.message });
  }
});

// Route API pour récupérer toutes les parcelles ou celles d'un COD_SOC donné
app.get('/parcelles', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    let rows;
    if (req.query.COD_SOC) {
      [rows] = await conn.execute('SELECT * FROM parcelle WHERE COD_SOC = ?', [req.query.COD_SOC]);
    } else {
      [rows] = await conn.execute('SELECT * FROM parcelle');
    }
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /parcelles', error: err.message });
  }
});

// Route API pour ajouter une parcelle
app.post('/parcelles', async (req, res) => {
  const { COD_SOC, cod_par, lib_par, surface } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO parcelle (COD_SOC, cod_par, lib_par, surface) VALUES (?, ?, ?, ?)',
      [COD_SOC, cod_par, lib_par, surface]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /parcelles', error: err.message });
  }
});

// Route API pour modifier une parcelle
app.put('/parcelles/:COD_SOC/:cod_par', async (req, res) => {
  const { COD_SOC, cod_par } = req.params;
  const { lib_par, surface } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
      'UPDATE parcelle SET lib_par = ?, surface = ? WHERE COD_SOC = ? AND cod_par = ?',
      [lib_par, surface, COD_SOC, cod_par]
    );
    await conn.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Parcelle non trouvée' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /parcelles PUT', error: err.message });
  }
});

// API pour categorie_culture
app.get('/categorie-culture', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM categorie_culture');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /categorie-culture', error: err.message });
  }
});

app.post('/categorie-culture', async (req, res) => {
  const { libelle } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO categorie_culture (libelle) VALUES (?)',
      [libelle]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /categorie-culture', error: err.message });
  }
});

app.put('/categorie-culture/:id', async (req, res) => {
  const { id } = req.params;
  const { libelle } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'UPDATE categorie_culture SET libelle = ? WHERE id = ?',
      [libelle, id]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /categorie-culture', error: err.message });
  }
});

app.delete('/categorie-culture/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM categorie_culture WHERE id = ?', [id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /categorie-culture', error: err.message });
  }
});

// API pour type_culture
app.get('/type-culture', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM type_culture');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /type-culture', error: err.message });
  }
});

app.post('/type-culture', async (req, res) => {
  let { libelle, categorie_id } = req.body;
  try {
    // S'assurer que categorie_id est un entier ou null
    categorie_id = categorie_id ? parseInt(categorie_id, 10) : null;
    if (!libelle || !categorie_id) {
      return res.status(400).json({ message: 'libelle et categorie_id sont requis' });
    }
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO type_culture (libelle, categorie_id) VALUES (?, ?)',
      [libelle, categorie_id]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /type-culture', error: err.message });
  }
});

app.put('/type-culture/:id', async (req, res) => {
  const { id } = req.params;
  const { libelle, categorie_id } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'UPDATE type_culture SET libelle = ?, categorie_id = ? WHERE id = ?',
      [libelle, categorie_id, id]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /type-culture', error: err.message });
  }
});

app.delete('/type-culture/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM type_culture WHERE id = ?', [id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /type-culture', error: err.message });
  }
});

// Ajoutez les routes CRUD pour nature_culture
app.get('/nature-culture', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM nature_culture');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /nature-culture', error: err.message });
  }
});

app.post('/nature-culture', async (req, res) => {
  const { libelle } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('INSERT INTO nature_culture (libelle) VALUES (?)', [libelle]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /nature-culture', error: err.message });
  }
});

app.put('/nature-culture/:id', async (req, res) => {
  const { id } = req.params;
  const { libelle } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('UPDATE nature_culture SET libelle = ? WHERE id = ?', [libelle, id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /nature-culture', error: err.message });
  }
});

app.delete('/nature-culture/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM nature_culture WHERE id = ?', [id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /nature-culture', error: err.message });
  }
});

// Ajoutez les routes CRUD pour production
app.get('/production', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM production');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /production', error: err.message });
  }
});

app.post('/production', async (req, res) => {
  const { libelle, unite } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('INSERT INTO production (libelle, unite) VALUES (?, ?)', [libelle, unite]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /production', error: err.message });
  }
});

app.put('/production/:id', async (req, res) => {
  const { id } = req.params;
  const { libelle, unite } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('UPDATE production SET libelle = ?, unite = ? WHERE id = ?', [libelle, unite, id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /production', error: err.message });
  }
});

app.delete('/production/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM production WHERE id = ?', [id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /production', error: err.message });
  }
});

// CRUD pour affectation_culture
app.get('/affectation-culture', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM affectation_culture');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /affectation-culture', error: err.message });
  }
});

app.post('/affectation-culture', async (req, res) => {
  const {
    COD_SOC, cod_par, cod_campagne,
    categorie_id, type_culture_id, nature_culture_id, surface_affectee
  } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);

    // 1. Récupérer la surface totale de la parcelle
    const [parcelleRows] = await conn.execute(
      'SELECT surface FROM parcelle WHERE COD_SOC = ? AND cod_par = ?',
      [COD_SOC, cod_par]
    );
    if (!parcelleRows.length) {
      await conn.end();
      return res.status(400).json({ message: 'Parcelle non trouvée' });
    }
    const surfaceParcelle = parseFloat(parcelleRows[0].surface);

    // 2. Calculer la somme des surfaces déjà affectées pour cette parcelle et campagne
    const [affectRows] = await conn.execute(
      'SELECT SUM(surface_affectee) AS total_affectee FROM affectation_culture WHERE COD_SOC = ? AND cod_par = ? AND cod_campagne = ?',
      [COD_SOC, cod_par, cod_campagne]
    );
    const totalAffectee = parseFloat(affectRows[0].total_affectee) || 0;

    // 3. Vérifier la possibilité d'affectation
    const surfaceToAffect = parseFloat(surface_affectee);
    if (surfaceToAffect > (surfaceParcelle - totalAffectee)) {
      await conn.end();
      return res.status(400).json({ message: 'المساحة المسندة تتجاوز المساحة المتبقية للقطعة في هذا الموسم' });
    }
    if ((surfaceToAffect + totalAffectee) === surfaceParcelle) {
      // On autorise l'affectation, la parcelle sera totalement affectée
    }
    // Si surfaceToAffect < surfaceParcelle - totalAffectee, on autorise aussi

    // 4. Insertion
    await conn.execute(
      `INSERT INTO affectation_culture
        (COD_SOC, cod_par, cod_campagne, categorie_id, type_culture_id, nature_culture_id, surface_affectee)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [COD_SOC, cod_par, cod_campagne, categorie_id, type_culture_id, nature_culture_id, surface_affectee]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /affectation-culture', error: err.message });
  }
});

app.put('/affectation-culture/:id', async (req, res) => {
  const { id } = req.params;
  const {
    COD_SOC, cod_par, cod_campagne,
    categorie_id, type_culture_id, nature_culture_id, surface_affectee
  } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      `UPDATE affectation_culture SET
        COD_SOC = ?, cod_par = ?, cod_campagne = ?, categorie_id = ?, type_culture_id = ?, nature_culture_id = ?, surface_affectee = ?
        WHERE id = ?`,
      [COD_SOC, cod_par, cod_campagne, categorie_id, type_culture_id, nature_culture_id, surface_affectee, id]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /affectation-culture', error: err.message });
  }
});

app.delete('/affectation-culture/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM affectation_culture WHERE id = ?', [id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /affectation-culture', error: err.message });
  }
});

// CRUD pour campagne
app.get('/campagne', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM campagne');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /campagne', error: err.message });
  }
});

app.post('/campagne', async (req, res) => {
  const { cod_campagne, libelle, etat } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);

    if (etat === 'A') {
      await conn.execute('UPDATE campagne SET etat = "N" WHERE etat = "A"');
    }
    await conn.execute(
      'INSERT INTO campagne (cod_campagne, libelle, etat) VALUES (?, ?, ?)',
      [cod_campagne, libelle, etat || 'N']
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /campagne', error: err.message });
  }
});

app.put('/campagne/:cod_campagne', async (req, res) => {
  const { cod_campagne } = req.params;
  const { libelle, etat } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Si on met à jour pour "A", mettre toutes les autres à "N"
    if (etat === 'A') {
      await conn.execute('UPDATE campagne SET etat = "N" WHERE etat = "A"');
    }
    await conn.execute(
      'UPDATE campagne SET libelle = ?, etat = ? WHERE cod_campagne = ?',
      [libelle, etat, cod_campagne]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /campagne', error: err.message });
  }
});

app.delete('/campagne/:cod_campagne', async (req, res) => {
  const { cod_campagne } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM campagne WHERE cod_campagne = ?', [cod_campagne]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /campagne', error: err.message });
  }
});

// CRUD pour affectation_agent
app.get('/affectation-agent', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Jointure pour avoir les infos agent, agro, parcelle
    const [rows] = await conn.execute(`
      SELECT aa.id, aa.agent_id, u.username, u.role, aa.COD_SOC, ac.LIB_SOC, aa.cod_par, p.lib_par, aa.cod_campagne, c.libelle AS campagne_libelle
      FROM affectation_agent aa
      JOIN utilisateurs u ON aa.agent_id = u.id
      JOIN agro_combinats ac ON aa.COD_SOC = ac.COD_SOC
      JOIN parcelle p ON aa.COD_SOC = p.COD_SOC AND aa.cod_par = p.cod_par
      JOIN campagne c ON aa.cod_campagne = c.cod_campagne
    `);
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /affectation-agent', error: err.message });
  }
});

app.post('/affectation-agent', async (req, res) => {
  const { agent_id, COD_SOC, cod_par, cod_campagne } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Vérifier si déjà affecté pour la même campagne
    const [exist] = await conn.execute(
      'SELECT id FROM affectation_agent WHERE agent_id = ? AND COD_SOC = ? AND cod_par = ? AND cod_campagne = ?',
      [agent_id, COD_SOC, cod_par, cod_campagne]
    );
    if (exist.length > 0) {
      await conn.end();
      return res.status(400).json({ message: 'Déjà affecté pour cette campagne' });
    }
    await conn.execute(
      'INSERT INTO affectation_agent (agent_id, COD_SOC, cod_par, cod_campagne) VALUES (?, ?, ?, ?)',
      [agent_id, COD_SOC, cod_par, cod_campagne]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /affectation-agent', error: err.message });
  }
});

app.put('/affectation-agent/:id', async (req, res) => {
  const { id } = req.params;
  const { agent_id, COD_SOC, cod_par, cod_campagne } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Vérifier s'il existe déjà une affectation identique (autre que celle en cours)
    const [exist] = await conn.execute(
      'SELECT id FROM affectation_agent WHERE agent_id = ? AND COD_SOC = ? AND cod_par = ? AND cod_campagne = ? AND id != ?',
      [agent_id, COD_SOC, cod_par, cod_campagne, id]
    );
    if (exist.length > 0) {
      await conn.end();
      return res.status(400).json({ message: 'Déjà affecté pour cette campagne' });
    }
    const [result] = await conn.execute(
      'UPDATE affectation_agent SET agent_id = ?, COD_SOC = ?, cod_par = ?, cod_campagne = ? WHERE id = ?',
      [agent_id, COD_SOC, cod_par, cod_campagne, id]
    );
    await conn.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Affectation non trouvée' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /affectation-agent PUT', error: err.message });
  }
});

app.delete('/affectation-agent/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM affectation_agent WHERE id = ?', [id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur /affectation-agent', error: err.message });
  }
});

// Ajoutez ce CRUD pour rapport_journalier (API REST)
app.post('/rapport-journalier', async (req, res) => {
  const {
    date_rapport,
    cod_campagne,
    COD_SOC,
    cod_par,
    affectation_culture_id,
    production_id,
    surface,
    surface_marboota,
    type_marboota, 
    production, 
    echanges,
    stockage,
    commerce,
    utilisateur_id
  } = req.body;
  try {
    // Vérification des champs obligatoires
    if (
      !date_rapport || !cod_campagne || !COD_SOC || !cod_par ||
      !affectation_culture_id || !production_id || !utilisateur_id
    ) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      `INSERT INTO rapport_journalier
      (date_rapport, cod_campagne, COD_SOC, cod_par, affectation_culture_id, production_id, surface, surface_marboota, type_marboota, production, echanges, stockage, commerce, utilisateur_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date_rapport,
        cod_campagne,
        COD_SOC,
        cod_par,
        affectation_culture_id,
        production_id,
        surface === '' || surface === undefined ? null : surface,
        surface_marboota === '' || surface_marboota === undefined ? null : surface_marboota,
        type_marboota === '' || type_marboota === undefined ? null : type_marboota,
        production === '' || production === undefined ? null : production,
        echanges === '' || echanges === undefined ? null : echanges,
        stockage === '' || stockage === undefined ? null : stockage,
        commerce === '' || commerce === undefined ? null : commerce,
        utilisateur_id
      ]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    // Log détaillé pour debug
    console.error('Erreur SQL /rapport-journalier:', err);
    res.status(500).json({ message: 'Erreur serveur /rapport-journalier', error: err.message });
  }
});

// GET all rapport_journalier for the connected user (optionally filter by utilisateur_id)
app.get('/rapport-journalier', async (req, res) => {
  try {
    const utilisateur_id = req.query.utilisateur_id;
    const conn = await mysql.createConnection(dbConfig);
    let query = `
      SELECT rj.*, u.username, ac.LIB_SOC, p.lib_par, prod.libelle as production_libelle
      FROM rapport_journalier rj
      JOIN utilisateurs u ON rj.utilisateur_id = u.id
      JOIN agro_combinats ac ON rj.COD_SOC = ac.COD_SOC
      JOIN parcelle p ON rj.COD_SOC = p.COD_SOC AND rj.cod_par = p.cod_par
      JOIN production prod ON rj.production_id = prod.id
      WHERE 1=1
    `;
    let params = [];
    if (utilisateur_id) {
      query += ' AND rj.utilisateur_id = ?';
      params.push(utilisateur_id);
    }
    query += ' ORDER BY rj.date_rapport DESC, rj.id DESC LIMIT 50';
    const [rows] = await conn.execute(query, params);
    await conn.end();
    // Correction : forcer date_rapport en chaîne 'YYYY-MM-DD' pour chaque ligne
    rows.forEach(r => {
      if (r.date_rapport instanceof Date) {
        r.date_rapport = r.date_rapport.toISOString().slice(0, 10);
      }
    });
    res.json(rows);
  } catch (err) {
    console.error('Erreur SQL /rapport-journalier:', err);
    res.status(500).json({ message: 'Erreur serveur /rapport-journalier', error: err.message });
  }
});

const frontendDist = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendDist));


app.get(/^\/(?!api\/).*/, (req, res, next) => {

  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT} (toutes interfaces)`);
});

