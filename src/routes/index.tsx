import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import portrait from "@/assets/author-portrait.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krishna Mudgal — A Portfolio: A Research Perspective" },
      {
        name: "description",
        content:
          "Academic-paper styled portfolio of Krishna Mudgal: deep learning, sequence modeling, graph neural networks and reproducibility research.",
      },
      { property: "og:title", content: "Krishna Mudgal — A Research Perspective" },
      {
        property: "og:description",
        content:
          "AI & ML developer working on memory-augmented architectures, GNNs for genomics, and reproducibility studies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "contact", label: "Contact" },
];

const BIBTEX = `@misc{mudgal2026portfolio,
  author = {Krishna Mudgal},
  title  = {A Portfolio of Krishna Mudgal: A Research Perspective},
  year   = {2026},
  note   = {github.com/krishnamudgal}
}`;

function useScrollSpy() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const onScroll = () => {
      let current = "home";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 140) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return active;
}

function Reveal({ children, as: As = "section", ...rest }: any) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <As ref={ref} className={`reveal ${rest.className ?? ""}`} {...rest}>
      {children}
    </As>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-3 text-[0.95rem] font-bold uppercase tracking-[0.14em]">
      {children}
      <span className="mt-1 block h-[2px] w-full bg-marker-strong" />
    </h2>
  );
}

