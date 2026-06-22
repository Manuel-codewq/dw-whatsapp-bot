const express = require("express");
const app = express();
app.use(express.json());

const EVOLUTION_URL  = process.env.EVOLUTION_API_URL  || "https://evolution-api-production-59ec.up.railway.app";
const EVOLUTION_KEY  = process.env.EVOLUTION_API_KEY  || "DynamicWorks2025@API";
const INSTANCE       = process.env.EVOLUTION_INSTANCE || "DynamicWorks";
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;
const GROUP_LINK     = "https://chat.whatsapp.com/KpoqJd7os526c59DQ8eRXe";

const MENU = `Olá! Bem-vindo ao suporte da Dynamic Works 📈

Escolhe uma opção:

1 - Como criar conta?
2 - Como depositar?
3 - Como negociar?
4 - Bónus e promoções
5 - Grupo de aulas gratuitas
6 - Falar com suporte humano

Responde com o número da opção ou faz a tua pergunta directamente.`;

const RESPOSTAS = {
  "1": `Para criar conta na Dynamic Works é simples:

1. Acede a https://dynamicworks.ao/register
2. Insere o teu NIF (Bilhete de Identidade)
3. Preenche o email e a senha
4. Confirma o email
5. Pronto! Recebes 10.000 Kz de bónus demo para praticar 🎉`,

  "2": `Para fazer um depósito:

1. Acede a https://dynamicworks.ao/wallet
2. Clica em Depositar
3. Escolhe o valor em Kwanzas (mínimo 5.000 Kz)
4. Selecciona o método de pagamento
5. Confirma com o código OTP enviado ao teu email
6. O admin aprova o depósito manualmente

Guarda sempre o comprovativo de pagamento. Qualquer dúvida contacta o suporte: +244 921 825 299`,

  "3": `Para negociar na plataforma:

1. Escolhe um par de moedas (EUR/USD, BTC/USD, etc.)
2. Analisa o gráfico
3. Define o valor da aposta
4. Clica em SUBIR ou DESCER
5. Aguarda o resultado (entre 30 segundos e 5 minutos)

Dica: começa no modo Demo para praticar sem risco antes de usar dinheiro real.

Entra no nosso grupo de aulas para aprender mais: ${GROUP_LINK}`,

  "4": `Bónus e promoções disponíveis:

- 10.000 Kz de bónus demo ao criar conta
- Bónus por cada amigo que convidares
- Promoções especiais para traders activos

Acede à plataforma para ver as promoções actuais: https://dynamicworks.ao`,

  "5": `Temos um grupo gratuito no WhatsApp onde partilhamos estratégias, análises e dicas de trading todos os dias.

Entra aqui: ${GROUP_LINK}

É completamente gratuito e aberto a todos!`,

  "6": `Podes falar com a nossa equipa de suporte através do WhatsApp: +244 921 825 299

Horário de atendimento: Segunda a Sexta, das 08h às 18h.

Também podes visitar o site: https://dynamicworks.ao`,
};

const SAUDACAO = /^(ol[aá]|oi|bom dia|boa tarde|boa noite|menu|ajuda|help|start|hello|hi)\b/i;
const GRUPO_AULAS = "120363427340812730@g.us";

// --- Protecção anti-spam ---

// IDs de mensagens já processadas (evita duplicados da Evolution API)
const mensagensProcessadas = new Set();
setInterval(() => mensagensProcessadas.clear(), 10 * 60 * 1000);

// Cooldown por utilizador: só responde 1 vez por minuto
const cooldownUtilizadores = new Map();
const COOLDOWN_MS = 60 * 1000;

function emCooldown(numero) {
  const ultimo = cooldownUtilizadores.get(numero);
  return ultimo ? Date.now() - ultimo < COOLDOWN_MS : false;
}

function marcarCooldown(numero) {
  cooldownUtilizadores.set(numero, Date.now());
  setTimeout(() => cooldownUtilizadores.delete(numero), COOLDOWN_MS);
}

// Fila global: mínimo 4 segundos entre mensagens enviadas
let filaEnvio = Promise.resolve();
const delay = ms => new Promise(r => setTimeout(r, ms));

async function enviarMensagem(para, texto) {
  filaEnvio = filaEnvio.then(async () => {
    try {
      await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
        method: "POST",
        headers: { "apikey": EVOLUTION_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ number: para, text: texto }),
      });
      console.log(`[Bot] Enviado para ${para}`);
    } catch (e) {
      console.error("[Bot] Erro ao enviar:", e.message);
    }
    await delay(4000);
  });
  return filaEnvio;
}

