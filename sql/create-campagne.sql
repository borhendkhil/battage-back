CREATE TABLE IF NOT EXISTS campagne (
  cod_campagne VARCHAR(10) PRIMARY KEY,
  LIB_CAMPAGNE VARCHAR(50),
  date_deb DATE,
  date_fin DATE,
  etat VARCHAR(1) DEFAULT 'N'
);
