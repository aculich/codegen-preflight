# Open Source Licensing Consensus in 2026

## Prompt

how to select a license: MIT (most common for VS Code extensions) versus Apache-2.0

Or other? What are the tradeoffs? What does the Jupyter community and UCB OSOP and other OSPO recommend?

What does midday and other open source projects/companies use? what about for startups and open core versus open source? when/why AGPL versus not? What's the current landscape for open source licenses and tradeoffs and general community sentiments and recommendations in the era of AI-enabled everything in January 2026?

## Responses

### Claude

- Public: https://claude.ai/share/ef026695-0b48-4195-aff8-5a3eb12a76b7

- Private: https://claude.ai/chat/b0f9e18d-166c-4b4f-a2ee-ca480e703b5f

**Claude Response (Jan 2026):**

**MIT vs. Apache-2.0: How to Choose; Community Trends in 2026; OSPO/Jupyter Recommendations; Startups and “AI-everything”**

---

**How to Select a License: MIT vs. Apache-2.0 (and Others)**

**MIT License**  
- *Most Common For*: Fast-moving developer tools, front-end packages, smaller libraries, VS Code extensions  
- *Why Choose It*:  
    - **Simplicity:** Very short, plain language.  
    - **Minimal restrictions:** Just attribution required.  
    - **Fringe patent risk:** No explicit patent grant, but many orgs accept the tradeoff for lower friction.  
- *When it's the wrong choice*:  
    - If you or your org care about explicit patent protection (either for or against contributors/users).  
    - If you're releasing core infrastructure or want adoption by enterprises with IP lawyers.

**Apache-2.0 License**  
- *Most Common For*: Cloud infrastructure, machine learning frameworks, code expected to be widely commercialized  
- *Why Choose It*:  
    - **Explicit patent grant and termination:** Protects both contributors and users; critical for big companies.  
    - **Loss of rights for bad actors:** The termination clause deters patent aggression.  
    - **Clarity for contributors:** Many Open Source Program Offices (OSPOs) and legal teams recommend it by default for new foundational projects.  
- *Costs*:  
    - More paperwork; requires tracking NOTICE files and marking modified files (but toolchains now handle much of this).
    - Slightly less "hands-off" than MIT, but now very well understood.

---

**Jupyter Community, UC Berkeley OSPO, and Peer Recommendations**  
- **Project Jupyter**: Uses BSD-3-Clause (similar to MIT, with a non-endorsement clause).  
    - *Why*: Historical scientific Python ecosystem precedent, simple compliance, encourages academic/industry adoption.
    - *When might they pick Apache-2.0 now?*: Some new subprojects with expected downstream commercial use trend Apache-2.0 to align with industry and ensure clear patent protections.

- **UC Berkeley OSPO**:  
    - Official guidance: Apache-2.0 is preferred for new infrastructure projects, especially those with multiple contributors or downstream commercial interest.
    - MIT/BSD still fine for “lightweight, low-risk” libraries.
    - MPL-2.0, AGPL only for very specific niche copyleft use-cases, and with legal review.

---

**Other Community Trends (midday, Meta, etc)**

- *Permissive is default*: Most companies (startups and large) now use Apache-2.0 or MIT unless strong reasons exist for copyleft.
- *Cloud infra/AI*:  
    - Apache-2.0 is the “safe, default, enterprise-friendly” choice (TensorFlow, Kubernetes, Hugging Face Transformers, etc).
    - MIT still popular for extensions/tools or when onboarding friction is paramount.
- *Meta, Google, Microsoft*: New major code drops are Apache-2.0 unless specific ecosystem reasons exist.
- *Open core startups*: License the open part as permissive (often Apache-2.0), closed source the commercial features.

---

**AGPL, Copyleft, and “Defensive” Licenses?**  
- *When does AGPL come up?*  
    - Mostly in apps or infra where the authors explicitly want to *require* improvements to be shared (web-apps, developer platforms).
    - Seen as a “stick” to force open core monetization or to prevent cloud/SaaS repackaging.
    - But: Most projects prefer permissive for reach—copyleft is used tactically, not by default.

