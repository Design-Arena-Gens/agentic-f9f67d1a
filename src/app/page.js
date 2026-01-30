"use client";

import { useEffect, useMemo, useState } from "react";

const QUESTIONS = [
  {
    id: "vision",
    label: "What kind of business are you building?",
    helper: "Share the product, industry, or problem you are solving.",
    placeholder: "Plant-based skincare for busy professionals",
  },
  {
    id: "tone",
    label: "What tone or personality should the name have?",
    helper: "Describe the vibe: bold, friendly, premium, playful, etc.",
    placeholder: "Bold and futuristic with a hint of luxury",
    suggestions: [
      "Bold & modern",
      "Friendly & warm",
      "Premium & elegant",
      "Playful & quirky",
    ],
  },
  {
    id: "keywords",
    label: "Any words or themes you absolutely love?",
    helper: "Comma separate short words, values, or feelings.",
    placeholder: "Glow, Ritual, Sustain, Ritual, Dawn",
  },
  {
    id: "audience",
    label: "Who is your ideal customer?",
    helper: "Focus on the audience, mindset, or community you serve.",
    placeholder: "Eco-conscious women in their 30s with demanding careers",
  },
  {
    id: "length",
    label: "How should the names feel length-wise?",
    helper: "Let me know if you prefer short, medium, or more descriptive names.",
    placeholder: "Short and memorable",
    suggestions: ["Short & punchy", "Balanced length", "Descriptive"],
  },
];

const NAMING_STYLES = [
  { id: "balanced", label: "Balanced Blend" },
  { id: "descriptive", label: "Descriptive" },
  { id: "inventive", label: "Inventive" },
];

const toneBuckets = {
  bold: ["Forge", "Pulse", "Axis", "Ignite", "Nova", "Frontier", "Surge", "Prime"],
  friendly: ["Bright", "Clover", "Neighbor", "Hearth", "Kindred", "Sprout", "Sunny"],
  luxe: ["Velvet", "Citrine", "Opal", "Marble", "Ivory", "Lumen", "Sable"],
  professional: ["Foundation", "Summit", "Crest", "Vector", "Vanguard", "Beacon", "Keystone"],
  playful: ["Fizz", "Doodle", "Jelly", "Moxie", "Glint", "Pop", "Whim"],
  balanced: ["Atlas", "North", "Arc", "Horizon", "Echo", "Canvas", "Harbor"],
};

const connectiveWords = [
  "Lab",
  "Co",
  "Collective",
  "Works",
  "Studio",
  "Partners",
  "Guild",
  "Circle",
  "Alliance",
  "Workshop",
  "Foundry",
];

const descriptiveSuffixes = ["Studio", "House", "Company", "Foundry", "Ideas", "Systems"];

const inventiveSuffixes = ["ly", "ium", "aro", "ora", "ify", "ique", "ity", "ster", "scape", "vio"];

function toTitleCase(word) {
  return word
    .toLowerCase()
    .replace(/(^|\s|-)\w/g, (match) => match.toUpperCase())
    .replace(/\bAnd\b/g, "and");
}

function extractWords(value) {
  return value
    .split(/[,\n]/)
    .flatMap((segment) => segment.split(/\s+/))
    .map((word) => word.replace(/[^a-zA-Z0-9-]/g, ""))
    .filter(Boolean);
}

function detectToneBucket(toneAnswer = "") {
  const tone = toneAnswer.toLowerCase();
  if (/lux|premium|elegant|refined|upscale|luxe/.test(tone)) return "luxe";
  if (/play|fun|quirky|whimsical|creative/.test(tone)) return "playful";
  if (/friendly|warm|approachable|kind/.test(tone)) return "friendly";
  if (/bold|modern|futur|disrupt|edgy|strong/.test(tone)) return "bold";
  if (/professional|corporate|trusted|serious/.test(tone)) return "professional";
  return "balanced";
}

