const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;
const DB_FILE = path.join(__dirname, 'db.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Denic123*';

app.use(express.json());
app.use(express.static(__dirname));

// ensure db exists
if(!fs.existsSync(DB_FILE)){
  const init = {
    groupName: 'My WhatsApp Group',
    groupLink: 'https://chat.whatsapp.com/example',
    status: 'open',
    membersCount: 10,
    maxMembers: 100,
    sessionLink: '/session-link-placeholder'
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
}

// serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/page2.html', (req, res) => res.sendFile(path.join(__dirname, 'page2.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// API: get group data
app.get('/group', (req, res) => {
  try{
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    res.json(data);
  }catch(e){
    res.status(500).json({error:'Failed to read DB'});
  }
});

// API: update (password protected)
app.post('/update-link', (req, res) => {
  const { password, groupLink, groupName, status, membersCount, maxMembers, sessionLink } = req.body;
  if(password !== ADMIN_PASSWORD){
    return res.status(403).json({ error: 'Invalid password' });
  }
  const newData = { groupName, groupLink, status, membersCount, maxMembers, sessionLink };
  try{
    fs.writeFileSync(DB_FILE, JSON.stringify(newData, null, 2));
    return res.json({ success: true, data: newData });
  }catch(e){
    return res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => console.log('Server running on port', PORT));