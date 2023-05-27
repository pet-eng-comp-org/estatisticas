import { Request, Response } from 'express';
import knex from '../database/connection';
import csv from 'csv-parser';
import fs from 'fs';

interface Item {
    nome_disciplina: string;
    codigo_disciplina: string;
    curso: string;
    media: number;
    situacao: string;
    ano: string;
    professor: string;
    matricula: string;
}

interface Resultado {
    periodo: string;
    aprovados: number;
    reprovados_por_nota: number;
    reprovados_por_frequencia: number;
    amparo_legal: number;
    matricula: number;
    dispensa_sem_nota: number;
    professor: string;
    media: number;
    media_di: number;
    alunos_di: number;
    aprovados_di: number;
    reprovados_por_nota_di: number;
    reprovados_por_frequencia_di: number;
}

class ItemsController {




    async index(req: Request, res: Response) {

        const items = await knex('items')
            .distinct()
        return res.json(items);

    }

    async show(req: Request, res: Response) {
        const { codigo_disciplina } = req.params;
        const ano = String(req.query.ano);
        let resultados = <Resultado[]>[];
        let professores = <string[]>[];
        let items = <Item[]>[];
        if (req.query.ano) {
            items = await knex<Item>('items').distinct().where({
                codigo_disciplina: codigo_disciplina,
                ano: ano
            });
            items.map(item => {
                professores.length === 0 ? professores.push(item.professor) :
                    professores.indexOf(item.professor) === -1 ? professores.push(item.professor) : null;
            });
            professores.map(professor => {
                resultados.push({
                    periodo: ano,
                    aprovados: 0,
                    reprovados_por_nota: 0,
                    reprovados_por_frequencia: 0,
                    amparo_legal: 0,
                    matricula: 0,
                    dispensa_sem_nota: 0,
                    professor,
                    media: 0,
                    media_di: 0,
                    alunos_di: 0,
                    reprovados_por_frequencia_di: 0,
                    reprovados_por_nota_di: 0,
                    aprovados_di: 0
                })
            });
            items.map(item => {
                let index;
                resultados.map(resultado => {
                    if (resultado.professor === item.professor) {
                        index = resultados.indexOf(resultado);
                    }
                })
                if(item.curso === 'Engenharia da Computação' || item.curso === 'Ciência da Computação'){
                    resultados[Number(index)].media_di += item.media;
                    if(item.situacao === 'Aprovado' ){
                        resultados[Number(index)].aprovados_di++;
                        resultados[Number(index)].alunos_di++;
                    }
                    if(item.situacao === 'Reprovado por Nota'){
                        resultados[Number(index)].alunos_di++;
                        resultados[Number(index)].reprovados_por_nota_di++;

                    }
                    if(item.situacao === 'Reprovado por Freqüência'){
                        resultados[Number(index)].reprovados_por_frequencia_di++;
                        resultados[Number(index)].alunos_di++;
                    }
                }
                switch (item.situacao) {
                    case 'Aprovado':
                        resultados[Number(index)].aprovados++;
                        break;
                    case 'Reprovado por Nota':
                        resultados[Number(index)].reprovados_por_nota++;
                        break;
                    case 'Matrícula':
                        resultados[Number(index)].matricula++;
                        break;
                    case 'Amparo Legal':
                        resultados[Number(index)].amparo_legal++;
                        break;
                    case 'Dispensa sem nota':
                        resultados[Number(index)].dispensa_sem_nota++;
                        break;
                    case 'Reprovado por Freqüência':
                        resultados[Number(index)].reprovados_por_frequencia++;
                        break;
                    default:
                        break;
                }
                resultados[Number(index)].media += item.media;
            });
        } else {
            let semestres = <string[]>[];
            items = await knex<Item>('items').where('codigo_disciplina', codigo_disciplina);
            items.map(item => {
                professores.length === 0 ? professores.push(item.professor) :
                    professores.indexOf(item.professor) === -1 ? professores.push(item.professor) : null;
                semestres.length === 0 ? semestres.push(item.ano) :
                    semestres.indexOf(item.ano) === -1 ? semestres.push(item.ano) : null;
                resultados.findIndex(resultado => {
                    if (resultado.professor === item.professor && resultado.periodo === item.ano) {
                        return true;
                    }
                }) === -1 ? resultados.push({
                    periodo: item.ano,
                    aprovados: 0,
                    reprovados_por_nota: 0,
                    reprovados_por_frequencia: 0,
                    amparo_legal: 0,
                    matricula: 0,
                    dispensa_sem_nota: 0,
                    professor: item.professor,
                    media: 0,
                    alunos_di: 0,
                    media_di: 0,
                    reprovados_por_frequencia_di: 0,
                    reprovados_por_nota_di: 0,
                    aprovados_di: 0
                }) : null;
            });
            items.map(item => {
                let index;
                resultados.map(resultado => {
                    if (resultado.professor === item.professor && resultado.periodo === item.ano) {
                        index = resultados.indexOf(resultado);
                    }
                })
                if(item.curso === 'Engenharia da Computação' || item.curso === 'Ciência da Computação'){
                    resultados[Number(index)].media_di += item.media;
                    if(item.situacao === 'Aprovado' ){
                        resultados[Number(index)].aprovados_di++;
                        resultados[Number(index)].alunos_di++;
                    }
                    if(item.situacao === 'Reprovado por Nota'){
                        resultados[Number(index)].alunos_di++;
                        resultados[Number(index)].reprovados_por_nota_di++;

                    }
                    if(item.situacao === 'Reprovado por Freqüência'){
                        resultados[Number(index)].reprovados_por_frequencia_di++;
                        resultados[Number(index)].alunos_di++;
                    }
                }
                switch (item.situacao) {
                    case 'Aprovado':
                        resultados[Number(index)].aprovados++;
                        break;
                    case 'Reprovado por Nota':
                        resultados[Number(index)].reprovados_por_nota++;
                        break;
                    case 'Matrícula':
                        resultados[Number(index)].matricula++;
                        break;
                    case 'Amparo Legal':
                        resultados[Number(index)].amparo_legal++;
                        break;
                    case 'Dispensa sem nota':
                        resultados[Number(index)].dispensa_sem_nota++;
                        break;
                    case 'Reprovado por Freqüência':
                        resultados[Number(index)].reprovados_por_frequencia++;
                        break;
                    default:
                        break;
                }
                resultados[Number(index)].media += item.media;
            });
        };

        resultados.map(resultado => {
            resultado.media_di /= resultado.alunos_di;
            resultado.media /= (resultado.aprovados + resultado.reprovados_por_nota+ resultado.reprovados_por_frequencia);
        })

        return res.json(resultados);

    }



