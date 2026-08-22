# Paper Portfolio

# Lovable Build Prompt — "A Portfolio of Krishna Mudgal: A Research Perspective"

Copy everything below into Lovable as your build prompt.

---

Build a single-page personal portfolio website styled EXACTLY like a real NeurIPS/ICML academic conference paper (LaTeX two-column format) — not a generic SaaS portfolio template. Reference: real conference paper PDFs (arXiv, NeurIPS proceedings). The whole page should feel like you are looking at a scrollable academic paper with a working nav bar, not a card-based dashboard.

## Overall Concept

The site is one continuous "paper" laid out on a cream/off-white page, centered on a slightly darker neutral background (like a PDF viewer backdrop), with a subtle soft drop shadow around the page edges for a gentle paper-lifted-off-desk effect. Everything else stays flat and print-like — the only 3D flourish should be a single hero moment (a project "figure" card with a realistic peeling paper corner, curling up slightly with a soft fold shadow, as if that page is about to flip). Do not add 3D/depth anywhere else — restraint is the point.

## Color Palette (strict — do not deviate)

- Background page: `#FAF6EC` (warm cream paper)
- Outer background: `#3A342C` (dark warm charcoal, like a desk/PDF-viewer backdrop)
- Text: `#111111` (near-black ink)
- Accent (the ONLY color besides black/white/cream): dull muted pale yellow, `#F0DFA0` for highlighter-marker strokes and active states, `#E8CE7A` for slightly stronger accents (buttons, dividers)
- No other hues anywhere. No blue links, no red, no green — everything else is grayscale/ink black.

## Typography

- All body and heading text: classic academic serif — use "Georgia", "Times New Roman", or a Computer-Modern-style Google Font like "EB Garamond" or "Source Serif 4" throughout.
- Section headers: bold serif, small caps, numbered (e.g. "1 INTRODUCTION", "2 EXPERIENCE"), with a thin horizontal accent rule underneath.
- Body paragraphs: fully justified text, two-column layout on desktop (CSS `column-count: 2` or a two-column grid), collapsing to a single column on mobile/tablet.
- Captions and reference-list entries: smaller serif font size, tight line-height, like real paper footnotes/bibliographies.

## Top Navigation (sticky)

A thin sticky header styled like a paper's running header, functioning as real site nav:
- Left: small italic text "Preprint. Under review."
- Right: a row of nav "tabs" that look like torn/cut paper tags — each a rectangle with a thin 1px black border, sharp corners, subtle raised paper effect (very light box-shadow, barely visible, like a sticky note lifted a millimeter off the page). Tabs: `Home` `Experience` `Projects` `Research` `Contact`
- The active tab gets a pale-yellow highlighter-marker background (`#F0DFA0`) instead of white.
- Clicking a tab smooth-scrolls to that section (single-page site, anchor links, no page reloads).

## Section 1 — Hero / Title Block (single column, centered)

- Large bold serif title, two lines, centered:
  "A Portfolio of **Krishna Mudgal**: A Research Perspective"
- Below it, centered, small-caps author line: "KRISHNA MUDGAL"
- Below that, small italic serif contact line, centered, with inline clickable text (styled as plain underlined black text, NOT blue links, to match paper aesthetic):
  "New Delhi, India · +91-96503-17583 · mudgalkrishna92@gmail.com · linkedin.com/in/krishnamudgal · github.com/krishnamudgal"
- A thin horizontal accent rule (pale yellow, 2px) below the contact line.
- **ABSTRACT box**: bold small-caps "ABSTRACT" centered heading, then a justified paragraph in a slightly indented block:
  "AI & ML developer with a focus on deep learning, sequence modeling, and generative AI. This portfolio presents a candidate research profile centered on building systems from first principles and understanding why they work — spanning memory-augmented architectures, graph neural networks for genomics, and reproducibility studies in deep learning. Interested in how models learn, adapt, and generalize, especially in settings where data is sparse or the problem is genuinely novel."
