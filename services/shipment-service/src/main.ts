import { app } from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT || 3004);

app.listen(PORT, () => {
  console.log(`shipment-service listening on port ${PORT}`);
});