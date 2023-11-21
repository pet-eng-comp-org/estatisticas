import {Request, Response} from 'express';
import knex from '../database/connection';
const { loginValidation, emailValidation, changePasswordValidation } = require("../utils/validation")
const { registerValidation, updateRegisterValidation } = require("../utils/validation")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


interface User {
    nome: string;
    email: string;
    senha: string;
    admin: boolean;
}

class UsersController {
    async index(req: Request, res: Response){
        const items = (await knex('user').distinct()).map(item => {
            const newItem = {...item};
            delete newItem["senha"];
            return newItem;
        })
        return res.json(items);
    }

    async login(req: Request, res: Response){
        //Validate of login
        const { error } = loginValidation(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message)
        }
        //checking if the email exists
        const user = await knex('user').where({ email: req.body.email }).first()
        if (!user) {
            return res.status(400).send("Email is not found")
        }
        //password is correct
        const validPass = await bcrypt.compare(req.body.senha, user.senha)
        if (!validPass) {
            return res.status(400).send("Senha inválida")
        }
        // create and assign a token
        let token = jwt.sign({ _id: user.id, admin: user.admin}, process.env.TOKEN_SECRET ,{ expiresIn: '1h' })  
            

        res.status(201).header("auth-token", token).send(token)
    }


    async register(req: Request, res: Response) {
        if(!req.user.admin){
            return res.status(401).send("User is not admin. It is necessary to be an admin to create/update the data table.")
        }
        const { error } = registerValidation(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message)
        }
        //Checking if the person is already in the database
        const emailExist = await knex('user').where({ email: req.body.email }).first()
        if (emailExist) {
            return res.status(400).send("email already exists")
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.senha, salt)

        //Create a new person
        const user = {
            nome: req.body.nome,
            email: req.body.email,
            senha: hashedPassword,
            admin: req.body.admin,
        }
        try {
            const savedUser = await knex('user').insert(user)
            res.send({ user: savedUser })
        } catch (err) {
            res.status(400).send(err)
        }
    }

}

export default UsersController;

