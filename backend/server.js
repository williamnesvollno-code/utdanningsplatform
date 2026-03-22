const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for JSON parsing
app.use(express.json());

// Grunnleggende rute for helsesjekk
app.get('/api/health', (req, res) => {
  res.json({ status: 'Platform API is running' });
});

// Importer ruter fra andre moduler (som vil lages i senere steg)
// const userRoutes = require('./routes/userRoutes');
// const assignmentRoutes = require('./routes/assignmentRoutes');
// app.use('/api/users', userRoutes);
// app.use('/api/assignments', assignmentRoutes);

app.listen(port, () => {
  console.log(`Utdanningsplattform API server running on port ${port}`);
});
