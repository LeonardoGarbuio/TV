import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const db = await open({
    filename: path.join(__dirname, '../database/projetos.db'),
    driver: sqlite3.Database
  });
  
  const projetos = await db.all('SELECT id, nome, imagem FROM projetos');
  console.log('Projetos no banco:');
  projetos.forEach(p => console.log(`ID: ${p.id}, Nome: ${p.nome}, Imagem: ${p.imagem}`));
  
  await db.close();
})(); 