function createSeededRandom(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blendInventive(base, suffix) {
  if (!base) return null;
  const cleaned = base.replace(/[^a-zA-Z]/g, "");
  if (!cleaned) return null;
  const trimmed = cleaned.length > 6 ? cleaned.slice(0, 6) : cleaned;
  return toTitleCase(trimmed + suffix);
}

function generateNameIdeas(answers, namingStyle) {
  const seed = Object.values(answers).join("|");
  const random = createSeededRandom(seed || "default");
  const toneCategory = detectToneBucket(answers.tone);

  const rawWords = [
    ...(answers.vision ? extractWords(answers.vision) : []),
    ...(answers.keywords ? extractWords(answers.keywords) : []),
    ...(answers.audience ? extractWords(answers.audience) : []),
  ];

  const uniqueWords = Array.from(
    new Set(rawWords.map((word) => toTitleCase(word))),
  );

  const baseWords =
    uniqueWords.length > 0 ? uniqueWords : ["Venture", "Origin", "Nexus"];

  const toneModifiers = toneBuckets[toneCategory] ?? toneBuckets.balanced;
  const modifiers = [
    ...toneModifiers,
    ...toneBuckets.balanced.slice(0, 3),
  ].map(toTitleCase);

  const names = new Set();

  function addName(name) {
    const trimmed = name.replace(/\s+/g, " ").trim();
    if (!trimmed) return;
    names.add(trimmed);
  }

  const lengthPreference = (answers.length || "").toLowerCase();
  const preferShort = /short|brief|punchy|minimal/.test(lengthPreference);
  const preferDescriptive = /long|descriptive|detailed|story/.test(lengthPreference);

  baseWords.forEach((baseWord, index) => {
    const modifier = modifiers[index % modifiers.length];
    if (namingStyle !== "inventive") {
      addName(`${modifier} ${baseWord}`);
    }
    if (namingStyle !== "inventive" && !preferShort) {
      const connector = connectiveWords[index % connectiveWords.length];
      addName(`${baseWord} ${connector}`);
      addName(`${modifier} ${baseWord} ${connector}`);
    }
    if (namingStyle === "descriptive" || preferDescriptive) {
      const descriptor = descriptiveSuffixes[index % descriptiveSuffixes.length];
      addName(`${baseWord} ${descriptor}`);
    }
    if (namingStyle === "inventive" || preferShort) {
      const suffix = inventiveSuffixes[index % inventiveSuffixes.length];
      const invented = blendInventive(baseWord, suffix);
      if (invented) addName(invented);
      const modifierInvented = blendInventive(modifier, suffix);
      if (modifierInvented) addName(modifierInvented);
    }
  });

  if (names.size < 10) {
    for (let i = 0; i < modifiers.length; i += 1) {
      for (let j = 0; j < baseWords.length; j += 1) {
        if (i === j) continue;
        addName(`${modifiers[i]} ${baseWords[j]}`);
        if (preferDescriptive) {
          const descriptor = descriptiveSuffixes[(i + j) % descriptiveSuffixes.length];
          addName(`${modifiers[i]} ${baseWords[j]} ${descriptor}`);
        }
      }
    }
  }

  const generated = Array.from(names);

  for (let i = generated.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [generated[i], generated[j]] = [generated[j], generated[i]];
  }

  const filtered = generated.filter((name) => {
    if (preferShort) return name.replace(/\s+/g, "").length <= 12;
    if (preferDescriptive) return name.split(" ").length >= 2;
    return true;
  });

  return (preferShort ? filtered : generated).slice(0, 12);
}

function buildInsights(answers) {
  const insights = [];
  if (answers.vision) {
    insights.push({
      title: "Business Focus",
      detail: answers.vision,
    });
  }
  if (answers.tone) {
    insights.push({
      title: "Voice & Personality",
      detail: answers.tone,
    });
  }
  if (answers.audience) {
    insights.push({
      title: "Audience",
      detail: answers.audience,
    });
  }
  if (answers.keywords) {
    insights.push({
      title: "Key Themes",
      detail: answers.keywords,
    });
  }
  return insights;
}

export default function Home() {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [namingStyle, setNamingStyle] = useState("balanced");
  const [copiedName, setCopiedName] = useState("");

  const activeQuestion =
    editingId != null
      ? QUESTIONS.find((q) => q.id === editingId)
      : QUESTIONS[currentIndex] ?? null;

  const answeredQuestions = QUESTIONS.filter((question) => answers[question.id]);
  const isComplete = answeredQuestions.length === QUESTIONS.length;

  const ideas = useMemo(() => {
    if (answeredQuestions.length === 0) return [];
    return generateNameIdeas(answers, namingStyle);
  }, [answers, namingStyle, answeredQuestions.length]);

  const insights = useMemo(() => buildInsights(answers), [answers]);

  useEffect(() => {
    if (!copiedName) return undefined;
    const timeout = setTimeout(() => setCopiedName(""), 2000);
    return () => clearTimeout(timeout);
  }, [copiedName]);

  const commitAnswer = (value) => {
    const question = activeQuestion;
    if (!question) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    setAnswers((prev) => ({
      ...prev,
      [question.id]: trimmed,
    }));
    if (editingId == null) {
      setCurrentIndex((prev) => Math.min(prev + 1, QUESTIONS.length));
    } else {
      setEditingId(null);
    }
    setInputValue("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    commitAnswer(inputValue);
  };

  const handleCopy = async (name) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
    } catch (error) {
      console.error("Failed to copy name:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-emerald-100 text-slate-900">
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Brand Name Co-Pilot
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Let&apos;s co-create the perfect business name.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Answer a few thoughtful prompts and I&apos;ll craft tailored name ideas with the right vibe,
            length, and story for your brand.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-100 backdrop-blur">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Discovery Journey
              </p>
              <p className="text-sm text-slate-600">
                Step {Math.min(currentIndex + 1, QUESTIONS.length)} of {QUESTIONS.length}
              </p>
            </div>

            <div className="space-y-4">
              {answeredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm shadow-inner"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-700">{question.label}</span>
                    <button
                      type="button"
                      className="text-xs font-medium text-emerald-600 transition hover:text-emerald-700"
                      onClick={() => {
                        setEditingId(question.id);
                        setInputValue(answers[question.id] ?? "");
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-2 text-slate-600">{answers[question.id]}</p>
                </div>
              ))}
            </div>

            {activeQuestion ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-3xl border border-dashed border-emerald-200 bg-white/90 p-4 shadow-inner"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{activeQuestion.label}</p>
                  <p className="text-xs text-slate-500">{activeQuestion.helper}</p>
                </div>

                <textarea
                  className="w-full rounded-2xl border border-emerald-200 bg-white/60 p-3 text-sm shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  rows={activeQuestion.id === "vision" ? 3 : 2}
                  placeholder={activeQuestion.placeholder}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                />

                {activeQuestion.suggestions && (
                  <div className="flex flex-wrap gap-2">
                    {activeQuestion.suggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                        onClick={() => commitAnswer(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    {editingId ? "Save answer" : "Next"}
                  </button>
                  <span className="text-xs text-slate-400">
                    Press Enter to continue
                  </span>
                </div>
              </form>
            ) : (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm">
                <p className="font-semibold text-emerald-700">Discovery complete!</p>
                <p className="mt-1 text-emerald-600">
                  Explore the tailored name ideas on the right and refine the style any time.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
                  Name Exploration
                </p>
                <h2 className="text-2xl font-semibold text-slate-800">Curated ideas for your brand</h2>
              </div>

              <div className="flex gap-2 rounded-full bg-slate-100 p-1">
                {NAMING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setNamingStyle(style.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      namingStyle === style.id
                        ? "bg-white text-emerald-600 shadow"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {insights.length > 0 && (
              <div className="grid gap-3 rounded-2xl bg-slate-50/90 p-4 md:grid-cols-2">
                {insights.map((insight) => (
                  <div key={insight.title} className="space-y-1 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {insight.title}
                    </p>
                    <p className="text-slate-600">{insight.detail}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {ideas.length === 0 ? (
                <div className="col-span-2 rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-slate-500">
                  <p className="text-lg font-semibold text-slate-600">I&apos;m ready when you are.</p>
                  <p className="mt-2 text-sm">
                    Start answering the discovery prompts to see names tailored to your business.
                  </p>
                </div>
              ) : (
                ideas.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-transparent bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-emerald-50/40 hover:ring-emerald-200"
                  >
                    <div>
                      <p className="text-lg font-semibold text-slate-800">{name}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
                        {namingStyle === "inventive"
                          ? "Invented identity"
                          : namingStyle === "descriptive"
                            ? "Descriptive clarity"
                            : "Balanced impact"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(name)}
                      className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      {copiedName === name ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))
              )}
            </div>

            {isComplete && ideas.length > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm text-emerald-700">
                <p className="font-semibold">Need more rounds?</p>
                <p className="mt-1">
                  Adjust any answer on the left or switch the style above to instantly regenerate fresh directions.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
