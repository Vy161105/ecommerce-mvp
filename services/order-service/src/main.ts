import { app } from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT || 3003);

app.listen(PORT, () => {
  console.log(`order-service listening on port ${PORT}`);
});
