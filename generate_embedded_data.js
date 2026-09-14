const fs = require('fs');
const path = require('path');

const csvPath = 'BlinkIT Grocery Project U16955293080 (4).csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else current += char;
  }
  result.push(current);
  return result;
}

const categoryMargins = {
  'Fruits and Vegetables': 0.28,
  'Snack Foods': 0.26,
  'Household': 0.30,
  'Frozen Foods': 0.24,
  'Dairy': 0.18,
  'Canned': 0.22,
  'Baking Goods': 0.23,
  'Health and Hygiene': 0.32,
  'Meat': 0.20,
  'Soft Drinks': 0.25,
  'Breads': 0.21,
  'Hard Drinks': 0.27,
  'Starchy Foods': 0.22,
  'Others': 0.20,
  'Seafood': 0.26,
  'Breakfast': 0.24
};

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const rawData = [];
for (let i = 1; i < lines.length; i++) {
  const p = parseCSVLine(lines[i]);
  if (p.length < 12) continue;
  
  let fat = p[2].trim();
  if (fat === 'LF' || fat === 'low fat') fat = 'Low Fat';
  if (fat === 'reg') fat = 'Regular';

  const cat = p[4].trim();
  const sales = parseFloat(p[11]) || 0;
  const margin = categoryMargins[cat] || 0.22;
  const profit = Math.round(sales * margin * 100) / 100;
  const mrp = parseFloat(p[5]) || 0;
  const id = p[0].trim();
  const outletId = p[6].trim();
  const monthIdx = hashStr(id + outletId) % 12;

  rawData.push({
    id: id,
    w: Math.round((parseFloat(p[1]) || 0) * 100) / 100,
    f: fat,
    v: Math.round((parseFloat(p[3]) || 0) * 10000) / 10000,
    c: cat,
    m: Math.round(mrp * 100) / 100,
    o: outletId,
    y: parseInt(p[7], 10) || 0,
    s: p[8].trim() || 'Not Specified',
    t: p[9].trim(),
    ot: p[10].trim(),
    sa: Math.round(sales * 100) / 100,
    pr: profit,
    mo: monthIdx
  });
}

console.log('Total items processed:', rawData.length);
const exportCode = 'var RAW_DATA = ' + JSON.stringify(rawData) + ';\nif (typeof window !== "undefined") { window.RAW_DATA = RAW_DATA; }\nif (typeof module !== "undefined") { module.exports = RAW_DATA; }\n';
fs.writeFileSync('data_embedded.js', exportCode);
console.log('data_embedded.js generated successfully.');

