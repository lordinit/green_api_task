import express from 'express';
import { processTask } from './controllers/taskController';

const app = express();
export const port = process.env.PORT || 4390;

app.use(express.json());
app.post('/process', processTask);

export default app;