function Nav() {
  const active = useScrollSpy();
  return (
    <header className="sticky top-0 z-50 border-b border-ink/30 bg-paper/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 sm:px-10">
        <span className="hidden shrink-0 text-[0.78rem] italic text-ink/70 sm:block">
          Preprint. Under review.
        </span>
        <nav className="-mx-1 flex w-full items-center gap-2 overflow-x-auto px-1 sm:w-auto sm:justify-end">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`paper-tab shrink-0 no-underline ${active === s.id ? "bg-marker" : ""}`}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function FigurePlot({ variant }: { variant: number }) {
  return (
    <div className="flex h-40 w-full items-center justify-center border border-ink/40 bg-[#EFEADC]">
      <svg viewBox="0 0 200 100" className="h-32 w-11/12" role="img" aria-label="Figure placeholder plot">
        <g stroke="#111" strokeWidth="0.8" fill="none" opacity="0.75">
          <line x1="20" y1="85" x2="190" y2="85" />
          <line x1="20" y1="10" x2="20" y2="85" />
          {variant === 1 && <path d="M20 80 C60 70, 80 30, 120 28 S170 20, 190 16" strokeWidth="1.4" />}
          {variant === 2 && (
            <>
              <circle cx="60" cy="40" r="8" />
              <circle cx="110" cy="25" r="8" />
              <circle cx="100" cy="65" r="8" />
              <circle cx="155" cy="50" r="8" />
              <path d="M68 40 L102 27 M66 46 L94 60 M107 68 L148 54 M117 30 L148 45" />
            </>
          )}
          {variant === 3 &&
            [0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={35 + i * 30} y={85 - (20 + i * 12)} width="18" height={20 + i * 12} fill="#111" opacity="0.18" />
            ))}
          {variant === 4 && (
            <>
              <path d="M20 70 C60 40, 90 78, 130 40 S175 55, 190 30" strokeWidth="1.2" />
              <path d="M20 55 C55 65, 95 30, 135 62 S172 30, 190 48" strokeDasharray="3 3" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

function PeelFigure() {
  return (
    <div className="peel-card relative">
      <div className="relative overflow-hidden border border-ink/50 bg-paper p-3">
        <FigurePlot variant={1} />
        <div
          className="peel-shadow pointer-events-none absolute right-0 top-0 h-[70px] w-[70px] opacity-25 transition-all duration-300"
          style={{ background: "radial-gradient(circle at top right, rgba(0,0,0,0.5), transparent 70%)" }}
        />
        <div
          className="peel-corner pointer-events-none absolute right-0 top-0 h-[70px] w-[70px]"
          style={{
            background:
              "linear-gradient(225deg, #EDE7D6 0%, #F7F2E3 30%, #FAF6EC 55%, #DCD4BE 80%, #BDB49C 100%)",
            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
            boxShadow: "-6px 6px 10px rgba(0,0,0,0.35)",
          }}
        />
      </div>
    </div>
  );
}

const FIGURES = [
  {
    n: 1,
    title: "Titans Architecture — From Scratch Reproduction",
    meta: "PyTorch, Transformers, Memory-Augmented LMs — 2026",
    body: "Reproduced Google DeepMind's Titans architecture implementing all four core variants: MAC (Memory as Context), MAG (Memory as Gate), MAL (Memory as Layer), and LMM (Long-term Memory Module). Conducted ablation studies across memory configurations to benchmark contextual retention and generation quality.",
  },
  {
    n: 2,
    title: "GEN-RESIST — Antimicrobial Resistance (AMR) Prediction",
    meta: "GNN, GAT, PyTorch, NCBI, CARD — 2025",
    body: "Built a deep learning pipeline using Graph Neural Networks and Graph Attention Networks to predict antibiotic resistance genes directly from genome sequences, achieving 83% accuracy. Deployed via a Firebase REST API with the inference model hosted on HuggingFace Spaces and a React frontend. GitHub: mudgalKrishna/GEN-RESIST.",
  },
  {
    n: 3,
    title: "Pretrained Models",
    meta: "PyTorch, Transformers, Diffusion LMs — 2025",
    body: "Trained multiple language and vision models from scratch — GPT-2-style, LLaMA-style, and DeepSeek-style LMs on Shakespeare, BookCorpus, and WikiText, plus ViTs on CIFAR-100 and Tiny-ImageNet. Implemented a Diffusion Language Model (DLM) from scratch based on the LLaDA paper. Models are live on HuggingFace for public inference.",
  },
  {
    n: 4,
    title: "HackLLM — Hallucination Detection Pipeline",
    meta: "RAG, Mistral-7B, DeBERTa — 2024–2025",
    body: "Built an LLM hallucination detection pipeline using RAG-based verification; placed in the top 50 of 110 teams at IIIT Delhi's HackLLM.",
  },
];

function Index() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-desk py-0 sm:py-10">
      <main className="paper-sheet mx-auto max-w-5xl">
        <Nav />

        <div className="px-5 pb-16 pt-8 sm:px-14">
          {/* Title block */}
          <Reveal id="home" className="reveal">
            <h1 className="mx-auto max-w-3xl text-center text-3xl font-bold leading-tight sm:text-[2.6rem]">
              A Portfolio of Krishna Mudgal:
              <br />A Research Perspective
            </h1>
            <p className="mt-5 text-center text-sm uppercase tracking-[0.22em]">Krishna Mudgal</p>
            <p className="mt-2 text-center text-[0.86rem] italic">
              New Delhi, India · <a className="underline" href="tel:+919650317583">+91-96503-17583</a> ·{" "}
              <a className="underline" href="mailto:mudgalkrishna92@gmail.com">mudgalkrishna92@gmail.com</a> ·{" "}
              <a className="underline" href="https://linkedin.com/in/krishnamudgal" target="_blank" rel="noreferrer">
                linkedin.com/in/krishnamudgal
              </a>{" "}
              ·{" "}
              <a className="underline" href="https://github.com/krishnamudgal" target="_blank" rel="noreferrer">
                github.com/krishnamudgal
              </a>
            </p>
            <div className="mx-auto mt-5 h-[2px] w-full bg-marker-strong" />

            <div className="mx-auto mt-7 max-w-3xl px-2 sm:px-12">
              <h2 className="text-center text-[0.9rem] font-bold uppercase tracking-[0.2em]">Abstract</h2>
              <p className="justify-paper mt-2 text-[0.95rem] leading-[1.55]">
                AI &amp; ML developer with a focus on deep learning, sequence modeling, and generative AI. This
                portfolio presents a candidate research profile centered on building systems from first principles and
                understanding why they work — spanning memory-augmented architectures, graph neural networks for
                genomics, and reproducibility studies in deep learning. Interested in how models learn, adapt, and
                generalize, especially in settings where data is sparse or the problem is genuinely novel.
              </p>
              <p className="mt-4 text-[0.9rem] leading-[2.1]">
                <span className="font-bold">Keywords:</span>{" "}
                {["deep learning", "sequence modeling", "generative AI", "graph neural networks", "reproducibility research"].map(
                  (k) => (
                    <span key={k} className="marker mr-2 whitespace-nowrap">
                      {k}
                    </span>
                  ),
                )}
              </p>
            </div>
          </Reveal>

          {/* Two-column body */}
          <div className="mt-12 sm:[column-count:2] sm:[column-gap:2.6rem]">
            <Reveal as="div" className="reveal break-inside-avoid">
              <SectionHeading>2 Education</SectionHeading>
              <p className="justify-paper text-[0.95rem]">
                <span className="font-bold">Maharaja Agrasen Institute of Technology (MAIT), GGSIPU</span> — New Delhi,
                India. <span className="italic">B.Tech in Computer Science &amp; Technology | CGPA: 9.0</span> — 2024–2028.
              </p>
            </Reveal>

            <Reveal as="div" id="experience" className="reveal mt-8 break-inside-avoid">
              <SectionHeading>3 Experience</SectionHeading>

              {[
                {
                  head: "MindoraxAI Labs — Remote — AI Intern",
                  date: "2026",
                  items: [
                    "Worked on a research-focused reproduction effort, replicating the methodology and core experiments of a published deep learning paper end-to-end in PyTorch.",
                    "Validated reproduced results against reported benchmarks and ran ablations to test sensitivity of findings to architectural and training choices.",
                  ],
                },
                {
                  head: "RL Hackathon, IIT Delhi",
                  date: "2024",
                  items: [
                    "Applied reinforcement learning to a sequential decision-making problem; demonstrated strong grasp of policy optimization and reward shaping.",
                  ],
                },
                {
                  head: "HackLLM, IIIT Delhi",
                  date: "2024–2025",
                  items: [
                    "Built an LLM hallucination detection pipeline using RAG-based verification with Mistral-7B and DeBERTa; Top 50 of 110 teams.",
                  ],
                },
              ].map((r) => (
                <div key={r.head} className="mb-4 break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[0.95rem] font-bold">{r.head}</h3>
                    <span className="shrink-0 text-[0.85rem] italic">{r.date}</span>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {r.items.map((i) => (
                      <li key={i} className="justify-paper pl-4 -indent-4 text-[0.92rem] leading-[1.5]">
                        — {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          </div>

          {/* Projects */}
          <Reveal id="projects" className="reveal mt-12">
            <SectionHeading>4 Projects</SectionHeading>
            <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2">
              {FIGURES.map((f) => (
                <figure key={f.n}>
                  {f.n === 1 ? (
                    <PeelFigure />
                  ) : (
                    <div className="border border-ink/50 bg-paper p-3">
                      <FigurePlot variant={f.n} />
                    </div>
                  )}
                  <figcaption className="mt-2 text-[0.82rem] leading-[1.45]">
                    <span className="font-bold">
                      Figure {f.n}: {f.title}.
                    </span>{" "}
                    <span className="italic">{f.meta}.</span> <span className="justify-paper">{f.body}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>

          {/* Research */}
          <Reveal id="research" className="reveal mt-12">
            <SectionHeading>5 Research &amp; Technical Writing</SectionHeading>
            <ol className="mt-3 space-y-3 text-[0.86rem] leading-[1.45]">
              <li className="pl-8 -indent-8">
                [1] Swain, T., Malik, K., Mudgal, K., Makhija, Y. “How Far Does Generalized Symmetry Alignment Reach?
                Reproducing and Extending Linear Mode Connectivity for Transformers.” <span className="italic">OpenReview</span>,
                2025. — A reproducibility and extension study on Generalized Linear Mode Connectivity for Vision
                Transformers and GPT-2, evaluating parameter symmetry alignment limits across out-of-domain
                distributions, model depths, regularized weight matching, and adversarial endpoints.{" "}
                <a
                  href="https://openreview.net"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-ink/60 underline-offset-2 hover:decoration-marker-strong hover:decoration-2"
                >
                  Read →
                </a>
              </li>
              <li className="pl-8 -indent-8">
                [2] Notes on Memory-Augmented Sequence Models. <span className="italic">Blog</span>, 2026. —{" "}
                <span className="italic text-muted-foreground">Coming soon</span>
              </li>
              <li className="pl-8 -indent-8">
                [3] Ablation Diaries: What Actually Moves the Needle. <span className="italic">Blog</span>, 2026. —{" "}
                <span className="italic text-muted-foreground">Coming soon</span>
              </li>
              <li className="pl-8 -indent-8">
                [4] Graph Learning for Genomics: A Practical Survey. <span className="italic">Blog</span>, 2026. —{" "}
                <span className="italic text-muted-foreground">Coming soon</span>
              </li>
            </ol>
          </Reveal>

          {/* Skills */}
          <Reveal className="reveal mt-12">
            <SectionHeading>6 Technical Skills</SectionHeading>
            <table className="mt-3 w-full border-y border-ink/60 text-[0.88rem]">
              <tbody>
                {[
                  ["Languages", "Python, C, C++"],
                  ["Frameworks & Libraries", "PyTorch, TensorFlow, Keras, Scikit-learn, FastAPI, LangChain"],
                  ["Domains", "Deep Learning, Graph Neural Networks, NLP, Sequence Modeling, Transformers"],
                  ["Tools", "Docker, GitHub, HuggingFace"],
                ].map(([k, v]) => (
                  <tr key={k} className="align-top">
                    <td className="w-[13rem] py-1.5 pr-4 font-bold">{k}:</td>
                    <td className="py-1.5">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          {/* Contact */}
          <Reveal id="contact" className="reveal mt-12">
            <SectionHeading>7 Contact</SectionHeading>
            <p className="justify-paper text-[0.95rem]">
              Feel free to reach out regarding research collaborations, roles, or reproducibility questions.
            </p>
            <p className="mt-4 flex flex-wrap gap-4 text-[0.8rem]">
              <a className="underline" href="mailto:mudgalkrishna92@gmail.com">
                [1] Email
              </a>
              <a className="underline" href="https://github.com/krishnamudgal" target="_blank" rel="noreferrer">
                [2] GitHub
              </a>
              <a className="underline" href="https://linkedin.com/in/krishnamudgal" target="_blank" rel="noreferrer">
                [3] LinkedIn
              </a>
            </p>

            <div className="mt-6 border border-ink/50 bg-marker p-3">
              <div className="flex items-start justify-between gap-3">
                <pre className="overflow-x-auto text-[0.72rem] leading-[1.5]" style={{ fontFamily: "var(--font-mono-paper)" }}>
                  {BIBTEX}
                </pre>
                <button onClick={copy} className="paper-tab shrink-0 cursor-pointer">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
