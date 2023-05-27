import express from 'express';
import { celebrate , Joi} from 'celebrate';
import multer from 'multer';
import multerConfig from './config/multer';


import ItemsController from './controllers/ItemsController';
import UsersController from './controllers/UsersController';
import DisciplinesController from './controllers/DisciplinesController';

const routes = express.Router();
const verify = require('./utils/verifyToken');

const itemsController = new ItemsController();
const usersController = new UsersController();
const disciplinesController = new DisciplinesController();

const upload = multer(multerConfig);


routes.get('/items', itemsController.index);
routes.get('/items/:codigo_disciplina', itemsController.show);

// routes.get('/items/:id', itemsController.show);

routes.get('/users', usersController.index);
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

routes.get('/viewGrid', disciplinesController.index);
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