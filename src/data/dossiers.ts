export interface DossierItem {
  id: string;
  plateCode: string;
  title: string;
  category: string;
  year: string;
  metricValue: string;
  metricUnit: string;
  summary: string;
  facts: Array<{ label: string; value: string }>;
  body: string[];
  limitations?: string;
  image?: {
    src: string;
    alt: string;
    caption: string;
    credit?: string;
  };
  links: Array<{ label: string; href: string; external?: boolean }>;
  bibtex?: string;
}

export const DOSSIERS: Record<string, DossierItem> = {
  diurna: {
    id: "diurna",
    plateCode: "01",
    title: "Diurna",
    category: "Shipped desktop and mobile system",
    year: "2026",
    metricValue: "15.0%",
    metricUnit: "clean WER",
    summary:
      "A bot-less meeting memory for macOS and iPhone that records local audio, transcribes on Apple Neural Engine, and links every decision to the exact second of the transcript.",
    facts: [
      { label: "Codebase", value: "242,900 lines across Rust (12 crates), Swift, Python, TypeScript" },
      { label: "Grant", value: "2,000 € net grant, TEF Ignition (Tech Europe Foundation)" },
      { label: "Distribution", value: "Signed and Apple-notarized macOS DMG (v0.7.16), TestFlight iOS build 6" },
      { label: "Verification", value: "2,050 automated tests and 52 saved ASR benchmark runs" }
    ],
    body: [
      "Diurna captures microphone and system audio natively through Core Audio process taps in Swift, so no bot ever enters a client call. Local transcription runs Parakeet on the Apple Neural Engine with whisper.cpp Metal fallback, TitaNet speaker diarization, Vision OCR slide capture, SQLCipher storage, and an OAuth 2.1 MCP endpoint so Claude or Cursor can query verified notes.",
      "The most valuable work happened when I stopped adding features and measured the pipeline. Across 52 saved benchmark runs against human reference transcripts, I discovered Diurna was running the exact same Parakeet model twice (live and post-call), inherited from an earlier Whisper architecture nobody had rechecked. On clean audio, the second pass improved word error rate by only 0.6 percentage points (15.6% live vs 15.0% final).",
      "The real error source in far-field classroom audio was a live voice-activity threshold that silently discarded 1,044 words across 78 speech spans. Porting the incremental chunked pipeline already running on iPhone cut end-of-meeting waiting time from 1,829 seconds to roughly 100 seconds."
    ],
    limitations:
      "Honest status: the software is engineered and shipped, but commercial demand remains unproven. Pilot onboarding never ran, Google OAuth verification is pending, and the Windows beta installer is unsigned.",
    image: {
      src: "/media/diurna-memoria.png",
      alt: "Diurna Memoria companies view listing accounts, participants, and meeting cadence",
      caption: "Diurna Memoria workspace indexing client accounts and recurring calls locally."
    },
    links: [
      { label: "Live landing page (getdiurna.com)", href: "https://getdiurna.com", external: true }
    ]
  },

  "cv-radar": {
    id: "cv-radar",
    plateCode: "02",
    title: "CV-Radar",
    category: "Anti-hallucination job agent",
    year: "2026",
    metricValue: "17,217",
    metricUnit: "offers gated",
    summary:
      "An application pipeline where the language model is structurally forbidden from inventing facts: a zero-token deterministic gate filters openings first, and a strict validator blocks PDF compilation on any unverified claim.",
    facts: [
      { label: "Architecture", value: "148,500 lines of Python, 37 SQLite tables, 1,779 automated tests" },
      { label: "Acquisition", value: "87 scraper modules across 65 ATS sources with stdlib PoliteClient" },
      { label: "Sandbox", value: "LaTeX PDF built inside Docker with network_mode: none and cap_drop: ALL" },
      { label: "Clients", value: "FastAPI and React board, Chrome MV3 autofill extension, Telegram digest" }
    ],
    body: [
      "Most resume tools ask a language model to rewrite experience until it sounds persuasive, which quietly invents skills or inflates metrics. CV-Radar flips the contract: the model may only select and order verified entries from a structured profile.yaml.",
      "Every run executes an idempotent pipeline (fetch, enrich, gate, score, digest, tailor, build). The deterministic offline gate rejects incompatible roles before spending a single API token, while core/validate.py inspects every tailored draft for denied terms, altered frozen fields, invented units, and unknown strict tokens.",
      "Its 65 ATS adapters use a zero-dependency standard-library PoliteClient with an honest User-Agent, contact email, inter-request delays, and 429/5xx backoff. It is the ethical data-acquisition benchmark across all my scrapers."
    ],
    limitations:
      "Running locally on schedule (17,217 offers and verdicts logged), not publicly deployed. Internal go-live checklist still marks public launch as NO-GO pending legal review and Chrome Web Store submission.",
    image: {
      src: "/media/cv-radar-og.png",
      alt: "CV-Radar architectural overview card",
      caption: "CV-Radar deterministic pipeline and verified profile contract."
    },
    links: []
  },

  bandifacili: {
    id: "bandifacili",
    plateCode: "03",
    title: "BandiFacili",
    category: "Public grants catalogue and agent workspace",
    year: "2026",
    metricValue: "2,160",
    metricUnit: "grant sheets",
    summary:
      "A daily-refreshed index of Italian and European public grants paired with a source-bound assistant and a seven-bot workspace that drafts eligibility checks, budgets, and checklists.",
    facts: [
      { label: "Stack", value: "Next.js 16, React 19, TypeScript 5, Tailwind 4, Python 3.12 daily pipeline" },
      { label: "Catalogue", value: "6,143 indexed grants, 2,160 published sheets, 851 open from 5 official sources" },
      { label: "Release bar", value: "19/19 technical criteria verified across 5 audit cycles (0 false claims)" },
      { label: "Lineage", value: "18-month progression from Scraper Bandi (Apr 2025) to BandoRadar to BandiFacili" }
    ],
    body: [
      "Having won a competitive regional grant myself (Minds Without Borders), I knew how fragmented Italian public funding portals are. BandiFacili ingests MIMIT incentivi.gov.it Solr feeds, EU Funding and Tenders, and regional portals every morning at 07:05, normalizing snapshots and tracking daily changes.",
      "The assistant cannot answer from general memory: every recommendation cites live catalogue records, and a deterministic workspace orchestrates seven specialized bots (analysis, eligibility, budget, draft, checklist, deadlines, monitoring) with AI Act article 50 disclosure.",
      "Before calling the build technically ready, I ran five audit cycles with independent re-verification across rendered HTML, removing unbuilt feature badges and confirming 2,241 sitemap URLs with zero TypeScript errors."
    ],
    limitations:
      "Technically complete and refreshing locally each morning, but commercially unlaunched: production hosting, live LLM billing keys, and external legal review of terms are still pending.",
    image: {
      src: "/media/bandifacili-agents.png",
      alt: "BandiFacili seven-bot workspace showing step timeline and official grant data table",
      caption: "BandiFacili agent workspace tracing every grant parameter back to MIMIT official fields."
    },
    links: [
      { label: "Predecessor repo (bandoradar)", href: "https://github.com/francescods04/bandoradar", external: true }
    ]
  },

  "excel-ai": {
    id: "excel-ai",
    plateCode: "04",
    title: "Excel AI",
    category: "Financial modelling Office.js add-in",
    year: "2026",
    metricValue: "Confirm",
    metricUnit: "before write",
    summary:
      "A Microsoft Excel add-in that inspects active worksheets, plans DCF, LBO, WACC, and comps models from natural language, and requires explicit user confirmation before writing formulas to cells.",
    facts: [
      { label: "Frontend", value: "Office.js Task Pane inside Excel Desktop and Online" },
      { label: "Backend", value: "Node.js Express orchestrator with multi-provider LLM routing" },
      { label: "Data bridge", value: "Python bridge connecting OpenBB and Yahoo Finance" },
      { label: "Scope", value: "DCF, LBO, WACC, comps, three-statement models, Italian and English formulas" }
    ],
    body: [
      "Built out of frustration with repetitive spreadsheet formatting and model scaffolding during venture and private equity internships. Instead of silently mutating a workbook, Excel AI reads the active cell range and formulas, proposes a structured execution plan, and waits for explicit approval before applying changes.",
      "A Python sidecar bridges live financial market data from OpenBB and Yahoo Finance directly into structured ranges, pairing natural-language modeling with deterministic spreadsheet auditability."
    ],
    limitations:
      "Currently transitioning from francescodelsesto.com to its own subdomain (excel.francescodelsesto.com) as a standalone project showcase.",
    links: [
      { label: "Source repository on GitHub", href: "https://github.com/francescods04/excel-ai-", external: true }
    ]
  },

  thesis: {
    id: "thesis",
    plateCode: "05",
    title: "Public Development Banks as Equity Investors",
    category: "Bocconi BSc Thesis",
    year: "2025",
    metricValue: "21.78M",
    metricUnit: "firm-year obs",
    summary:
      "Empirical analysis of direct equity investments by ten European Public Development Banks across 5.51 million unique firms, combining large-scale data engineering with two-way fixed-effects difference-in-differences.",
    facts: [
      { label: "Institution", value: "Bocconi University, B.Sc. in Economics and Finance (AY 2024/2025)" },
      { label: "Advisor", value: "Prof. Marta Zava" },
      { label: "Dataset", value: "58.2M raw Orbis rows (114 Parquet batches) matched to Crunchbase and Mergermarket" },
      { label: "Headline ATT", value: "+37.3 pp turnover, +29.6 pp assets, +13.9 pp employees (public TWFE DiD)" }
    ],
    body: [
      "Because Orbis and Crunchbase share no common firm identifier, the core engineering contribution was building a resilient bulk extraction pipeline (GREEN/YELLOW/RED rate-limit state machine, streaming xlsx to Parquet reducing 40 GB to 12 GB) followed by legal-suffix normalization and vector cosine-similarity entity matching (> 0.90) across 12 European countries.",
      "The final panel covers 5,511,682 unique firms and 21,777,875 firm-year observations (937 public-backed firms, 10,496 privately backed startups, 123,080 unfunded startups, and 5.38M established peers).",
      "The sharpest empirical result is institutional heterogeneity: the average public effect is a composition effect. Baseline public funding carries a negative turnover coefficient (-20.3 pp) that is overturned by high-performing institutions such as CDP Equity (+40.6 pp), Portugal Ventures (+39.9 pp), PMV (+33.9 pp), Almi (+24.7 pp), and Bpifrance (+24.2 pp). Public-private interaction turns positive after a two-year lag, pointing to dynamic certification rather than immediate headcount expansion."
    ],
    limitations:
      "Two caveats stated explicitly in the thesis: the treated group spans 937 firms, and the unfunded startup control mixes bootstrapped firms with rejected applicants. Proprietary Orbis microdata cannot be redistributed.",
    links: [
      { label: "Download full thesis PDF (63 pages)", href: "/papers/del-sesto-2025-public-development-banks-thesis.pdf" }
    ],
    bibtex: `@thesis{delsesto2025pdb,
  author  = {Del Sesto, Francesco},
  title   = {Public Development Banks as Equity Investors: A Comparative Performance Analysis of European Startups},
  type    = {Bachelor's Thesis},
  school  = {Bocconi University},
  year    = {2025},
  note    = {Advisor: Prof. Marta Zava}
}`
  },

  "deposit-paper": {
    id: "deposit-paper",
    plateCode: "06",
    title: "Deposit Competition Beyond Rates",
    category: "Working paper (draft)",
    year: "2026",
    metricValue: "97.7B €",
    metricUnit: "BTP Valore",
    summary:
      "Evidence from Italy's retail sovereign debt boom: testing deposit pass-through asymmetry, adverse selection, and opt-out customer inertia using public ECB, MEF, Wayback, and AGCM records.",
    facts: [
      { label: "Status", value: "Working paper draft (not peer-reviewed), fully reproducible public data" },
      { label: "Sight vs term beta", value: "0.07 sight-deposit beta vs 0.76 term-deposit beta (0.69 steering gap)" },
      { label: "Aggregate test", value: "+0.04 log pts around BTP Valore placement windows (p = 0.79, null)" },
      { label: "Quasi-experiment", value: "Wayback 26-quarter promo panel (beta 0.86) and isybank AGCM PS12660" }
    ],
    body: [
      "Designed as an out-of-country empirical extension of Benetton, Hebert, and McQuade (2026). Italy exhibits the widest sight-versus-term steering gap among large euro-area markets without regulated savings, with the term-to-sight spread widening from 0.37 to 3.46 percentage points while retail savers absorbed 97.7 billion euros across six BTP Valore issuances.",
      "Using 20 reproducible Python and R scripts over ECB MIR series, MEF placement calendars, a 26-quarter Wayback Machine panel of bank promotional offers, and AGCM opt-out migration filings (isybank PS12660), the draft documents a robust aggregate null around placement windows consistent with adverse selection and depositor sleepiness."
    ],
    limitations:
      "Draft working paper; bank-level microdata from Bank of Italy are outside the public replication kit.",
    links: [
      { label: "Read research proposal PDF", href: "/papers/del-sesto-2026-deposit-competition-proposal.pdf" },
      { label: "Read preliminary data appendix PDF", href: "/papers/del-sesto-2026-deposit-competition-appendix.pdf" }
    ]
  },

  cartpole: {
    id: "cartpole",
    plateCode: "07",
    title: "From CartPole to the Market",
    category: "Reinforcement learning evaluation",
    year: "2026",
    metricValue: "2×2×2",
    metricUnit: "cheat ablation",
    summary:
      "A Bocconi Students for Machine Learning project that moves PPO and DQN from Gymnasium control benchmarks into SPY trading, then decomposes fake backtest alpha with Deflated Sharpe Ratio.",
    facts: [
      { label: "Team", value: "BSML Bocconi 2026/27 Project 16 (5-person team)" },
      { label: "My role", value: "Control baselines, custom Gymnasium env, SPY feasibility, walk-forward protocol" },
      { label: "Evaluation", value: "Walk-forward embargo splits, turnover-matched random baseline, Deflated Sharpe" },
      { label: "Stack", value: "Python, Stable-Baselines3, Gymnasium, pytest, Typst report" }
    ],
    body: [
      "Most student trading-RL projects report impressive equity curves built on subtle evaluation leaks. We designed a 2x2x2 factorial ablation of common backtest cheats (random split, zero transaction costs, one-bar lookahead) to measure exactly how much apparent alpha vanishes once market realism is enforced.",
      "Every run logs full trial counts into results/run_log.csv so Bailey and Lopez de Prado's Deflated Sharpe Ratio penalizes selection bias honestly."
    ],
    limitations:
      "Academic research exercise demonstrating why naive RL fails under transaction costs and non-stationarity; not a live trading strategy.",
    links: []
  },

  "ctf-agent": {
    id: "ctf-agent",
    plateCode: "08",
    title: "CTF Firecrawl Agent",
    category: "Deadline-scheduled agent system",
    year: "2026",
    metricValue: "4,713",
    metricUnit: "lines of TS",
    summary:
      "An autonomous TypeScript solver built for a 60-second timed capture-the-flag benchmark, featuring dual-model hedging, six-second manager replanning, and explicit prompt-injection sanitization.",
    facts: [
      { label: "Architecture", value: "17 TypeScript modules, task-shape-agnostic inference" },
      { label: "Latency control", value: "Dual-model provider hedging (first usable answer wins) + 6s manager loop" },
      { label: "Security", value: "Trust boundaries and sanitize.ts trap-token stripping against prompt injection" },
      { label: "Tooling", value: "Live OSS source search (postgres, chromium, firefox), compile checks, Playwright" }
    ],
    body: [
      "Rather than hard-coding branches per challenge level, the solver infers the expected output contract from each incoming payload and allocates compute against a hard 60-second deadline.",
      "A manager loop re-evaluates progress every six seconds, races direct and routed model providers via configurable hedge thresholds, synthesizes edge-case verification tests before submitting, and isolates untrusted external web content behind strict prompt-injection filters."
    ],
    links: []
  },

  kaggriculture: {
    id: "kaggriculture",
    plateCode: "09",
    title: "Kaggriculture Optimizer",
    category: "Simulation and Rust optimization",
    year: "2026",
    metricValue: "300",
    metricUnit: "holdout seeds",
    summary:
      "Reverse-engineered hidden environment rules from official Kaggle simulation source, validated a 1:1 lean simulator, and wrote an LTO Rust parameter optimizer with Cournot opponent modeling.",
    facts: [
      { label: "Agent", value: "1,015-line policy, 43 simulation modules, 67 tracked experiments" },
      { label: "Optimizer", value: "Rust edition 2024 with LTO, codegen-units=1, panic=abort" },
      { label: "Game theory", value: "Shared-price Cournot commons modeling from observable board tiles" }
    ],
    body: [
      "Reading the official kaggle-environments source uncovered non-obvious mechanics (shed-only selling, single-fertilizer wheat windows, Fibonacci hiring thresholds, atomic planting, and per-good elasticity floors).",
      "Building a fast, bit-exact local simulator and optimizing strategy parameters in Rust across 300-seed holdouts turned heuristic trial-and-error into reproducible quantitative iteration."
    ],
    links: []
  },

  chresmos: {
    id: "chresmos",
    plateCode: "10",
    title: "Prediction Market Microstructure Stack",
    category: "Real-time data engineering",
    year: "2026",
    metricValue: "106.6M",
    metricUnit: "orderbook ticks",
    summary:
      "High-frequency ingestion, cross-venue contract matching, and order-flow imbalance research across Polymarket, Kalshi, and Binance futures data.",
    facts: [
      { label: "Infrastructure", value: "Rust WebSocket worker into TimescaleDB, ClickHouse, Redis, and FastAPI" },
      { label: "Cross-venue", value: "73.8M Polymarket and 32.8M Kalshi snapshots; 348 candidates pared to 38 defensible pairs" },
      { label: "Microstructure", value: "Cont-Kukanov-Stoikov (2014) OFI with LightGBM and Avellaneda-Stoikov quoting" }
    ],
    body: [
      "Built a full Dockerized ingestion and analytics pipeline (`ChresmosCapital-Infrastructure`) alongside a cross-venue equivalence matcher and an Order Flow Imbalance study on high-frequency L1 bookTicker streams.",
      "Consistent with my evaluation rule, the internal research memo concluded that optimistic backtests overstate realizable spread capture once queue priority, settlement rules, and liquidity limits are modeled accurately."
    ],
    limitations:
      "Strictly research-grade market microstructure and data engineering; no live performance claims and not investment advice.",
    links: []
  },

  "run-and-prices": {
    id: "run-and-prices",
    plateCode: "11",
    title: "Run and Prices",
    category: "Spatial econometrics",
    year: "2026",
    metricValue: "7,874",
    metricUnit: "municipalities",
    summary:
      "Does a fitness heatmap carry a housing-market signal? Measuring Strava Global Heatmap intensity against asking prices across every Italian municipality, including a public write-up of a measurement-error bug.",
    facts: [
      { label: "Coverage", value: "7,874 Italian municipalities" },
      { label: "Headline fit", value: "+29.3% asking price per heat doubling (CI 21.5 to 37.6%, R squared 0.55)" },
      { label: "Spatial check", value: "Moran's I of 0.474 documented explicitly alongside measurement caveats" }
    ],
    body: [
      "Tested whether crowd-sourced running heatmaps capture urban desirability beyond standard municipal covariates across Italy.",
      "When a post-publication check revealed a measurement-error artifact in the extraction step, I documented the bug openly in the repository rather than quietly burying it."
    ],
    links: [
      { label: "View repository on GitHub", href: "https://github.com/francescods04/run-and-prices", external: true }
    ]
  },

  mwb: {
    id: "mwb",
    plateCode: "12",
    title: "44 Days Between Silicon Valley and Wall Street",
    category: "Field report (Minds Without Borders)",
    year: "2026",
    metricValue: "44",
    metricUnit: "days in US",
    summary:
      "Notes from 30 meetings across Stanford, Berkeley, NASA Ames, Google, Plug and Play, Columbia, JPMorgan, Intesa Sanpaolo, and Eataly during the Minds Without Borders scholarship.",
    facts: [
      { label: "Scholarship", value: "13 under-30 grants from Camera di Commercio di Caserta (ASIPS) and Confindustria Caserta" },
      { label: "Dates", value: "20 June to 2 August 2026 (San Jose State University and Columbia University)" },
      { label: "Training", value: "Observational training at G.C. Consultants, 444 Madison Ave, New York (27 to 31 July)" }
    ],
    body: [
      "Spending three weeks in the Bay Area followed immediately by three weeks in Manhattan made a quiet intuition unmistakable. On the West Coast, conversations started from what could be built next week; in traditional banking, the centre of gravity remained defending existing processes.",
      "Meeting Italian researchers, engineers, and founders working inside Stanford, NASA Ames, Google, INNOVIT, and Wall Street crystallized my decision to leave traditional finance tracks behind and focus completely on verifiable AI systems and startups."
    ],
    image: {
      src: "/media/mwb-stanford.jpg",
      alt: "Aerial view of Stanford University Main Quad from Hoover Tower",
      caption: "Stanford University Main Quad, visited during the Silicon Valley leg of Minds Without Borders (June to July 2026).",
      credit: "Stanford University from Hoover Tower, Wikimedia Commons, CC BY-SA 3.0"
    },
    links: []
  }
};

export const REEL_IDS = [
  "diurna",
  "cv-radar",
  "bandifacili",
  "excel-ai",
  "thesis",
  "deposit-paper",
  "cartpole",
  "ctf-agent"
] as const;