async function respostaIA(mensagem, nome) {
  if (!ANTHROPIC_KEY) return "Nao consigo responder agora. Contacta o suporte: +244 921 825 299";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: `Es o assistente de suporte da Dynamic Works, plataforma angolana de trading de opcoes binarias.

O QUE A DYNAMIC WORKS OFERECE:
- Trading de opcoes binarias (SUBIR ou DESCER)
- Pares: Forex (EUR/USD, GBP/USD, USD/JPY, etc.), Criptomoedas (BTC/USD, ETH/USD), Metais (Prata, Platina, Paladio) e Indices Sinteticos OTC disponiveis 24/7
- Conta demo com 10.000 Kz para praticar sem risco
- Depositos em Kwanzas, minimo 5.000 Kz
- Levantamentos minimo 10.000 Kz, processamento em 1 a 3 dias uteis
- Payout ate 85% por operacao ganha
- Tempos de expiracao: 30 segundos a 5 minutos
- Depositos aprovados manualmente pelo admin
- KYC obrigatorio para levantamentos
- Website: https://dynamicworks.ao
- Grupo de aulas: ${GROUP_LINK}
- Suporte: +244 921 825 299

O QUE NAO OFERECE:
- Nao tem aplicacao movel
- Nao oferece alavancagem, forex tradicional, accoes ou futuros
- Nao tem saques instantaneos

REGRAS IMPORTANTES:
- Responde em portugues de Angola de forma natural e humana
- Nao uses asteriscos, negrito, italico nem qualquer formatacao markdown
- Nao uses listas com traco ou ponto quando podes escrever em texto corrido
- Fala como uma pessoa real, de forma curta e directa (maximo 3-4 frases)
- Se nao souberes, diz: Nao tenho essa informacao. Podes contactar o suporte pelo +244 921 825 299
- NUNCA inventes funcionalidades`,
        messages: [{ role: "user", content: nome ? `[${nome}]: ${mensagem}` : mensagem }],
      }),
    });
    const data = await res.json();
    return data?.content?.[0]?.text || "Nao entendi. Escreve menu para ver as opcoes.";
  } catch (e) {
    console.error("[Bot] Erro IA:", e.message);
    return "Ocorreu um erro. Escreve menu para ver as opcoes ou contacta +244 921 825 299";
  }
}

async function processarMensagem(de, texto, nome) {
  if (emCooldown(de)) {
    console.log(`[Bot] Cooldown activo para ${de} — ignorado`);
    return;
  }
  marcarCooldown(de);
  const t = texto.trim();
  if (SAUDACAO.test(t)) return enviarMensagem(de, MENU);
  if (RESPOSTAS[t])     return enviarMensagem(de, RESPOSTAS[t]);
  const resposta = await respostaIA(t, nome);
  await enviarMensagem(de, resposta);
}

app.get("/", (_, res) => res.json({ ok: true, service: "DynamicWorks WhatsApp Bot" }));

async function boasVindasGrupo(participantes) {
  for (const jid of participantes) {
    const numero = jid.replace("@s.whatsapp.net", "").replace("@lid", "");
    const msg = `Bem-vindo ao grupo de aulas da Dynamic Works! 🎉

Aqui vais aprender a negociar opções binárias de forma segura e rentável.

Para começar, cria a tua conta gratuita em https://dynamicworks.ao e recebes 10.000 Kz de bónus demo para praticar.

Qualquer dúvida podes falar connosco em privado ou aqui no grupo. Boas-vindas!`;
    await enviarMensagem(numero, msg);
  }
}

app.post("/webhook", (req, res) => {
  res.json({ ok: true });
  const { event, data } = req.body || {};

  // Boas-vindas quando alguém entra no grupo de aulas (suporta ambos os formatos)
  const evUp = (event || "").toUpperCase().replace(/\./g, "_");
  if (evUp === "GROUPS_PARTICIPANTS_UPSERT" || evUp === "GROUP_PARTICIPANTS_UPDATE") {
    const grupoId = data?.id || data?.groupJid || "";
    const action  = data?.action || "";
    const participantes = data?.participants || [];
    if (grupoId === GRUPO_AULAS && action === "add" && participantes.length > 0) {
      boasVindasGrupo(participantes).catch(console.error);
    }
    return;
  }

  // Suporta evento em lowercase (messages.upsert) e uppercase (MESSAGES_UPSERT)
  const evNorm = (event || "").toLowerCase().replace(/_/g, ".");
  if (evNorm !== "messages.upsert") return;

  console.log("[Bot] Webhook recebido:", JSON.stringify({ event, keys: Object.keys(data || {}) }));

  // Evolution API v2 envia data.messages[] (array); v1 enviava directamente em data
  const msgs = Array.isArray(data?.messages) ? data.messages : [data];

  for (const msg of msgs) {
    if (!msg || msg?.key?.fromMe) continue;

    const msgId = msg?.key?.id;
    if (msgId) {
      if (mensagensProcessadas.has(msgId)) {
        console.log(`[Bot] Duplicado ignorado: ${msgId}`);
        continue;
      }
      mensagensProcessadas.add(msgId);
    }

    const jid = msg?.key?.remoteJid || "";
    if (jid.endsWith("@g.us")) continue;
    const de   = jid.replace("@s.whatsapp.net", "");
    const text = msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || "";
    console.log(`[Bot] Mensagem de ${de}: "${text}"`);
    if (!de || !text.trim()) continue;
    processarMensagem(de, text, msg?.pushName).catch(console.error);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Bot a correr na porta ${PORT}`));
