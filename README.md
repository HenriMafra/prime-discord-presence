# Prime Discord Presence

Extensão de Firefox que envia o que você está assistindo na **Amazon Prime Video** para um Rich Presence do **Discord**.

## Como funciona

1. **`content.js`** roda na página da Prime Video, lê o elemento `<video>` e o título do conteúdo, e envia um update a cada 5 segundos (título, tempo atual, duração, estado de pause/play).
2. **`background.js`** mantém uma conexão WebSocket com um servidor local (`ws://localhost:31415`) e repassa esses updates.
3. **`server.js`** recebe esses dados via WebSocket e atualiza o Rich Presence do Discord usando [`@xhayper/discord-rpc`](https://github.com/xhayper/discord-rpc).

```text
Prime Video (content.js) --> background.js --(WebSocket)--> server.js --> Discord RPC
```

## Status do projeto

- ✅ Extensão de Firefox (Manifest V3) funcional, capturando dados do player.
- ✅ Servidor local (`server.js`) que consome os dados via WebSocket e atualiza o Discord.

## Rodando o servidor local

1. Crie uma "Application" gratuita em [Discord Developer Portal](https://discord.com/developers/applications) e copie o **Client ID**.
2. Copie `.env.example` para `.env` e preencha `DISCORD_CLIENT_ID` com esse ID.
3. Instale as dependências e rode:

   ```sh
   npm install
   npm start
   ```
4. Deixe o Discord aberto no PC e o servidor rodando enquanto assiste à Prime Video com a extensão instalada.

## Testando a extensão localmente no Firefox

1. Abra `about:debugging#/runtime/this-firefox`.
2. Clique em **"Load Temporary Add-on..."**.
3. Selecione o arquivo `manifest.json` deste repositório.
4. Acesse [primevideo.com](https://www.primevideo.com) e dê play em algum conteúdo.

> A extensão carregada assim é temporária e é removida ao fechar o Firefox.

## Permissões

- `scripting` e acesso a `*.primevideo.com` / `*.amazon.com` para ler informações do player.
- Nenhum dado é enviado para servidores externos — apenas para `localhost`.
