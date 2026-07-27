# LembreMed — Frontend: Mapa de Pontos de Saúde

Frontend desenvolvido em React + TypeScript, utilizando Leaflet para exibir no mapa os Pontos de Saúde cadastrados na API do LembreMed.

> **Escopo:** Este projeto cobre apenas o módulo de Geolocalização, não inclui login, dashboard, telas do paciente/cuidador ou qualquer outra tela.

## Funcionalidades

- Consome o endpoint `GET /pontos-saude-mapa`
- Renderiza os Pontos de Saúde cadastrados em um mapa interativo utilizando Leaflet
- Utiliza as coordenadas GeoJSON (`localizacao.coordinates`) retornadas pela API
- Autenticação das requisições por meio de JWT

## Tecnologias utilizadas

- React 19
- TypeScript
- Vite
- Leaflet
- React Leaflet

## Estrutura

```
src/
├── components/
│   └── MapaFarmacias.tsx
├── services/
│   └── api.ts
├── types/
│   └── pontoSaudeMapa.ts
├── App.tsx
└── main.tsx
```

## Como executar

Instale as dependências:
```bash
npm install
```

Inicie o projeto:
```bash
npm run dev
```

O backend deve estar em execução na porta configurada no arquivo `.env`.

Exemplo:
```
VITE_API_URL=http://localhost:3333
```

## Autenticação

As rotas da API utilizam autenticação JWT.
Durante o desenvolvimento, o token pode ser armazenado manualmente no navegador:

```javascript
localStorage.setItem('lembremed_token', 'SEU_TOKEN_AQUI');
```

## Fluxo da aplicação

1. O frontend envia uma requisição para `GET /pontos-saude-mapa`.
2. A API retorna os Pontos de Saúde cadastrados no MongoDB.
3. Os dados são convertidos em marcadores no mapa utilizando React Leaflet.