- Below abstract: "**Keywords:**" followed by keyword chips styled as highlighter-marker text (pale yellow background stripe behind each phrase, like a highlighter pen was dragged across the words, not rounded pill buttons): `deep learning` `sequence modeling` `generative AI` `graph neural networks` `reproducibility research`

## Section 2 — "2 EDUCATION" (two-column body text starts here)

Left column, dense paper-style paragraph formatting:
- **Maharaja Agrasen Institute of Technology (MAIT), GGSIPU** — New Delhi, India
  *B.Tech in Computer Science & Technology | CGPA: 9.0* — 2024–2028

## Section 3 — "3 EXPERIENCE"

Formatted like a methodology/related-work section, each role as a bold sub-heading with company on the left and dates right-aligned on the same line (like a paper's affiliation-date convention), followed by dense justified bullet-style paragraph text (use serif bullet dashes, not modern UI bullets):

**MindoraxAI Labs** — Remote — *AI Intern* — 2026
- Worked on a research-focused reproduction effort, replicating the methodology and core experiments of a published deep learning paper end-to-end in PyTorch.
- Validated reproduced results against reported benchmarks and ran ablations to test sensitivity of findings to architectural and training choices.

**RL Hackathon, IIT Delhi** — 2024
- Applied reinforcement learning to a sequential decision-making problem; demonstrated strong grasp of policy optimization and reward shaping.

**HackLLM, IIIT Delhi** — 2024–2025
- Built an LLM hallucination detection pipeline using RAG-based verification with Mistral-7B and DeBERTa; **Top 50 of 110 teams**.

## Section 4 — "4 PROJECTS" (styled as numbered Figures — this is the hero visual section)

A 2x2 grid of "Figure" cards. Each card: a placeholder image area (light gray with a simple icon, or an abstract grayscale plot/diagram placeholder), with a centered caption below in small serif text: "Figure N: [Project Title] — one-line description."

Give **Figure 1 (Titans Architecture)** the special 3D peeling-corner effect described above — top-right corner of that card curls up realistically with a soft fold shadow, as the single crazy/hero moment of the whole page. All other figure cards stay flat.

- **Figure 1: Titans Architecture — From Scratch Reproduction.** *PyTorch, Transformers, Memory-Augmented LMs — 2026.* Reproduced Google DeepMind's Titans architecture implementing all four core variants: MAC (Memory as Context), MAG (Memory as Gate), MAL (Memory as Layer), and LMM (Long-term Memory Module). Conducted ablation studies across memory configurations to benchmark contextual retention and generation quality.

- **Figure 2: GEN-RESIST — Antimicrobial Resistance (AMR) Prediction.** *GNN, GAT, PyTorch, NCBI, CARD — 2025.* Built a deep learning pipeline using Graph Neural Networks and Graph Attention Networks to predict antibiotic resistance genes directly from genome sequences, achieving **83% accuracy**. Deployed via a Firebase REST API with the inference model hosted on HuggingFace Spaces and a React frontend. GitHub: mudgalKrishna/GEN-RESIST.

- **Figure 3: Pretrained Models.** *PyTorch, Transformers, Diffusion LMs — 2025.* Trained multiple language and vision models from scratch — GPT-2-style, LLaMA-style, and DeepSeek-style LMs on Shakespeare, BookCorpus, and WikiText, plus ViTs on CIFAR-100 and Tiny-ImageNet. Implemented a Diffusion Language Model (DLM) from scratch based on the LLaDA paper. Models are live on HuggingFace for public inference.

- **Figure 4: HackLLM — Hallucination Detection Pipeline.** *RAG, Mistral-7B, DeBERTa — 2024–2025.* Built an LLM hallucination detection pipeline using RAG-based verification; placed in the top 50 of 110 teams at IIIT Delhi's HackLLM.

## Section 5 — "5 RESEARCH & TECHNICAL WRITING" (styled like a Publications list)

Numbered like real paper references, hanging indent, small serif font, with a "Read →" link styled as plain underlined black text on hover reveals pale yellow underline:

[1] Swain, T., Malik, K., Mudgal, K., Makhija, Y. "How Far Does Generalized Symmetry Alignment Reach? Reproducing and Extending Linear Mode Connectivity for Transformers." *OpenReview*, 2025. — A reproducibility and extension study on Generalized Linear Mode Connectivity for Vision Transformers and GPT-2, evaluating parameter symmetry alignment limits across out-of-domain distributions, model depths, regularized weight matching, and adversarial endpoints.

(Leave 2-3 more numbered slots as placeholder blog/publication entries styled the same way, e.g. "[2] Post Title. Blog, 2026." so the section reads as a living, growing list — these should say "Coming soon" in muted gray italic.)

## Section 6 — "6 TECHNICAL SKILLS"

Formatted like a compact paper appendix table, bold labels left, content right, single column, small serif font, thin rule above and below:

- **Languages:** Python, C, C++
- **Frameworks & Libraries:** PyTorch, TensorFlow, Keras, Scikit-learn, FastAPI, LangChain
- **Domains:** Deep Learning, Graph Neural Networks, NLP, Sequence Modeling, Transformers
- **Tools:** Docker, GitHub, HuggingFace

## Section 7 — "7 CONTACT" (footer)

- Short paragraph in paper prose: "Feel free to reach out regarding research collaborations, roles, or reproducibility questions."
- Footnote-style row at the very bottom, tiny serif text, contact icons styled as inline citation-bracket buttons: `[1] Email` `[2] GitHub` `[3] LinkedIn` — each clickable, opening mailto:mudgalkrishna92@gmail.com, github.com/krishnamudgal, and linkedin.com/in/krishnamudgal respectively.
- A small "citation block" box at the very bottom styled like a BibTeX citation, pale yellow fill, monospace font inside:

```
@misc{mudgal2026portfolio,
  author = {Krishna Mudgal},
  title  = {A Portfolio of Krishna Mudgal: A Research Perspective},
  year   = {2026},
  note   = {github.com/krishnamudgal}
}
```

with a small "Copy" button next to it.

## Interaction & Motion Details

- Smooth-scroll anchor navigation from the top nav tabs.
- On scroll, the top nav's active tab highlight updates to match the section currently in view (scrollspy behavior).
- Subtle fade/slide-up animation as each section enters the viewport (once, not repeating, ~400ms ease-out) — keep this minimal and elegant, not bouncy.
- The Figure 1 peeling-corner card should have a slightly increased curl on hover, and flatten back on mouse-leave, for a nice tactile touch.
- Highlighter-marker keyword/tag backgrounds can have a very subtle hand-drawn wobble to the highlight stripe (not a perfect rectangle) for authenticity.

## Responsive Behavior

- Desktop: full two-column paper-style body text, 2x2 project figure grid.
- Tablet: two-column text becomes single column; figure grid becomes 2x1 (2 rows of 1) or stays 2 across if space allows.
- Mobile: everything single column, nav tabs collapse into a horizontal scrollable row or a hamburger menu styled as a small paper-tab icon.

## Technical Notes for Implementation

- Use semantic HTML sections with ids matching nav anchors (#home, #experience, #projects, #research, #contact).
- Use CSS custom properties for the three core colors so theme is easy to tweak later.
- Keep the whole page a single scrollable route — no client-side router needed unless you want individual blog post pages later (build the Blog/Research list as static entries for now, each optionally linking out to an external URL like Medium/Substack/OpenReview).
- Prioritize typography and layout fidelity to the reference over decorative flourishes — the paper aesthetic IS the design; do not add generic modern UI elements (no rounded pill buttons, no gradient buttons, no drop-shadow cards outside the one hero figure).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://neurips-style-folio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/071af646-537c-4ef4-946a-7707226b975c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
