# Front-end do site de estatísticas

React com Vite. Mostra, por disciplina, a taxa de aprovação e a média por
semestre, e um ranking das disciplinas que mais reprovam.

## Rodar

```bash
npm install
npm run dev
```

Precisa do back-end no ar. Em desenvolvimento, a URL dele vem de um `.env`:

```
REACT_APP_API_URL=http://localhost:2020
```

O nome da variável ficou de quando o projeto usava create-react-app, e segue
assim porque é o que a stack em produção já tem configurado.

## Em produção

`npm run build` gera `build/`, e a imagem serve esses arquivos com nginx — o
bundle é montado na construção da imagem, não no boot do container.

A URL da API **não** entra no bundle: o container escreve `/config.js` ao
subir, a partir da variável de ambiente, e o `index.html` carrega esse arquivo
antes do resto. Trocar a URL é questão de mudar a variável na stack e
reiniciar; não precisa reconstruir a imagem.

## Telas

| Rota | O que mostra |
|---|---|
| `/` | disciplinas por período da grade |
| `/departamentos` | agrupadas por departamento |
| `/nome` | todas em ordem alfabética |
| `/reprovacoes` | ranking por taxa de reprovação |

As três primeiras têm um filtro de currículo. O curso trocou de currículo em
2022, as duas gerações convivem na grade e várias disciplinas aparecem duas
vezes com o mesmo nome — o código embaixo do nome e o selo `2022` distinguem.

## Fonte

Roboto Mono é servida pelo próprio site, em `public/fonts`. São os subsets
`latin` e `latin-ext`, um arquivo por subset: a fonte é variável, então o mesmo
arquivo cobre todos os pesos.
