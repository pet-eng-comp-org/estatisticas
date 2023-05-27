import {Request, Response} from 'express';
import knex from '../database/connection';
import csv from 'csv-parser';
import fs from 'fs';

interface Dado {
    periodo:string;
    codigo_disciplina:string;
    nome_disciplina:string;
    pre_requisitos:string;
}
interface Disciplina {
    codigo_disciplina:string;
    nome:string;
    periodo_ecomp?:number;
    pre_requisitos_ecomp?:string;
    periodo_ccomp?:number;
    pre_requisitos_ccomp?:string;
}
interface Periodo {
    periodo: number;
    disciplinas: Array<{
        nome: string;
        codigo:string;
    }>;
}




class DisciplinesController {

    async index ( req: Request, res: Response){
        const disciplinas = await knex('disciplines')
        .distinct()
        return res.json(disciplinas);
        
    }

    async group(req:Request, res:Response){
        let resultado = {
            ecomp: <Periodo[]>[],
            ccomp: <Periodo[]>[]
        }
        for(let index = 0; index<11; index++){
            resultado.ccomp.push({
                periodo: index===10? 99: index+1,
                disciplinas: []
            })
            resultado.ecomp.push({
                periodo: index===10? 99: index+1,
                disciplinas: []
            })
        }
        const disciplinas = await knex<Disciplina>('disciplines').distinct();
        disciplinas.map(disciplina=>{
            if(disciplina.periodo_ccomp){
                switch (disciplina.periodo_ccomp) {
                    case 1:
                        resultado.ccomp[0].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 2:
                        resultado.ccomp[1].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 3:
                        resultado.ccomp[2].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 4:
                        resultado.ccomp[3].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 5:
                        resultado.ccomp[4].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 6:
                        resultado.ccomp[5].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 7:
                        resultado.ccomp[6].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 8:
                        resultado.ccomp[7].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 9:
                        resultado.ccomp[8].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 10:
                        resultado.ccomp[9].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 99:
                        resultado.ccomp[10].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    default:
                        break;
                }
            }
            if(disciplina.periodo_ecomp){
                switch (disciplina.periodo_ecomp) {
                    case 1:
                        resultado.ecomp[0].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 2:
                        resultado.ecomp[1].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 3:
                        resultado.ecomp[2].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 4:
                        resultado.ecomp[3].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 5:
                        resultado.ecomp[4].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 6:
                        resultado.ecomp[5].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 7:
                        resultado.ecomp[6].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 8:
                        resultado.ecomp[7].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 9:
                        resultado.ecomp[8].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 10:
                        resultado.ecomp[9].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    case 99:
                        resultado.ecomp[10].disciplinas.push({
                            nome: disciplina.nome,
                            codigo: disciplina.codigo_disciplina
                        })
                        break;
                    default:
                        break;
                }
            }
        })
        return res.json(resultado);
    }




    async create (req: Request, res: Response){
        if(!req.user.admin){
            return res.status(401).send("User is not admin. It is necessary to be an admin to create/update the data table.")
        }
        let ccomp = <Dado[]>[];
        let ecomp = <Dado[]>[];
        let grade_disciplinas = <Disciplina[]>[];
        fs.createReadStream(req.files.ccomp[0].path)
        .pipe(csv())
        .on('data', (row) => {

            const {
                NOME_DISCIPLINA,
                COD_DISCIPLINA,
                PERIODO,
            } = row;

            const data = {
                periodo:parseInt(PERIODO.trim()[0]),
                codigo_disciplina:COD_DISCIPLINA.trim(),
                nome_disciplina:NOME_DISCIPLINA.trim(),
                pre_requisitos:"nao especificado"
            }

            ccomp.push(data);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
        });
        fs.createReadStream(req.files.ecomp[0].path)
        .pipe(csv())
        .on('data', (row) => {
           
            const {
                NOME_DISCIPLINA,
                COD_DISCIPLINA,
                PERIODO,
            } = row;

            const data = {
                periodo:parseInt(PERIODO.trim()[0]),
                codigo_disciplina:COD_DISCIPLINA.trim(),
                nome_disciplina:NOME_DISCIPLINA.trim(),
                pre_requisitos:"nao especificado"
            }

            ecomp.push(data);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
        });
        
        const trx = await knex.transaction();
        ecomp.map(disciplina=>{
            let disciplina_ccomp=null;
            let index = ccomp.findIndex(disciplina_cc => disciplina_cc.codigo_disciplina === disciplina.codigo_disciplina);
                        
            (index !== -1)? disciplina_ccomp=ccomp[index]:null;
            
            if(disciplina_ccomp){
                grade_disciplinas.push({
                    codigo_disciplina: disciplina.codigo_disciplina,
                    nome: disciplina.nome_disciplina,
                    periodo_ecomp: Number(disciplina.periodo),
                    pre_requisitos_ecomp:  disciplina.pre_requisitos,
                    periodo_ccomp: Number(disciplina_ccomp.periodo),
                    pre_requisitos_ccomp: disciplina_ccomp.pre_requisitos
                })
            }else{
                grade_disciplinas.push({
                    codigo_disciplina: disciplina.codigo_disciplina,
                    nome: disciplina.nome_disciplina,
                    periodo_ecomp: Number(disciplina.periodo),
                    pre_requisitos_ecomp:  disciplina.pre_requisitos
                })
            }
        })
        ccomp.map(disciplina=>{
            grade_disciplinas.findIndex(dis=> disciplina.codigo_disciplina === dis.codigo_disciplina) === -1? 
                grade_disciplinas.push({
                    codigo_disciplina: disciplina.codigo_disciplina,
                    nome: disciplina.nome_disciplina,
                    periodo_ccomp: Number(disciplina.periodo),
                    pre_requisitos_ccomp:  disciplina.pre_requisitos
                }):null;
        })
        for(let index = 0;index<grade_disciplinas.length;index++){
            await trx('disciplines').insert(grade_disciplinas[index]);
        }
        await trx.commit();
        return res.json({message: "Deu Certo!"});

    }
}


export default DisciplinesController;