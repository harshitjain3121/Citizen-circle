const express = require('express');
const cors = require('cors');
const config = require('./config/default');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ extended: false }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'CitizenCircle API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));