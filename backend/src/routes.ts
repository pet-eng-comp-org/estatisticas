import express from 'express';
import { celebrate , Joi} from 'celebrate';
import multer from 'multer';
import multerConfig from './config/multer';


import ItemsController from './controllers/ItemsController';
import UsersController from './controllers/UsersController';
import DisciplinesController from './controllers/DisciplinesController';
import RankingController from './controllers/RankingController';
import { EQUIVALENCIAS, NOMES_2008 } from './database/equivalencias';

const routes = express.Router();
const verify = require('./utils/verifyToken');

const itemsController = new ItemsController();
const usersController = new UsersController();
const disciplinesController = new DisciplinesController();
const rankingController = new RankingController();

const upload = multer(multerConfig);


// Despeja a tabela inteira; o site nunca usa. Fica atras de autenticacao.
routes.get('/items', verify, itemsController.index);
routes.get('/items/:codigo_disciplina', itemsController.show);

// routes.get('/items/:id', itemsController.show);

// Lista as contas administrativas; o site nunca usa.
routes.get('/users', verify, usersController.index);
routes.post('/login', usersController.login);
routes.post('/register', verify, usersController.register);

routes.post('/items',
  verify,
  upload.single('file'),
  // celebrate({
  //     body: Joi.object().keys({
  //         nome_disciplina: Joi.string().required(),
  //         codigo_disciplina: Joi.string().required(),
  //         curso: Joi.string().required(),
  //         media: Joi.number().required(),
  //         situacao: Joi.string().required(),
  //         ano: Joi.string().required(),
  //         professor: Joi.string().required(),
  //         matricula: Joi.string().required(),
  //     })
  //},
  //  {
  //     abortEarly: false
  //}
  //),
  itemsController.create);

// Disciplinas ordenadas por taxa de reprovacao, para comparar de uma vez.
routes.get('/ranking', rankingController.index);

routes.get('/viewGrid', disciplinesController.index);
// Pares [2022, 2008] do PPC: e o que a tela de comparar curriculos cruza.
routes.get('/equivalencias', (req, res) => res.json({ pares: EQUIVALENCIAS, nomes2008: NOMES_2008 }));
routes.get('/viewSortedGrid', disciplinesController.group)

//FIXME: Essa rota possui problemas graves e não está funcionando corretamente
routes.post('/mountGrid',
  verify,
  upload.fields([{
    name: 'ccomp',
    maxCount: 1
  },{
    name: 'ecomp',
    maxCount: 1
  }]), 
  disciplinesController.create)

export default routes;