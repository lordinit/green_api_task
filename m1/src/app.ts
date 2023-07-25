import express from 'express';
import { processTask } from './controllers/taskController';

const app = express();
export const port = 3000;

app.use(express.json());
app.post('/process', processTask);

export default app;