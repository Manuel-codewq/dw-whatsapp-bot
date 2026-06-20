const express = require("express");
const app = express();
app.use(express.json());

const EVOLUTION_URL  = process.env.EVOLUTION_API_URL  || "https://evolution-api-production-59ec.up.railway.app";
const EVOLUTION_KEY  = process.env.EVOLUTION_API_KEY  || "DynamicWorks2025@API";
const INSTANCE       = process.env.EVOLUTION_INSTANCE || "DynamicWorks";
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;
const GROUP_LINK     = "https://chat.whatsapp.com/KpoqJd7os526c59DQ8eRXe";

const MENU = `👋 Olá! Bem-vindo ao suporte da *Dynamic Works* 📈

Escolhe uma opção:

1️⃣ Como criar conta?
2️⃣ Como depositar?
3️⃣ Como negociar?
4️⃣ Bónus e promoções
5️⃣ Grupo de aulas gratuitas
6️⃣ Falar com suporte humano

_Responde com o número da opção ou faz a tua pergunta directamente._`;

const RESPOSTAS = {
  "1": `📝 *Como criar conta na Dynamic Works:*\n\n1. Acede a https://dynamicworks.ao/register\n2. Insere o teu NIF (Bilhete de Identidade)\n3. Preenche o email e senha\n4. Confirma o email\n5. Pronto! Tens 10.000 AOA de bónus demo 🎉`,
  "2": `💰 *Como depositar:*\n\nAceitamos *USDT (TRC20)*:\n1. Na plataforma clica em "Depositar"\n2. Copia o endereço da carteira\n3. Envia USDT (mínimo $5)\n4. O saldo é creditado automaticamente\n\n_Suporte: +244 921 825 299_`,
  "3": `📊 *Como negociar:*\n\n1. Escolhe um par (EUR/USD, BTC/USD...)\n2. Analisa o gráfico\n3. Define o valor da aposta\n4. Clica ⬆️ SUBIR ou ⬇️ DESCER\n5. Aguarda o resultado em 30s a 5min\n\n💡 Começa no modo *Demo* para praticar!\n\n${GROUP_LINK}`,
  "4": `🎁 *Bónus e promoções:*\n\n✅ 10.000 AOA demo ao registar\n✅ Bónus por cada amigo referido\n✅ Promoções especiais para traders activos\n\n_Acede à plataforma para ver promoções actuais!_`,
  "5": `📚 *Grupo de aulas gratuitas:*\n\nJunta-te ao grupo onde partilhamos estratégias e análises todos os dias!\n\n👇\n${GROUP_LINK}\n\n_É gratuito e aberto a todos!_ 🚀`,
  "6": `👨‍💼 *Suporte humano:*\n\n📞 WhatsApp: *+244 921 825 299*\n🌐 https://dynamicworks.ao\n\n_Horário: Segunda a Sexta, 08h-18h_`,
};

const SAUDACAO = /^(ol[aá]|oi|bom dia|boa tarde|boa noite|menu|ajuda|help|start|hello|hi)\b/i;

async function enviarMensagem(para, texto) {
  try {
    await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
      method: "POST",
      headers: { "apikey": EVOLUTION_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: para, text: texto }),
    });
  } catch (e) {
    console.error("[Bot] Erro ao enviar:", e.message);
  }
}

async function respostaIA(mensagem, nome) {
  if (!ANTHROPIC_KEY) return "Não consigo responder agora. Contacta o suporte: +244 921 825 299";
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
        system: `És o assistente virtual da Dynamic Works, plataforma angolana de trading de opções binárias.

O QUE A DYNAMIC WORKS OFERECE:
- Trading de opções binárias (SUBIR ou DESCER)
- Pares disponíveis: Forex (EUR/USD, GBP/USD, USD/JPY, etc.), Criptomoedas (BTC/USD, ETH/USD), Metais (Prata, Platina, Paládio) e Índices Sintéticos OTC disponíveis 24/7
- Conta demo gratuita com 10.000 AOA para praticar sem risco
- Depósitos apenas em USDT (TRC20), mínimo $5
- Payout (lucro) até 85% por operação ganha
- Tempos de expiração: 30 segundos a 5 minutos
- Website: https://dynamicworks.ao
- Grupo de aulas gratuitas: ${GROUP_LINK}
- Suporte: +244 921 825 299
- Desenvolvida pela Digikap Lda

O QUE NÃO OFERECE (não inventes):
- Não aceita depósitos em kwanzas, transferência bancária, M-Pesa ou outros métodos além de USDT
- Não tem aplicação móvel (só website)
- Não oferece alavancagem, forex tradicional, acções ou futuros
- Não tem saques instantâneos (processamento manual)

REGRAS:
- Responde SEMPRE em português de Angola
- Sê curto e directo (máximo 3-4 frases)
- Se não souberes algo com certeza, diz "Não tenho essa informação, contacta o suporte: +244 921 825 299"
- NUNCA inventes funcionalidades ou serviços que não estão listados acima`,
        messages: [{ role: "user", content: nome ? `[${nome}]: ${mensagem}` : mensagem }],
      }),
    });
    const data = await res.json();
    return data?.content?.[0]?.text || "Não entendi. Escreve *menu* para ver as opções.";
  } catch (e) {
    console.error("[Bot] Erro IA:", e.message);
    return "Ocorreu um erro. Escreve *menu* para ver as opções ou contacta +244 921 825 299";
  }
}

async function processarMensagem(de, texto, nome) {
  const t = texto.trim();
  if (SAUDACAO.test(t)) return enviarMensagem(de, MENU);
  if (RESPOSTAS[t])     return enviarMensagem(de, RESPOSTAS[t]);
  const resposta = await respostaIA(t, nome);
  await enviarMensagem(de, resposta);
}

app.get("/", (_, res) => res.json({ ok: true, service: "DynamicWorks WhatsApp Bot" }));

app.post("/webhook", (req, res) => {
  res.json({ ok: true });
  const { event, data } = req.body || {};
  if (event !== "messages.upsert") return;
  if (data?.key?.fromMe) return;
  const jid = data?.key?.remoteJid || "";
  if (jid.endsWith("@g.us")) return;
  const de   = jid.replace("@s.whatsapp.net", "");
  const text = data?.message?.conversation || data?.message?.extendedTextMessage?.text || "";
  if (!de || !text.trim()) return;
  processarMensagem(de, text, data?.pushName).catch(console.error);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Bot a correr na porta ${PORT}`));
