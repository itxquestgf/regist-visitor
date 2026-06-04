import fs from 'fs';
const data = JSON.parse(fs.readFileSync('pola-db.json', 'utf8'));
const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

if (!data.jadwal.some(j => j.id === today)) {
  data.jadwal.push({ id: today, date: today });
  fs.writeFileSync('pola-db.json', JSON.stringify(data, null, 2));
  console.log('Added today to jadwal');
} else {
  console.log('Already exists');
}
