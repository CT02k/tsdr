"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("pt");

  useEffect(() => {
    const storedLang = localStorage.getItem("lang");

    if (storedLang) {
      setLanguage(storedLang);
    } else {
      const browserLang = navigator.language.toLowerCase();
      const detectedLang = browserLang.startsWith("pt") ? "pt" : "en";
      setLanguage(detectedLang);
      localStorage.setItem("lang", detectedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  

  const translations = {
    pt: {
      tagline: "Transforme textos simples em textos detalhados comicamente longos.",
      placeholder: "ex: vou dormir",
      buttonText: "Expandir",
      resultTitle: "Resultado expandido:",
      error: "Erro ao gerar texto expandido. Tente novamente.",
      footer: "Nem idéia do que colocar aqui •",
    },
    en: {
      tagline: "Transform simple texts into comically long detailed texts.",
      placeholder: "e.g.: going to sleep",
      buttonText: "Expand",
      resultTitle: "Expanded result:",
      error: "Error generating expanded text. Please try again.",
      footer: "Idk what to put here •",
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    setLoading(true);
    setOutput("");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input, language }),
      });
      
      if (!response.ok) {
        setOutput(translations[language as keyof typeof translations].error);
        throw new Error("Failed to generate expanded text");
      }
      
      const data = await response.json();
      const dataSeppareted = data.result.split(" ");

      function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      let result = "";

      for (const word of dataSeppareted) {
        result += (result ? " " : "") + word;
        setOutput(result);
        await sleep(100);
      }
      
      const outputSection = document.getElementById("outputSection");
      if (outputSection) outputSection.classList.remove("hidden");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  const t = translations[language as keyof typeof translations];

  return (
    <main>
      <header className="text-center my-10">
        <div className="absolute top-4 right-4">
          <button
            className="px-3 py-1 border border-blue-500 bg-blue-500 text-white rounded-l-md cursor-not-allowed transition"
          >
            {language === "pt" ? "PT" : "EN"}
          </button>
          <button 
            onClick={toggleLanguage} 
            className="px-3 py-1 border border-blue-500 text-white rounded-r-md cursor-pointer transition"
          >
            {language === "pt" ? "EN" : "PT"}
          </button>
        </div>
        <span className="text-xs">(too short, didn&apos;t read)</span>
        <h1 className="text-4xl font-bold mb-2 text-blue-500">TS;<span className="text-foreground">DR</span></h1>
        <p className="text-lg text-foreground">{t.tagline}</p>
      </header>

      <main className="w-full max-w-2xl mx-auto px-10">
        <form onSubmit={handleSubmit} className="flex flex-row border border-blue-500 rounded-xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            required
            placeholder={t.placeholder}
            className="p-3 w-full md:w-96 border-0 border-gray-300 focus:outline-none rounded-l-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white rounded-r-xl py-2 w-32 flex items-center justify-center font-semibold hover:bg-blue-600 transition cursor-pointer disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
          >
            {loading ? (<Image src={"/loading.svg"} alt="Loading..." width={32} height={32} />) : t.buttonText}
          </button>
        </form>

        <section id="outputSection" className={output ? "mt-6" : "mt-6 hidden"}>
          <h2 className="text-xl font-bold mb-2">{t.resultTitle}</h2>
          <div className="whitespace-pre-line p-4 rounded-xl border text-sm font-mono">
            {output}
          </div>
        </section>
      </main>

      <footer className="mt-10 text-xs text-gray-500 text-center">
        <a href="https://ct02.work" className="underline">ct02.work</a>
        <br />
        {t.footer} <a href="https://github.com/ct02k/tsdr" className="underline">GitHub</a>
      </footer>
    </main>
  );
}
