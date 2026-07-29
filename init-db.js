// Script Node.js pour créer les tables principales du projet "battage" dans MySQL

// Erreur : Cannot find module 'mysql2/promise'
// Solution : installez le module mysql2 avant d'exécuter ce script

// Ouvrez un terminal dans le dossier backend et lancez :
/*
npm install mysql2
*/

// Puis relancez :
/*
node init-db.js
*/

const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_NAME || 'battage',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  try {
    const dbName = process.env.DB_NAME || 'battage';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.changeUser({ database: dbName });

    // 0. Table utilisateurs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','super-admin','agent-saisie') NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 1. Table agro_combinats
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agro_combinats (
        COD_SOC VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
        LIB_SOC VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Table parcelle
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parcelle (
        COD_SOC VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        cod_par VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        lib_par VARCHAR(255),
        surface DECIMAL(10,2) DEFAULT NULL,
        PRIMARY KEY (COD_SOC, cod_par),
        CONSTRAINT fk_parcelle_soc FOREIGN KEY (COD_SOC)
          REFERENCES agro_combinats (COD_SOC) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Table campagne
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS campagne (
        cod_campagne VARCHAR(10) PRIMARY KEY,
        libelle VARCHAR(255),
        etat VARCHAR(1) DEFAULT 'N'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Table categorie_culture
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categorie_culture (
        id INT PRIMARY KEY AUTO_INCREMENT,
        libelle VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. Table type_culture
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS type_culture (
        id INT PRIMARY KEY AUTO_INCREMENT,
        libelle VARCHAR(255),
        categorie_id INT,
        CONSTRAINT fk_type_culture_categorie
          FOREIGN KEY (categorie_id) REFERENCES categorie_culture(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. Table nature_culture
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS nature_culture (
        id INT PRIMARY KEY AUTO_INCREMENT,
        libelle VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 7. Table production
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS production (
        id INT PRIMARY KEY AUTO_INCREMENT,
        libelle VARCHAR(255),
        unite VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 8. Table affectation_culture
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS affectation_culture (
        id INT AUTO_INCREMENT PRIMARY KEY,
        COD_SOC VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        cod_par VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        cod_campagne VARCHAR(10) NOT NULL,
        categorie_id INT NOT NULL,
        type_culture_id INT NOT NULL,
        nature_culture_id INT NOT NULL,
        production_id INT NOT NULL,
        surface_affectee DECIMAL(10,2) DEFAULT NULL,

        CONSTRAINT fk_affectation_culture_soc
          FOREIGN KEY (COD_SOC) REFERENCES agro_combinats (COD_SOC)
          ON DELETE CASCADE ON UPDATE CASCADE,

        CONSTRAINT fk_affectation_culture_parcelle
          FOREIGN KEY (COD_SOC, cod_par) REFERENCES parcelle (COD_SOC, cod_par)
          ON DELETE CASCADE ON UPDATE CASCADE,

        CONSTRAINT fk_affectation_culture_campagne
          FOREIGN KEY (cod_campagne) REFERENCES campagne (cod_campagne)
          ON DELETE CASCADE ON UPDATE CASCADE,

        CONSTRAINT fk_affectation_culture_categorie
          FOREIGN KEY (categorie_id) REFERENCES categorie_culture (id)
          ON DELETE CASCADE ON UPDATE CASCADE,

        CONSTRAINT fk_affectation_culture_type
          FOREIGN KEY (type_culture_id) REFERENCES type_culture (id)
          ON DELETE CASCADE ON UPDATE CASCADE,

        CONSTRAINT fk_affectation_culture_nature
          FOREIGN KEY (nature_culture_id) REFERENCES nature_culture (id)
          ON DELETE CASCADE ON UPDATE CASCADE,

        CONSTRAINT fk_affectation_culture_production
          FOREIGN KEY (production_id) REFERENCES production (id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 9. Table affectation_agent (ajout cod_campagne)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS affectation_agent (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT NOT NULL,
        COD_SOC VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        cod_par VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        cod_campagne VARCHAR(10) NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES utilisateurs(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (COD_SOC) REFERENCES agro_combinats(COD_SOC) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (COD_SOC, cod_par) REFERENCES parcelle(COD_SOC, cod_par) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (cod_campagne) REFERENCES campagne(cod_campagne) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 10. Table rapport_journalier
    // Correction : parcelle n'a pas de colonne id, il faut référencer (COD_SOC, cod_par)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rapport_journalier (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_rapport DATE NOT NULL,
        cod_campagne VARCHAR(10) NOT NULL,
        COD_SOC VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        cod_par VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        affectation_culture_id INT NOT NULL,
        production_id INT NOT NULL,
        surface DECIMAL(10,2) DEFAULT NULL,
        surface_marboota DECIMAL(10,2) DEFAULT NULL,
        production DECIMAL(10,2) DEFAULT NULL,
        echanges DECIMAL(10,2) DEFAULT NULL,
        stockage DECIMAL(10,2) DEFAULT NULL,
        commerce DECIMAL(10,2) DEFAULT NULL,
        utilisateur_id INT NOT NULL,
        date_saisie DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cod_campagne) REFERENCES campagne(cod_campagne) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (COD_SOC, cod_par) REFERENCES parcelle(COD_SOC, cod_par) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (affectation_culture_id) REFERENCES affectation_culture(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (production_id) REFERENCES production(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Toutes les tables ont été créées avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la création des tables :", error);
  } finally {
    await connection.end();
  }
}

main();