    // async show (req: Request, res: Response){
    //     const {id}= req.params;

    //     const point = await knex('points').where('id', id).first();

    //     if(!point) {
    //         return res.status(400).json({message: "Point not found"});
    //     }

    //     const serializedPoint =  { 
    //             ...point,
    //             image_url: `http://192.168.0.104:3333/uploads/${point.image}`,
    //         }


    //     const items = await knex('items')
    //     .join('point_items', 'items.id', '=', 'point_items.item_id')
    //     .where('point_items.point_id', id);



    //     return res.json({point: serializedPoint, items})
    // }



    async create(req: Request, res: Response) {
        if(!req.user.admin){
            return res.status(401).send("User is not admin. It is necessary to be an admin to create/update the data table.")
        }
        let lista = <Item[]>[];
        console.log(req.file);
        await fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                const {
                    NOME_DISCIPLINA,
                    COD_DISCIPLINA,
                    NOME_CURSO_ALUNO,
                    MEDIA_FINAL,
                    SITUACAO,
                    ANO,
                    PERIODO,
                    NOME_DOCENTE,
                    MATR_ALUNO,
                } = row;

                const item = {
                    nome_disciplina: NOME_DISCIPLINA.trim(),
                    codigo_disciplina: COD_DISCIPLINA.trim(),
                    curso: NOME_CURSO_ALUNO.trim(),
                    media: parseFloat(MEDIA_FINAL.replace(',', '.')),
                    situacao: SITUACAO.trim(),
                    ano: `${ANO.trim()}/${PERIODO.trim()[0]}`,
                    professor: NOME_DOCENTE.trim(),
                    matricula: MATR_ALUNO.trim(),
                };
                lista.push(item);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
            })


        const trx = await knex.transaction();
        for (let index = 0; index < lista.length; index++) {

            const id = await trx('items').where({
                codigo_disciplina: lista[index].codigo_disciplina,
                matricula: lista[index].matricula,
                ano: lista[index].ano,
            }).select('id');
            
            if (id.length !== 0){
                console.log(`O aluno de matrícula ${lista[index].matricula} já teve os dados da disciplina de código ${lista[index].codigo_disciplina} de ${lista[index].ano} registrados`)
            } else {
                console.log("Inserindo aluno")
                await trx('items').insert(lista[index]);
            } 
            console.log(`${index}/${lista.length}`)
        }
        // lista.map(item=> async function() {
        //     await trx('items').insert(item);
        // })
        await trx.commit();
        return res.json({ message: "Deu Certo!" });
    }
}

export default ItemsController;

// public void escrever(){
//     File caminho = new File(Environment.getExternalStorageDirectory().getAbsolutePath()+"/arquivos");
//     if (!caminho.exists())
//         caminho.mkdir();

//     File file = new File(caminho.getPath()+"/arquivo.csv");

//     try {
//         FileOutputStream out = new FileOutputStream(file);
//         //aqui você pode adicionar o que desejar salvar usando estruturas de código e tudo mais
//         String aux = "o que eu quero salvar;dividido por ponto e virgula\n"+
//                     "e com quebra de texto";

//         out.write(aux.getBytes(), 0, aux.getBytes().length);
//         //esse método write deve ficar dentro da estrutura de repetição 

//         //já essa parte de flush e close tem que ficar fora e 
//         //deve ser executada apenas quando já tiver terminado de gerar todo o arquivo 
//         out.flush();
//         out.close();
//     } catch (FileNotFoundException e) {
//         e.printStackTrace();
//     } catch (IOException e) {
//         // TODO Auto-generated catch block
//         e.printStackTrace();
//     }       
// }