import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import * as dotenv from 'dotenv';
import {errors} from 'celebrate';

dotenv.config();

const app = express();

app.use(cors({origin: 'https://estatistica.pet.inf.ufes.br/'}));
app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.resolve(__dirname, "..", "uploads")))

app.use(errors());

app.listen(2020, () => console.log("Server running on " + 2020));