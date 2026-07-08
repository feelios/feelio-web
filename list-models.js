import fs from 'fs';

const content = fs.readFileSync('gemini-reviewer.js', 'utf8');
const match = content.match(/const API_KEY = [\'"]([^\'"]+)[\'"]/);
if (match) {
  const key = match[1];
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  fetch(url).then(res => res.json()).then(data => {
    if (data.models) {
      console.log(data.models.map(m => m.name.split('/').pop()).filter(n => n.includes('gemini')).join(', '));
    } else {
      console.log('Error fetching models:', data);
    }
  }).catch(err => console.error(err));
} else {
  console.log('API key not found');
}
