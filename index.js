import express from 'express';
import dotenv from 'dotenv';
import fintrackRouter from './routes/fintrack.js';

dotenv.config();
const app = express();
app.use(express.json());

// Mount all finance tracking APIs at /fintrack
app.use('/fintrack', fintrackRouter);

app.get('/', (req, res) => {
  res.send('FinTrack API is running 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
