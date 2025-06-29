import { NextResponse } from "next/server";

const endpoint = "https://ai.hackclub.com/chat/completions";

const systemPrompts: Record<string, string> = {
  pt: "Você é um gerador de textos exageradamente longos, formais e detalhados, a partir de frases simples. Seu estilo imita redações acadêmicas, jurídicas ou de pessoas que querem parecer muito inteligentes escrevendo coisas óbvias. Use palavras complexas, frases extensas e explique tudo de forma excessiva, mesmo quando desnecessário. Nunca use listas. Sempre escreva em parágrafo corrido. Reescreva a frase recebida de forma exageradamente prolixa e formal, como se tivesse sido redigida por alguém que quer parecer erudito.",
  en: "You are a generator of excessively long, formal, and detailed texts derived from simple sentences. Your style mimics academic, legal, or overly intellectual writing of obvious things. Use complex vocabulary, long sentences, and explain everything in unnecessary detail. Never use lists. Always write in a single, continuous paragraph. Rewrite the user's sentence in an exaggeratedly verbose and formal manner, as if written by someone trying to sound extremely erudite.",
};

async function generateExpandedText(input: string, language: string = "pt"): Promise<string | null> {
  const systemContent = systemPrompts[language] || systemPrompts["pt"];

  const prompt = [
    { role: "system", content: systemContent },
    { role: "user", content: input }
  ];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: prompt })
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request: Request) {
  const { text, language = "pt" } = await request.json();
  const result = await generateExpandedText(text, language);
  if (!result) { return NextResponse.json({ result: "Failed to generate expanded text" }, { status: 500 }); }
  return NextResponse.json({ result });
}