---

**AI Era Community Sentiment (Jan 2026)**

- *Permissive licenses win*: They maximize adoption, especially for foundational AI models/tools where network effects are critical.
- *Apache-2.0 preferred when*:  
    - Patent concerns exist (AI, ML, enterprise cloud adoption).
    - Project expects contributions from >1 org, or downstream embedding by companies.

- *MIT preferred when*:  
    - Fast prototyping, low risk, or small extension/library (e.g., VS Code/Obsidian plugins).
    - You prioritize onboarding contributors over legal details.

- *BSD-3 (Jupyter/academic)*:  
    - Academic legacy, and still common when targeting scientists/educators.

- *Copyleft rare*: Used where control/forced sharing are core to project’s goals, but not typical for widely adopted dev tools or ML infra.

---

**Summary Table (2026):**

| License      | Major Pros         | Typical Use-Case                                   | Cons/When Not |
|--------------|--------------------|----------------------------------------------------|---------------|
| MIT          | Short, simple      | VS Code extensions, JS/TS lib, quick tools         | No explicit patent grant |
| Apache-2.0   | Patent shield      | AI/ML libraries, cloud infra, industry must-haves  | Slightly more paperwork |
| BSD-3-Clause | Academic flavor    | Jupyter, Python data science stack                 | Older; less corporate-favored |
| AGPL3        | Copyleft for SaaS  | Rare; open core web-apps with “viral” sharing aims | Adoption deterrent |
| MPL-2.0      | Weak copyleft      | When “contributions-back” on single files desired  | Niche, rarely default |
| GPL2/3       | Strong copyleft    | Legacy FOSS, tactical “commercial” leverage        | Not for infra/tools now |

---

**Quick Practical Guidance (2026):**

- **If you want safety, enterprise adoption, and contributions: Use Apache-2.0.**  
- **If you want pure simplicity and fastest onboarding: Use MIT.**  
- **If you’re in academic Python/Jupyter scene: BSD-3-Clause.**  
- **Copyleft/AGPL: Only when “forced sharing” is an explicit project goal—and understand tradeoffs.**

---

