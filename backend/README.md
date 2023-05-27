<h1 align="center"> 
	Back-end do Site de Estatística
</h1>

<h1 align="center">
    <img alt="backend" title="#backend" src=".gitlab/backend.png" width="250px" />
</h1>

## :rocket: Tecnologias

Esse back-end foi desenvolvido usando as seguintes tecnologias:

- [Node.js][nodejs]
- [TypeScript][typescript]
- [Yarn][yarn]


## 🖥️ Como usar
Para copiar e executar essa aplicação você precisa do [Git](https://git-scm.com) e [Yarn][yarn] intalados no seu computador.

```bash
# Clonar esse repositório
$ git clone https://gitlab.com/petengcomp/web/backend_site_estatistica.git

# Vá para o ropositório
$ cd backend_site_estatistica

# Instale as dependências
$ yarn install

# Executar as Migrates
$ yarn knex:migrate

# Iniciar o servidor
$ yarn dev

# running on port 3333

```

[nodejs]: https://nodejs.org/
[typescript]: https://www.typescriptlang.org/
[yarn]: https://yarnpkg.com/


>Usuário PET EngComp:
- email: petengcomp@gmail.com
- senha: padrão nova

# Atualização dos dados

Para atualizar os dados, primeiramente precisa-se dos dados em si. Uma planilha é gerada para isso (solicitar ao NTI) com os dados da Eng Comp, Ccomp e do CT no geral.

Uma vez que se tem a planilha, é importante se certificar que nenhum campo está em branco, em nenhuma célula!

> Campos em que o nome do professor nao for esplicitado devem ser preenchidos com "PROFESSOR NÃO ALOCADO". O mesmo para campos como matricula do docente etc.

> Campos em que a nota do aluno está em branco devido à reprovação por falta, devem ser preenchidos com 0,0.

Uma vez que a planilha está preenchida, basta fazer um filtro (pelo google sheets é só usar a ferramenta filtro), para criar outras duas planilhas a partir da planilha geral de acordo com a seguinte configuração:

>Uma planilha só com informações dos alunos da Engenharia da Computação

>Uma planilha só com informações dos alunos da Ciência da Computação

Agora basta converter todas essas planilhas para .csv para serem utilizadas nas chamadas dessa API.

>Antes de prosseguir, assegure-se de fazer um backup do arquivo do banco de dados (.sqlite) que estã na VM para evitar problemas e faça todas as alterações primeiro localmente para depois mexer na API em produção.

Para simplesmente atualizar os dados, basta fazer uma request com corpo do tipo Multipart Form (pelo insomnia é super facil) em que o nome do aruquivo deve ser `file`. Alguns exemplos de requests ao backend podem ser visualizadas no arquivo `.json` de documentação do Insomnia que está no repositório.

O backend demora um pouco para registrar todos os alunos, então tenha paciência e acompanhe o console para observar tudo.

>Assim que terminar de atualizar localmente, você tem duas opções, ou subir o novo arquivo sqlite na VM direto (mais recomendado), ou então atualizar o código na VM e fazer a request pela API de produção.
