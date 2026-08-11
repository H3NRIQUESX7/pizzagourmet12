# Pizza Gourmet — Cardápio Digital

Projeto pronto para implantação na Vercel.

## Stack
- HTML
- TypeScript
- DOM nativo
- Sem framework
- Sem arquivo CSS

## Estrutura
```text
.
├── public/
│   ├── assets/
│   │   └── cardapio.png
│   └── index.html
├── src/
│   └── app.ts
├── .gitignore
├── package.json
├── tsconfig.json
└── vercel.json
```

## Deploy pela Vercel
1. Suba esta pasta para a raiz do repositório GitHub.
2. Na Vercel, escolha **Add New > Project**.
3. Importe o repositório.
4. Framework Preset: **Other**.
5. Não altere Root Directory se estes arquivos estiverem na raiz do repositório.
6. Clique em **Deploy**.

A própria Vercel executará:
```bash
npm install
npm run build
```

O TypeScript será compilado para `public/dist/app.js`, e a pasta `public` será publicada.

## Atualizar o GitHub
```bash
git add .
git commit -m "feat: prepara cardapio para deploy na vercel"
git push origin main
```