*References:*
- [OSPO UC Berkeley Licensing Guidance (2024 update)](https://ospo.berkeley.edu/guidance/licensing/)
- [Project Jupyter License FAQ](https://github.com/jupyter/governance/blob/main/licensing.md)
- [Open Source Initiative: License Usage Trends](https://opensource.org/licenses)
- [TODO Group: OSPO Survey 2025](https://todogroup.org/reports/)

---

*Claude (Anthropic Opus 4.5, January 2026 summary)*


### ChatGPT

- Public: https://chatgpt.com/s/t_696bcbd33d588191afdd507284738b87

- Private: https://chatgpt.com/c/696bc7ca-0064-8332-82c7-886b402dd4d7

Here’s a practical way to decide between MIT vs Apache-2.0 (and when to pick something else), with what Jupyter / UC Berkeley / OSPOs tend to do, plus what’s become common in the startup + “AI-everything” (Jan 2026) landscape.

MIT vs Apache-2.0 (the real tradeoffs)

MIT when you want “lowest friction”

MIT is the shortest, simplest permissive license. It’s a very common default when you want maximum adoption and minimal ceremony. (This is why you see it a lot around JS/TS tooling and VS Code ecosystem projects.)  ￼

Pros
	•	Minimal obligations (keep copyright + license text).
	•	Very “business-friendly” and widely understood.

Cons / gotchas
	•	No explicit patent grant (many people treat patent risk as “probably fine,” but Apache is more explicit).

Apache-2.0 when you want a “permissive license with a patent seatbelt”

Apache-2.0 is also permissive, but with explicit patent grant + patent retaliation/termination mechanics, and some extra requirements (e.g., NOTICE handling and marking changes). The UC guidance explicitly calls Apache 2.0 a “patent-granting” license.  ￼

Pros
	•	Clear patent license from contributors/users (big reason companies like it).
	•	Often easier for corporate legal/compliance teams to approve for “core” infrastructure.

Cons
	•	Slightly more compliance overhead (NOTICE, modification notices).
	•	Can be awkward with some legacy GPLv2-only combos (less common in VS Code extensions, but relevant if you embed GPLv2-only code).

A quick default rule (works well for VS Code extensions)
	•	If you expect corporate adoption or outside contributors (especially companies): pick Apache-2.0.
	•	If you want the simplest possible permissive license and don’t want extra paperwork: pick MIT.

(And both are extremely popular in open source overall.)  ￼

“Or other?” Common alternatives and why

BSD-3-Clause (Jupyter’s choice)

Project Jupyter’s code is under BSD 3-Clause.  ￼
BSD-3 is “MIT-like permissive,” with an extra non-endorsement clause (can help prevent people from implying the project endorses their fork/product).

If you want “MIT simplicity, plus a little brand-protection language,” BSD-3 is a solid option—also culturally aligned with the scientific Python/Jupyter ecosystem.  ￼

MPL-2.0 (middle ground copyleft)

If you want some reciprocity without “GPL/AGPL scares legal,” MPL-2.0 is a common compromise: file-level copyleft (changes to MPL files stay MPL; larger work can be proprietary).

GPLv3 vs AGPLv3 (copyleft vs “network copyleft”)
	•	GPLv3 triggers source-sharing obligations when you distribute the software.
	•	AGPLv3 adds a trigger when you run it as a network service (SaaS). That’s why it’s used as an “anti-free-riding-by-hosting” lever.

Grafana’s move from Apache 2.0 → AGPLv3 is a canonical example of using AGPL to push hosted providers to contribute back.  ￼

What Jupyter, UC Berkeley, and OSPOs tend to recommend/do

Jupyter community
	•	BSD-3-Clause across Project Jupyter code.  ￼
This aligns with a long tradition in scientific computing: permissive licensing to maximize research + industry reuse.

UC / UC Berkeley guidance (practical + risk-managed)

UC’s “OSS Chart Companion” frames licenses in buckets and explicitly distinguishes:
	•	permissive licenses (BSD/MIT) as low-friction,
	•	“hereditary” (copyleft) obligations,
	•	and “patent-granting” licenses (Apache 2.0, GPLv3).  ￼

It also flags AGPL as higher-risk for external distribution in their risk legend, and stresses following campus process / tech transfer guidance.  ￼

UC Berkeley–specific pages also point out that BSD, MIT, GPL/LGPL are commonly used in the community and that Berkeley offices can help you pick.  ￼

“Other OSPO” norms

The TODO Group (big OSPO community) advice is very consistent:
	•	choose an OSI-approved license if you want “open source” to be unambiguous,
	•	and recognize the spectrum from permissive (MIT/Apache) to copyleft (GPL/AGPL).  ￼

What Midday uses (and what that pattern means)

Midday’s main repo states it’s AGPL-3.0 for non-commercial use and offers a commercial license for commercial use.  ￼
That’s effectively a dual-licensing / commercial licensing model (common in SaaS startups that want community self-hosting but monetization leverage).

Interestingly, their “v1” starter-kit repo is MIT—a very common pattern: permissive for templates/libraries, stricter for the revenue-core app.  ￼

Startups, open core, and “why AGPL vs not?”

If you’re truly “open source startup”

Typical strategies:
	1.	Permissive (MIT/Apache) + sell hosted service
	•	Maximizes adoption; weakest protection against a hyperscaler cloning/hosting.
	2.	AGPL core + paid enterprise/commercial license (dual license)
	•	Maximizes leverage against “we host your OSS and don’t contribute.”
	•	Expect more friction with some enterprises.
	3.	Open core (some OSS, some proprietary)
	•	Widely used; very financing-friendly; can be controversial in OSS communities depending on how much value is closed.

(Open Core Ventures describes “open core” as a hybrid model with an open source core and proprietary extensions.  ￼)

When AGPL is the right tool

Choose AGPL if:
	•	the “product” is meaningfully delivered as a network service,
	•	you explicitly want hosted deployers to share modifications,
	•	you’re okay trading off some adoption (certain big-company legal teams will say “no AGPL”).

This is also why projects like Grafana explicitly moved to AGPL.  ￼

When NOT to use AGPL

Avoid AGPL if:
	•	you’re shipping a developer tool/library where “frictionless embedding” matters most,
	•	you want the broadest enterprise uptake with minimal review cycles,
	•	you don’t have the enforcement/resources/cultural appetite for copyleft debates.

UC’s chart captures this reality in a policy-driven way by flagging AGPL as higher-risk for external distribution.  ￼

The Jan 2026 landscape: “source-available” growth + AI-era confusion

1) More companies choose “not-open-source” licenses for defensibility

A major trend since the cloud era: companies switching from OSI licenses to source-available models to prevent “strip-mining” or to protect commercial moats:
	•	HashiCorp → BSL (Business Source License) and follow-on clarifications.  ￼
	•	Elastic → SSPL / Elastic License for Elasticsearch/Kibana changes.  ￼
	•	Sentry → Fair Source approach.  ￼

OSPO folks tend to be very direct here: if it’s not OSI-approved, it’s not open source (even if it’s “source available”).  ￼

2) AI made “open” marketing noisier — OSI responded with an “Open Source AI Definition”

In AI, “open weights” and “open source” are often mixed up. OSI published an Open Source AI Definition (1.0) stressing the same four freedoms (use, study, modify, share) and the need for access to the preferred form for making modifications (not just weights).  ￼

Practical implication for licensing in 2026:
	•	Your code license (MIT/Apache/BSD/etc.) is only one piece.
	•	If you ship models, you also need to decide licensing for weights, training data, and model code, and be clear whether you mean “open source” vs “open access/open weights.”

A simple recommendation set (works for most projects)

If you’re shipping a VS Code extension
	•	Default: MIT if you want “max adoption, minimal text.”
	•	Default: Apache-2.0 if you want a permissive license but with explicit patent protection and a compliance story that enterprise teams often like better.  ￼

If you’re building a startup product (esp. SaaS)
	•	If you want community + self-hosting + monetization leverage: consider AGPL + commercial license (Midday-style; Grafana-style rationale).  ￼
	•	If you want pure OSS credibility and widest ecosystem reuse: stick to Apache-2.0 or BSD-3 (Jupyter-style).  ￼
	•	If you want “looks open but defensible” (investor-friendly, community-mixed): you’ll be in open core or source-available territory—just be explicit that it’s not OSI open source.  ￼

⸻


### Gemini

- Public: https://gemini.google.com/share/104d47000eee

- Private: https://gemini.google.com/app/f09a527e29c7a1f8

The **MIT License** is the overwhelming standard for VS Code extensions, while **Apache-2.0** is preferred for large-scale corporate infrastructure. However, for startups and AI projects in January 2026, the strategy has shifted toward **Hybrid Licensing** and **Fair Source** models.

Here is the breakdown of recommendations, community standards, and the current trade-offs.

### 1. The Short Answer: VS Code & Tools

For a VS Code extension, **choose the MIT License**.

* **Why:** It is the "native language" of the VS Code ecosystem (Microsoft’s own extensions and the ecosystem samples are MIT). It minimizes friction; developers can copy/paste snippets or fork your extension without legal review.
* **When to use Apache-2.0:** If you are working in a patent-heavy domain or getting acquired/backed by a large corporation (like Google/CNCF projects). Apache-2.0 includes an explicit **patent grant**, which protects users from patent lawsuits, but it is slightly "heavier" and less common for simple plugins.

### 2. Community Recommendations (Jupyter & OSPOs)

Different open-source communities have strong cultural preferences that you should align with:

* **Jupyter Community:**
* **Recommendation:** **BSD-3-Clause**.
* **Reasoning:** The scientific Python stack (NumPy, SciPy, Jupyter) historically standardized on BSD. It is functionally permissive (like MIT) but includes a "non-endorsement" clause, preventing people from using your project's name to endorse derivative products. If you are building for JupyterLab, BSD-3-Clause ensures seamless license compatibility.


* **UC Berkeley OSPO (and Academic OSPOs):**
* **Philosophy:** They overwhelmingly favor **Permissive Licenses** (MIT/BSD).
* **Goal:** For research, the metric of success is *impact* and *citation*, not revenue. They want the code to be used in as many products (commercial or not) as possible.


* **Corporate OSPOs (Google, Microsoft):**
* **Philosophy:** They prefer **Apache-2.0** for infrastructure (Kubernetes, TensorFlow) to handle patent risks, but **MIT** for SDKs and web tooling (React, VS Code) to maximize adoption.



### 3. Startup Strategy: Midday & "Fair Source"

In 2026, startups rarely use a single license. They use a **Tiered Strategy** to balance adoption with defense against Cloud Providers (like AWS) reselling their work.

#### **A. The "Midday" Model (Hybrid Open Core)**

* **The App (Core Product):** **AGPLv3**.
* *Why:* The AGPL is a "poison pill" for SaaS competitors. If a cloud provider hosts your app, they must release their wrapper code. This protects your business model.


* **The SDKs / Starter Kits:** **MIT**.
* *Why:* Midday releases its "starter kits" (the code developers use to *build* on top of them) under MIT. You never want friction on the "on-ramp" to your product.



#### **B. The "Fair Source" Model (FSL)**

A dominant trend in 2025-2026, pioneered by Sentry, is the **Functional Source License (FSL)**.

* **What it is:** The code is "Source Available" (free to read/run, but competitors cannot sell it as a service) for **2 years**.
* **The Kicker:** On the 2nd anniversary of each release, it **automatically converts** to Apache-2.0 or MIT.
* **Tradeoff:** It is not "Open Source" (by OSI definition) for the first 2 years, but it guarantees future freedom while protecting the startup's fragile early years.

### 4. The AI Landscape in 2026

In the AI era, "Open Source" has fractured into three distinct layers. You must license them differently:

| Layer | Recommended License | Context |
| --- | --- | --- |
| **The Code** | **Apache-2.0** | (Inference engines, training scripts). Needs patent protection but maximum adoption. (e.g., PyTorch, vLLM). |
| **The Weights** | **OpenRAIL** or **Apache-2.0** | **Apache** if you are truly open (like OLMo or Pythia). **OpenRAIL** if you want to legally prohibit ethical misuse (deepfakes, discrimination) while allowing research. |
| **The Data** | **CDLA-Permissive** | Data licensing is complex; CDLA is the "MIT for Data." |

**Key Trend (The "Open Washing" Debate):**
By 2026, the term "Open Source AI" is strictly defined by the OSI (Open Source Initiative). To claim your AI is "Open Source," you must release **Code + Weights + Data Transparency**.

* Projects like **Llama** (Meta) utilize "Community Licenses" that restrict usage (e.g., >700M users), meaning they are **not** technically Open Source, but "Open Weights."
* Projects like **DeepSeek** or **OLMo** often use standard MIT/Apache licenses to signal "true" openness to developers.

### **Summary Decision Matrix**

| Scenario | Recommended License |
| --- | --- |
| **VS Code Extension** | **MIT** (Standard, low friction). |
| **Jupyter Extension** | **BSD-3-Clause** (Aligns with SciPy ecosystem). |
| **SaaS Startup (Defensive)** | **AGPLv3** (Core App) + **MIT** (SDKs). |
| **SaaS Startup (Modern)** | **FSL** (Protects revenue for 2 years, then becomes Open Source). |
| **Corporate/Patent Heavy** | **Apache-2.0** (Explicit patent grant). |

### Perplexity

- Public: https://www.perplexity.ai/search/8b7f03ab-209c-4894-ab2e-5e2bf790f9d0

MIT and Apache-2.0 are both widely accepted, but Apache-2.0 adds an explicit patent grant and stronger protection around trademarks and contributions, which makes it safer for companies and AI-heavy work; MIT is simpler but offers less clarity on patents and downstream protections.[1][2][3]

## MIT vs Apache-2.0

- **MIT**: Very short, permissive, allows reuse in proprietary code with minimal obligations (keep copyright and license notice, no warranty).[3][1]
- **Apache-2.0**: Also permissive, but adds:
  - Explicit patent license and termination if someone sues over patents.  
  - Explicit notice requirements for changes and attribution.  
  - Some guardrails around trademarks and contributions.[2][4]

In practice today, both are “enterprise friendly,” but Apache-2.0 is often preferred for infrastructure, libraries, and AI tooling where patent risk is a concern; MIT maximizes simplicity and adoption, especially for frontend, plugins, examples, and starter kits.[2][3]

## What Jupyter and Berkeley use/recommend

- Jupyter: The core Jupyter projects use the **3‑Clause BSD** license, another very permissive “MIT‑style” license.[5][6][7]
- UC Berkeley / IPIRA / OSPO:  
  - Common licenses at Berkeley include **BSD, GPL, LGPL, Artistic, MIT**, plus a UC “academic license” for academic/nonprofit use with separate commercial licensing.[8][9][10]
  - Official guidance is: talk to OTL/IPIRA, choose from OSI‑approved licenses depending on your goals (broad adoption vs. dual-licensing vs. keeping some commercial leverage).[10][11][8]
  - UC system–level OSS guidance explicitly calls out GPLv3 and Apache-2.0 as having patent grants that need to be understood and managed.[4][12]

For something in the Jupyter / UCB ecosystem where you want “max adoption, low friction,” BSD-3 or MIT are very aligned with existing practice; if there is any patent-sensitive work or you want stronger guarantees for downstream users, Apache-2.0 is reasonable and consistent with UC’s attention to patent clauses.[12][5][8]

## What Midday and similar projects use

- Midday main app: **AGPL-3.0 with commercial option** – AGPL for non-commercial use, paid commercial license for companies. This is classic “open core / source-available plus commercial” positioning.[13]
- Midday v1 starter kit: **MIT**, to maximize adoption of the starter and allow people to build proprietary SaaS on it.[14][15]
- Midday engine SDK: **Apache-2.0**, which is a good fit for SDKs used by other companies.[15]

Pattern: core product under **AGPL + commercial license**, peripheral tooling or starter kits under **MIT/Apache-2.0**, exactly the kind of split startups use when they want both community visibility and commercial leverage.[13][14][15]

## Startups, open core vs “pure” open source, and AGPL

**For startups / open core:**

- Typical choices for server-side “core”:  
  - **AGPL-3.0** when you want:
    - To force improvements that run as a network service to be contributed back (closes the “SaaS loophole”).  
    - To deter cloud vendors from offering your product as a service without cooperating.[16]
  - **GPL-3.0** when you want copyleft but are less focused on SaaS/network use; still strong reciprocity, but weaker than AGPL for cloud.[16]
- Business model: AGPL for community and self-hosters, plus a commercial license for enterprises that want to embed or avoid reciprocity. This is explicitly recommended by many open-core discussions and matches Midday’s pattern.[13][16]

**When to avoid AGPL:**

- If your primary goal is **maximal adoption by companies and other projects**, AGPL is often a blocker; many enterprises have a blanket “no AGPL” policy.[16]
- If your project is a **plugin, VS Code extension, or library** that you want people to adopt with minimal legal review, AGPL is usually the wrong choice; MIT/BSD/Apache-2.0 are much friendlier here.[16]

**When AGPL makes sense:**

- Infrastructure that could easily be “strip-mined” by cloud providers (databases, monitoring, orchestration, AI services).[16]
- SaaS products where the code is your main asset and you explicitly want an open-core + commercial dual-license model.[13][16]

## Current landscape and AI-era sentiment (Jan 2026)

- **Permissive dominance continues**: MIT and Apache-2.0 together account for well over 70% of usage on major package ecosystems; in many package managers, they exceed 85% combined.[3]
- Recent empirical work shows Apache-2.0 trending up and on track to rival/overtake MIT in many ecosystems, but MIT is still the single most-used permissive license overall.[3]
- OSI and others still list **MIT, Apache-2.0, BSDs, and GPLs** as the most popular OSI-approved licenses; these remain the mainstream, even with AI.[17][1]

**AI-specific considerations and sentiment:**

- For **AI models and datasets**, Apache-2.0 and MIT remain popular, but Apache-2.0’s patent grant is increasingly valued when models and inference code may be covered by patents.[2]
- Policy/standards bodies (e.g., OSI’s Open Source AI Definition work, NIST AI Risk Management discussions) focus less on “which license” and more on **data provenance, transparency, and regulatory compliance**; license choice is part of a bigger compliance story, especially in EU AI Act and California’s new AI laws.[18][19]
- Community sentiment is split:  
  - A large camp still pushes **permissive** for “freedom to build anything” and ecosystem growth.[1][3]
  - A growing camp, especially burned by cloud vendors and AI scraping, leans toward **AGPL or more restrictive terms** for infrastructure and high-value code, sometimes even non-OSI “source available” licenses.[20][21][22][16]

This has produced a pattern in AI infrastructure: **libraries and SDKs permissive (MIT/Apache/BSD), core services and platforms increasingly AGPL or source-available**, with commercial terms layered on top.[19][2][16]

## Concrete recommendations for your case

Given you are:

- Building VS Code extensions and dev tooling.  
- Operating in UC Berkeley / public sector / research-adjacent contexts.  
- Thinking about open core vs SaaS and AI-heavy workflows.

A practical decision tree:

- If goal is **“max adoption, minimal friction, especially for VS Code extensions / frontends / starters”**:  
  - Use **MIT** or **BSD-3** (aligns with Jupyter and is widely accepted), or **Apache-2.0** if you want the explicit patent grant.[7][5][2]
- If goal is **“ecosystem library or SDK that companies will embed”**:  
  - Prefer **Apache-2.0** for explicit patent grant and corporate comfort, or MIT if you value simplicity over patent clarity.[4][2][3]
- If goal is **“open core SaaS / infra where you want commercial leverage and to deter cloud strip-mining”**:  
  - License the core server under **AGPL-3.0** and keep SDKs/frontends MIT/Apache-2.0; offer a **commercial license** for enterprises that want to close derivatives or avoid AGPL obligations. This closely mirrors Midday’s approach.[14][13][16]
- For work connected to **UCB OSPO / IPIRA** and possible patents:  
  - Loop IPIRA/OTL early, since they explicitly offer support on choosing OSI licenses or the UC academic license if you want academic‑only free use with commercial licensing reserved.[11][8][10]

If you describe one specific repo (e.g., “VS Code extension X that calls backend Y, which is open core/closed”), a tailored license split for frontend vs backend can be sketched in a follow-up.

Sources
[1] Top Open Source licenses in 2025 https://opensource.org/blog/top-open-source-licenses-in-2025
[2] Quick Guide to Popular AI Licenses - Mend.io https://www.mend.io/blog/quick-guide-to-popular-ai-licenses/
[3] [PDF] A Large-Scale Empirical Study of Open Source License Usage https://xing-hu.github.io/assets/papers/msr2024.pdf
[4] Open Source Software - Lawrence Berkeley National Laboratory https://www.lbl.gov/terms-and-conditions/open-source-software/
[5] Licensing terms for Project Jupyter code https://jupyter.org/governance/projectlicense.html
[6] Project Jupyter LICENSE - GitHub https://raw.githubusercontent.com/jupyter/governance/main/docs/projectlicense.md
[7] Project Jupyter | About Us https://jupyter.org/about
[8] What are some open source licenses that are commonly used by the ... https://ipira.berkeley.edu/faq/general/what-are-some-open-source-licenses-are-commonly-used-ucb-community-and-where-can-i
[9] Software Disclosures | Intellectual Property & Industry Research ... https://ipira.berkeley.edu/researchers/intellectual-property-protection/software-disclosures
[10] Frequently Asked Questions - IPIRA-Berkeley https://ipira.berkeley.edu/about/frequently-asked-questions
[11] Which types of licensing models can I use to distribute the software I ... https://ipira.berkeley.edu/faq/general/which-types-licensing-models-can-i-use-distribute-software-i-have-developed-berkeley
[12] [PDF] OSS Chart Companion Introduction Review of OSS License Options https://security.ucop.edu/files/documents/resources/oss-chart-companion.pdf
[13] midday-ai/midday: Invoicing, Time tracking, File ... - GitHub https://github.com/midday-ai/midday
[14] midday-ai/v1: An open-source starter kit based on Midday. - GitHub https://github.com/midday-ai/v1
[15] midday-ai repositories - GitHub https://github.com/orgs/midday-ai/repositories
[16] Open Source Licenses Explained: The Good, The Bad, and The ... https://dev.to/polliog/open-source-licenses-explained-the-good-the-bad-and-the-wait-can-i-actually-use-this-2nih
[17] Open Source Statistics And Facts (2025) - ElectroIQ https://electroiq.com/stats/open-source-statistics/
[18] Final Board Report - Open Source Initiative https://opensource.org/ai/final-board-report
[19] Open Source AI: The Ultimate Risk & Reward Guide - AiExponent https://aiexponent.com/open-source-ai-the-ultimate-risk-reward-guide/
[20] Reviewing open source trends in 2024 - Duck Alignment Academy https://duckalignment.academy/reviewing-2024-trends/
[21] What are your thoughts on open source work in the wake of AI ... https://www.reddit.com/r/ExperiencedDevs/comments/1is8g6l/what_are_your_thoughts_on_open_source_work_in_the/
[22] I gave the AI arms and legs then it rejected me - Hacker News https://news.ycombinator.com/item?id=44808794
[23] Awesome Open Source Software Research Data - GitHub https://github.com/sboysel/awesome-oss-research-data
[24] Octoverse: AI leads Python to top language as the number of global ... https://github.blog/news-insights/octoverse/octoverse-2024/
[25] Has MIT Opened Pandora's Box on AI Being a Bubble? - StudioAlpha https://studioalpha.substack.com/p/has-mit-opened-pandoras-box-on-ai
[26] Which open sourced projects will blow up in 2024? - Reddit https://www.reddit.com/r/opensource/comments/18kp29h/which_open_sourced_projects_will_blow_up_in_2024/
[27] [PDF] 2024 State of Open Source Report - OpenLogic https://www.openlogic.com/sites/default/files/pdfs/report-ol-state-of-oss-2024.pdf
[28] Open Source Software Startup Program - IPIRA-Berkeley https://ipira.berkeley.edu/open-source-software-startup-program
[29] What is open source software? - IPIRA-Berkeley https://ipira.berkeley.edu/faq/general/what-open-source-software
[30] Which license you would choose when you opensouce a ... https://www.reddit.com/r/Python/comments/2z4k2q/which_license_you_would_choose_when_you_opensouce/
