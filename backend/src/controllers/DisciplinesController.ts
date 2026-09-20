import {Request, Response} from 'express';
import knex from '../database/connection';
import csv from 'csv-parser';
import fs from 'fs';

/** Mesma razao do ItemsController: /app/uploads e servido sem autenticacao. */
function descarta(caminho: string) {
    fs.unlink(caminho, () => { /* ja foi lido */ });
}

interface Dado {
    // parseInt do periodo: a coluna periodo_ecomp da tabela e inteira.
    periodo:number;
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
    curriculo?:number | null;
}
interface Periodo {
    periodo: number;
    disciplinas: Array<{
        nome: string;
        codigo: string;
        curriculo: number | null;
    }>;
}




class DisciplinesController {

    async index ( req: Request, res: Response){
        const disciplinas = await knex('disciplines')
        .distinct()
        return res.json(disciplinas);
        
    }

    async group(req: Request, res: Response) {
        // 11 baldes: periodos 1 a 10 e, no fim, o 99 que o front rotula
        // como "Optativas".
        const baldes = () => {
            const b: Periodo[] = [];
            for (let i = 0; i < 11; i++) {
                b.push({ periodo: i === 10 ? 99 : i + 1, disciplinas: [] });
            }
            return b;
        };
        const resultado = { ecomp: baldes(), ccomp: baldes() };

        const indice = (periodo: number) =>
            periodo === 99 ? 10 : (periodo >= 1 && periodo <= 10 ? periodo - 1 : -1);

        const disciplinas = await knex<Disciplina>('disciplines').distinct();
        disciplinas.forEach(disciplina => {
            // Um objeto por arvore: compartilhar a mesma referencia faria um
            // campo especifico de um curso aparecer no outro.
            const entrada = () => ({
                nome: disciplina.nome,
                codigo: disciplina.codigo_disciplina,
                curriculo: disciplina.curriculo === undefined ? null : disciplina.curriculo,
            });
            const i = indice(Number(disciplina.periodo_ecomp));
            if (i >= 0) resultado.ecomp[i].disciplinas.push(entrada());
            const j = indice(Number(disciplina.periodo_ccomp));
            if (j >= 0) resultado.ccomp[j].disciplinas.push(entrada());
        });

        return res.json(resultado);
    }

    async create (req: Request, res: Response){
        if (!req.user || !req.user.admin) {
            return res.status(401).send("User is not admin. It is necessary to be an admin to create/update the data table.")
        }
        // upload.fields entrega um mapa de campo -> arquivos; sem os dois nao
        // ha o que montar.
        const enviados = req.files as
            { [campo: string]: Express.Multer.File[] } | undefined;
        if (!enviados || !enviados.ccomp || !enviados.ecomp) {
            return res.status(400).json({
                message: "Envie os arquivos nos campos 'ccomp' e 'ecomp'.",
            });
        }

        let ccomp = <Dado[]>[];
        let ecomp = <Dado[]>[];
        let grade_disciplinas = <Disciplina[]>[];
        fs.createReadStream(enviados.ccomp[0].path)
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
          descarta(enviados.ccomp[0].path);
        });
        fs.createReadStream(enviados.ecomp[0].path)
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
          descarta(enviados.ecomp[0].path);
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