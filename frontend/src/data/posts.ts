export interface Author {
  name: string;
  avatar: string;
  bio: string;
  twitter: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: Author;
  category: string;
  tags: string[];
  coverImage: string;
  publishedAt: string;
  readTime: number;
  status: "published" | "draft";
  views: number;
  featured?: boolean;
}

export const AUTHOR: Author = {
  name: "Jonathan Salgado Vega",
  avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop&auto=format",
  bio: "Software engineer, occasional designer, and full-time thinker. Writing about code, craft, and the space between.",
  twitter: "@jonathansalgadovega",
};

export const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    slug: "architecture-of-silence",
    title: "The Architecture of Silence: Why I Left Social Media",
    excerpt: "After six years of algorithmic living, I deleted every account in a single afternoon. Here's what happened next — and what I found in the quiet.",
    content: `## The Decision

It was a Tuesday in March when I realized I hadn't had a thought that was entirely my own in months.

Every morning began the same way: phone face-down on the nightstand, screen lighting up with a barrage of opinions I hadn't asked for. By the time I reached the coffee maker, I had already absorbed the outrage of the morning, the consensus take, the hot contrarian counter-take.

I was full before I'd had time to be hungry.

> "What would it mean to think in the first person again — not as a reaction, but as an origin?"

That question sat with me for three weeks before I acted on it. And then one afternoon, methodically, I deleted everything.

## What the Algorithm Takes

Social media doesn't steal your time. It's subtler than that. It colonizes the *texture* of your attention — the quality of how you're present to any given moment.

When you're trained to think in tweetable units, longer thoughts become harder to hold. When every experience is implicitly composable content, you stop fully inhabiting experiences. You become a scout for your own future posts.

This is the invisible tax. Not the hours — the *depth*.

## What I Found in the Quiet

The first week was genuinely uncomfortable. I reached for my phone reflexively, dozens of times a day, thumb already moving toward a phantom app.

By week two, something shifted. I started finishing books. Not because I'd scheduled reading time, but because my nervous system had stopped expecting the next notification.

By month two, I was writing again — not for an audience, but for the pleasure of articulating something precisely.

## The Infrastructure of a Slower Life

Here's what replaced the feeds:

**RSS feeds** via a local reader. I curate what I read. No algorithm optimizes for engagement.

**Email newsletters** from writers whose work I trust. One a day, at most.

**Long walks without headphones.** This one felt radical.

**Books.** Predictably.

None of this is original. None of it is a product. It doesn't scale. That's the point.

## On Missing Out

I do miss things. I miss the ambient awareness of what people I care about are doing. I miss the community that forms around shared references.

But I've started to wonder if "missing out" is the price of paying in. Every hour not spent scrolling is an hour available for the deeper engagement that makes life feel substantial.

The architecture of silence turns out to be load-bearing.`,
    author: AUTHOR,
    category: "Personal",
    tags: ["digital-transformation", "digital-strategy", "innovation"],
    coverImage: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-08-14",
    readTime: 7,
    status: "published",
    views: 8241,
    featured: true,
  },
  {
    id: "2",
    slug: "typescript-type-predicates",
    title: "Type Predicates Are the Underrated Gem of TypeScript",
    excerpt: "You've probably written dozens of `typeof x === 'string'` checks. Type predicates let you name that logic, reuse it, and get proper narrowing across your entire codebase.",
    content: `## The Problem

TypeScript narrows types within specific code blocks, but that narrowing doesn't travel:

\`\`\`typescript
function processInput(input: string | number) {
  if (typeof input === "string") {
    // TypeScript knows it's string here
    console.log(input.toUpperCase()); // ✓
  }
}
\`\`\`

But what happens when you want to extract that check into its own function?

\`\`\`typescript
function isString(value: unknown) {
  return typeof value === "string";
}

function processInput(input: string | number) {
  if (isString(input)) {
    console.log(input.toUpperCase()); // ✗ Error: 'toUpperCase' not on 'string | number'
  }
}
\`\`\`

TypeScript loses the narrowing. The check is semantically identical, but the compiler can't follow it.

## Enter Type Predicates

A type predicate is a special return type annotation:

\`\`\`typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}
\`\`\`

The syntax \`value is string\` tells TypeScript: "If this function returns \`true\`, then the parameter \`value\` should be narrowed to type \`string\` in the calling scope."

Now the narrowing travels:

\`\`\`typescript
function processInput(input: string | number) {
  if (isString(input)) {
    console.log(input.toUpperCase()); // ✓
  }
}
\`\`\`

## Real-World Patterns

**Guard pattern for API responses:**

\`\`\`typescript
interface ApiUser {
  id: number;
  name: string;
  email: string;
}

function isApiUser(value: unknown): value is ApiUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value
  );
}

async function fetchUser(id: number): Promise<ApiUser> {
  const data = await fetch(\`/api/users/\${id}\`).then(r => r.json());
  if (!isApiUser(data)) throw new Error("Invalid API response");
  return data;
}
\`\`\`

**Filtering with type safety:**

\`\`\`typescript
const mixed: (string | null | undefined)[] = ["hello", null, "world", undefined, "!"];

// Without predicate: string[]
const withPredicate = mixed.filter((x): x is string => x != null);
\`\`\`

## Caveats

Type predicates are assertions, not proofs. TypeScript trusts you. If your predicate lies, the compiler won't catch it — but your runtime will.

This is exactly why they're powerful for API boundary validation: you're explicitly taking responsibility for the type claim.

## When to Reach for Them

Use type predicates when:

- You want to extract a type guard into a reusable function
- You're filtering arrays and need the resulting type to be narrowed
- You're validating external data at a system boundary

They're a small feature with outsized payoff. Worth understanding thoroughly.`,
    author: AUTHOR,
    category: "Engineering",
    tags: ["react", "python", "automation"],
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-08-07",
    readTime: 6,
    status: "published",
    views: 5102,
  },
  {
    id: "3",
    slug: "designing-for-trust",
    title: "Designing for Trust: A Field Guide to Interfaces That Don't Lie",
    excerpt: "Trust is fragile in software. It's built incrementally through every micro-decision — a loading state, an error message, a confirmation dialog — and destroyed in an instant when any one of them misleads.",
    content: `## Trust Is the Product

Every interface is implicitly making promises. The question is whether it keeps them.

When a button says "Save," the user expects their data to be saved. When a progress bar moves, they expect something is progressing. When an error message appears, they expect an accurate description of what went wrong.

Design that breaks these implicit contracts doesn't just frustrate users — it erodes their confidence in the entire system.

## The Three Failure Modes

**Overpromising.** The UI implies more certainty than the system has. A progress bar that fills to 99% and hangs. A "you're all set!" screen that appears before the async operation completes.

**Understating.** The UI minimizes the severity of consequences. "Are you sure?" dialogs on destructive actions with no explanation of what "sure" entails.

**Hiding state.** The UI doesn't reflect what the system is actually doing. A form that submits silently. An operation that fails without any visible indication.

## What Honest Interfaces Do

### Show real state

If a form is submitting, show a loading indicator. If it failed, show the error — in plain language, with actionable guidance. If it succeeded, confirm it with specificity.

"Saved" is better than "Success." "Saved to your Drafts folder" is better still.

### Earn destructive actions

Anything irreversible deserves friction proportional to its consequences. Deleting an account and dismissing a notification are not equivalent — don't treat them with identical confirmation patterns.

### Fail gracefully and informatively

Error states are the moment users need you most. Generic messages ("Something went wrong") at these moments feel like abandonment. Name the problem. Suggest what to do next.

### Respect the user's model of time

If an operation will take 30 seconds, say so upfront. People can tolerate waiting; what they can't tolerate is uncertainty about whether anything is happening at all.

## The Invisible Work

Most of this design work is invisible when done correctly. Users don't notice that the error message is precise, or that the loading state appears in under 100ms, or that the confirmation dialog explains consequences.

They just trust the product. That's the goal — to be so reliable that trust becomes the background assumption rather than a conscious calculation.

Trust is designed in the unsexy details.`,
    author: AUTHOR,
    category: "Design",
    tags: ["innovation", "digital-strategy", "enterprise-architecture"],
    coverImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-07-29",
    readTime: 5,
    status: "published",
    views: 3874,
  },
  {
    id: "4",
    slug: "wasm-in-2026",
    title: "WebAssembly in 2026: The Reckoning",
    excerpt: "Five years ago we were promised WASM would change everything. Some of that came true. Some of it didn't. Here's an honest accounting of where the technology landed.",
    content: `## The Promise

WebAssembly arrived with enormous hype. Near-native performance in the browser. Any language targeting the web. The end of JavaScript monopoly.

The actual story is more interesting than the hype, and more nuanced than the inevitable backlash.

## What Actually Happened

**The wins are real, but narrow.** WebAssembly excels in a specific category: computationally intensive tasks that require predictable, high performance. Image processing, video codecs, cryptography, simulation engines, game physics — WASM genuinely transformed these use cases.

Figma's canvas renderer. Photoshop in the browser. Squoosh's compression algorithms. These are not demos. They are production systems serving millions of users.

**The "replace JavaScript" narrative was wrong.** WASM and JS are complementary, not competing. The idiom that emerged is: JS for glue and orchestration, WASM for hot paths. This is a good outcome, even if it's less dramatic than the original promise.

**WASI changed the server-side story.** The WebAssembly System Interface opened WASM beyond the browser. Sandboxed, portable, language-agnostic server modules are now a serious deployment target. Cloudflare Workers, Fastly Compute, and others run WASM natively. This is where I see the most interesting growth.

## The Pain Points That Remain

**Debugging is still painful.** Source maps have improved, but debugging WASM in production is not the experience we'd want.

**Binary size.** Rust WASM binaries have gotten smaller, but a hello-world still ships megabytes of runtime. For small utilities, this remains prohibitive.

**JS interop friction.** Calling between WASM and JS requires serialization at the boundary. High-frequency calls have overhead. The component model (now stable) helps significantly, but the developer experience is still rough.

## The Honest State

WebAssembly solved the problems it was designed to solve — predictable performance for compute-intensive workloads. It didn't replace JavaScript, and it shouldn't.

The more interesting story is WASI and the server-side ecosystem. WASM as a deployment target for backend logic — sandboxed, polyglot, portable — might be the technology's most significant long-term contribution.

2026 is not the year of WebAssembly. But it might be the year we finally know what WebAssembly is *for*.`,
    author: AUTHOR,
    category: "Engineering",
    tags: ["azure-ai", "automation", "enterprise-architecture"],
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-07-20",
    readTime: 8,
    status: "published",
    views: 6718,
  },
  {
    id: "5",
    slug: "writing-in-markdown",
    title: "Why I Journal in Markdown (And What It Changed)",
    excerpt: "Plain text survives. Every proprietary format I've used in the past decade is either dead or degraded. Markdown is just text — humble, readable, permanent.",
    content: `## The Format Wars

I've kept some form of journal since I was sixteen. In that time I've used: physical notebooks, Microsoft Word, Evernote, Notion, Bear, Day One, Apple Notes, and at various points a bespoke wiki built in my garage.

Every migration cost something. Formatting broke. Links rotted. The structure that made sense in one tool became opaque in the next.

Markdown broke the cycle.

## Why Plain Text Wins

A Markdown file is bytes with meaning. It opens in any text editor on any operating system from any decade. There are no proprietary encodings, no cloud dependencies, no company whose continued existence you're betting your memories on.

My oldest Markdown files are from 2019. I can open them right now, unchanged, in the same editor I used to write this post. That's not glamorous — it's just reliable.

## The Thinking Benefit

Something unexpected happened when I switched: my thinking got clearer.

Markdown's constraints force decisions. Is this a header or a paragraph? Is this emphasis, or does the sentence just need rewriting? The markup is light enough that you see through it, but present enough that you have to make structural choices.

I found myself outlining more naturally. The heading hierarchy creates a skeleton. You see the shape of your thinking before you've finished thinking.

## The Friction Is the Feature

Markdown is more friction than a Google Doc or Apple Notes. You have to type \`**\` instead of pressing Cmd+B. Images require a full path.

That friction filters for intentionality. I don't capture everything, I capture what's worth the small effort of structuring. The signal-to-noise ratio in my archive is better than it was in the low-friction tools.

## The Setup

My current setup is deliberately boring:

- **Editor**: Neovim with a minimal Markdown plugin
- **Sync**: Syncthing (no cloud vendor)
- **Storage**: \`~/journal/YYYY/MM/DD.md\`
- **Search**: \`ripgrep\` against the whole directory tree

Total cost: zero. Total vendor lock-in: zero. Total anxiety about the company going under: zero.

The best tools are the ones you forget you're using.`,
    author: AUTHOR,
    category: "Personal",
    tags: ["python", "automation", "digital-strategy"],
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-07-11",
    readTime: 5,
    status: "published",
    views: 4456,
  },
  {
    id: "6",
    slug: "dark-mode-systems",
    title: "Dark Mode Systems That Actually Work",
    excerpt: "Most dark modes are dark-washed versions of a light UI. A well-designed dark mode is a different palette system entirely — with its own contrast hierarchy, shadow model, and surface logic.",
    content: `## The Common Mistake

When teams add dark mode as an afterthought, they invert the light palette and call it done. White becomes black, light gray becomes dark gray, the brand blue stays blue.

This produces interfaces that are *technically* dark but feel wrong. The contrast is off. Shadows disappear against near-black backgrounds. Interactive elements that worked on white lose their affordance.

Dark mode isn't a filter. It's a different design.

## The Surface Model

Light interfaces use shadow and elevation to signal depth. Dark interfaces use *lightness*.

In a dark UI, elements that are "closer" to the user (modals, tooltips, dropdowns) should be slightly lighter than the base surface. The hierarchy runs:

\`\`\`
Base background:    #0C0C0C
Card surface:       #141414
Elevated surface:   #1C1C1C
Modal / tooltip:    #242424
\`\`\`

Each step is subtle — 6-8 points of lightness — but communicates depth without shadows that would disappear into the dark ground.

## Contrast Is Different

On a white background, a dark gray (#333) provides strong contrast. On a near-black background, you don't want pure white text (#FFF) — it's too harsh, creates visual tension, and makes eyes work harder.

The sweet spot for dark mode body text is usually in the 85-92% lightness range. #EFEFEF instead of #FFFFFF. The difference is small but the reading comfort is significant.

## Color Adaptation

Your brand accent color probably doesn't survive into dark mode unchanged. A vivid orange on white reads as energetic. The same orange on near-black can read as garish.

Test each accent at both values. Some colors need saturation reduction in dark mode. Others need a slight hue shift. Electric greens and blues tend to adapt well. Warm yellows and reds often need adjustment.

## Semantic Tokens Are Not Optional

If you're hardcoding color values instead of using semantic tokens, adding dark mode will be painful. The infrastructure investment is:

\`\`\`css
:root {
  --surface: #F7F7F4;
  --surface-elevated: #FFFFFF;
  --text-primary: #111111;
  --text-secondary: #666666;
  --border: #DEDEDE;
}

[data-theme="dark"] {
  --surface: #0C0C0C;
  --surface-elevated: #141414;
  --text-primary: #EFEFEF;
  --text-secondary: #7A7A7A;
  --border: #282828;
}
\`\`\`

Every component references tokens. Switching the theme is one attribute change.

## Test the Uncomfortable States

Most dark mode bugs live in the edge cases: error states, disabled inputs, placeholder text, focus rings, selection highlight. Test each one. They often inherit assumptions from the light design that don't hold.

A good dark mode is invisible. Users switch to it for comfort and forget they're in an alternate mode. That's the goal.`,
    author: AUTHOR,
    category: "Design",
    tags: ["react", "power-platform", "innovation"],
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-06-28",
    readTime: 7,
    status: "published",
    views: 9143,
  },
  {
    id: "7",
    slug: "the-cost-of-perfect-code",
    title: "The Hidden Cost of Perfect Code",
    excerpt: "Clean code has a price. That price is sometimes worth it. Sometimes it's a form of procrastination wearing technical virtue as a costume.",
    content: `## Perfectionism and Productivity

I've reviewed code from engineers who were technically very good — precise typing, clear abstractions, elegant patterns — that was practically useless because it was delivered months late or never at all.

And I've shipped code that made me uncomfortable to look at that solved a real problem and ran in production for years.

The relationship between code quality and software value is not linear.

## When Quality Pays

Technical quality pays when:

- The system will be modified frequently by multiple people
- The cost of bugs is high (financial, safety-critical, user-trust)
- You expect the codebase to last longer than a year
- The team is growing and needs to onboard people efficiently

In these contexts, the upfront investment in clarity and structure pays compounding dividends. Good abstractions make the next change easier. Comprehensive tests make refactoring safe.

## When Quality Becomes Procrastination

Quality becomes procrastination when:

- You're solving a problem that might not exist
- The abstraction you're building serves anticipated future requirements that never materialize
- You're polishing rather than shipping
- The "right way" takes 3x longer than the "good enough way" and the system doesn't warrant it

The engineering community has a pathology around this. We celebrate beautiful code as virtue in itself, disconnected from whether it served its purpose.

## The Honest Calculus

Before optimizing for code quality, ask:

**What's the expected lifetime of this code?** Scripts that run once, experiments, throwaway prototypes — these don't need the same treatment as the authentication system.

**Who else needs to understand and modify this?** Code you write and maintain alone can be less formal. Code that's part of a team system needs to communicate.

**What's the actual cost of the debt?** Not hypothetical future cost — the actual, specific cost of the shortcuts you're taking. Sometimes it's high. Often it's lower than the cost of over-engineering.

## The Uncomfortable Truth

Most code that exists in the world is not beautiful. Most of it works. A lot of it has been working for decades, accreting patches, carrying the marks of every constraint it was built under.

The goal is not beautiful code. The goal is software that solves problems reliably. Quality is one input to that goal — an important one — but not the only one, and not always the most important one.`,
    author: AUTHOR,
    category: "Engineering",
    tags: ["enterprise-architecture", "digital-transformation", "ai-agents"],
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-06-14",
    readTime: 6,
    status: "published",
    views: 7329,
  },
  {
    id: "8",
    slug: "books-that-changed-how-i-think",
    title: "12 Books That Changed How I Think About Systems",
    excerpt: "Not a reading list. A list of books that reorganized how I see problems — in code, in organizations, in the world. Some are about software. Most aren't.",
    content: `## The List

These aren't the books you'd find on a "Top Software Engineering Reads" listicle. Most aren't about engineering at all. They're here because they changed the frame, not just the content.

### 1. *Thinking in Systems* — Donella Meadows

The most clarifying book I've read about why things are hard. Complex systems behave in counterintuitive ways. Intervention points aren't where you think they are. Required reading for anyone who works in or on organizations.

### 2. *The Design of Everyday Things* — Don Norman

Taught me to read the designed world as a language. Every affordance is a claim about user behavior. Every friction is a design decision. Changed how I look at everything I build.

### 3. *A Pattern Language* — Christopher Alexander

Nominally about architecture. Actually about finding the vocabulary for a domain and building from human needs outward. The concept of "pattern languages" arguably inspired design patterns in software, but the original is richer than the derivative.

### 4. *Gödel, Escher, Bach* — Douglas Hofstadter

On strange loops, self-reference, and consciousness. Dense and strange and worth every page. I think about recursion differently after reading it.

### 5. *The Mythical Man-Month* — Fred Brooks

Fifty years old and still correct. Software projects are hard in specific, predictable ways. Brooks named them. They haven't changed.

### 6. *How Buildings Learn* — Stewart Brand

About architecture and time. Buildings are modified by their inhabitants and by the passage of time. Software is too. This book gave me language for thinking about pace layers — which parts of a system change quickly, which slowly.

### 7. *An Inquiry into the Nature and Causes of the Wealth of Nations* — Adam Smith

Specifically for the pin factory. Division of labor, specialization, coordination costs. Applies directly to software teams.

### 8. *Seeing Like a State* — James C. Scott

About legibility, top-down planning, and why ambitious schemes to improve the human condition often fail. Has a direct analog in software architecture.

### 9. *The Structure of Scientific Revolutions* — Thomas Kuhn

On paradigm shifts. The inside of a paradigm is invisible until you're outside it. This applies to technology choices, architectural styles, and organizational cultures.

### 10. *Good Strategy / Bad Strategy* — Richard Rumelt

Strategy is not goals dressed up in language. Good strategy is a diagnosis, a guiding policy, and coherent actions. Taught me to be skeptical of strategy that's really just a list of aspirations.

### 11. *The Practice* — Seth Godin

About creative work and shipping. Short, dense, worth re-reading every year.

### 12. *Understanding Media* — Marshall McLuhan

"The medium is the message." The form of a communication technology shapes what can be communicated through it, independently of content. Email isn't a faster letter. Twitter isn't a shorter blog. The medium reorganizes thought.`,
    author: AUTHOR,
    category: "Personal",
    tags: ["artificial-intelligence", "digital-transformation", "digital-strategy"],
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-05-31",
    readTime: 9,
    status: "published",
    views: 11287,
  },
  {
    id: "9",
    slug: "edge-functions-primer",
    title: "Edge Functions: An Honest Primer for 2026",
    excerpt: "Edge compute is past the hype peak and into the trough of disillusionment. Here's what it's actually good at, where it falls short, and how to decide if it belongs in your stack.",
    content: `## What Edge Functions Actually Are

Edge functions are code that runs at CDN nodes distributed globally, rather than in a centralized datacenter. The selling point: low latency because the compute is physically close to the user.

They're typically constrained: short execution time limits, limited memory, no access to the filesystem, and restricted APIs compared to a Node.js runtime.

## Where They Shine

**A/B testing and personalization at the CDN layer.** Instead of making a round trip to a server to determine which variant to show, you can make that decision at the edge — before the request hits your origin at all. This eliminates the flash of unstyled or wrong-variant content.

**Authentication middleware.** Checking tokens, redirecting unauthenticated users, injecting auth headers — all of this can happen at the edge without loading your application server.

**Geolocation routing.** Redirecting users to region-specific content or endpoints based on their location, without the latency of a server round trip.

**Static content transformation.** Resizing images, modifying headers, injecting analytics tags — transformations on content that doesn't need application logic.

## Where They Fall Short

**Cold starts.** Despite the marketing, cold starts at the edge are not zero. On low-traffic routes, the first request after inactivity pays a startup penalty.

**Debugging.** Distributed execution environments are harder to debug than centralized ones. Logging is often limited. Reproducing edge-specific bugs locally is non-trivial.

**Database access.** The edge is geographically distributed; your database is almost certainly not. Accessing a centralized database from an edge function can *increase* latency compared to a centralized server. Edge-native databases (Turso, D1, Neon's branching) partially solve this but introduce their own complexity.

**Operational complexity.** Managing code at the edge layer adds a deployment surface. Another thing to configure, monitor, and debug.

## The Honest Verdict

Edge functions are excellent for a specific category of middleware-pattern workloads: decision-making and transformation that can happen without database access.

For application logic that needs data, they're often the wrong tool. The architecture that makes them fast (distributed, stateless) makes data access hard.

Reach for them deliberately, not because they're new.`,
    author: AUTHOR,
    category: "Engineering",
    tags: ["azure-ai", "power-automate", "hyperautomation"],
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-05-18",
    readTime: 7,
    status: "draft",
    views: 0,
  },
  {
    id: "10",
    slug: "technical-interview-art",
    title: "The Art of the Technical Interview (From Both Sides)",
    excerpt: "I've conducted over 200 technical interviews and failed a number I should have passed. Here's what I actually look for — and what most candidates misunderstand about what the process is measuring.",
    content: `## What Interviews Measure

Technical interviews are a poor proxy for job performance. Everyone in the industry knows this. They persist anyway, partly because no one has found a reliably better alternative at scale, and partly because bad proxies are still proxies.

Given this reality, the question isn't "are interviews fair?" (they're not, entirely). The question is: what are they actually measuring, and how do you optimize for that signal?

## What I Look For As An Interviewer

**Thinking out loud.** The actual content of the solution matters less than the thinking process. An interviewer can tell the difference between "I'm stuck and flailing" and "I'm working through a problem systematically and narrating my progress." The second signals how you'll actually work.

**Asking clarifying questions.** The best candidates treat the problem like a real problem: they identify ambiguities, make assumptions explicit, and check those assumptions with the interviewer. This mirrors how they'll handle requirements in the job.

**Graceful degradation under uncertainty.** Everyone hits a point where they don't know. What happens then? Candidates who give up or pretend to know something they don't fare worse than candidates who say "I'm not sure how to approach this. Let me think about related problems I do know and see if anything transfers."

**The ability to receive feedback.** I will often give hints or redirects during interviews. How a candidate receives and incorporates that feedback is more signal than the initial solution.

## What Most Candidates Misunderstand

**The interview is a conversation, not a test.** The adversarial framing — candidate vs. interviewer, prove yourself — leads to poor performance. The better frame: two people collaboratively exploring a problem.

**Silence is a signal too.** Long periods of silent thinking, with no communication, feel uncomfortable in an interview. You can think out loud about dead ends. "This approach won't work because... so let me try a different angle."

**The optimal solution isn't the goal.** A correct brute force solution with a good explanation of why it's brute force and how you'd improve it often scores higher than a clever solution with no explanation.

## Preparing

Practice speaking out loud while solving problems. This sounds trivial and is harder than it sounds.

Do a handful of mock interviews with a friend or colleague who will give you honest feedback.

Know the time complexities of common data structures and operations. You should be able to reason about tradeoffs without having to calculate from first principles.

The rest is mostly managing the anxiety that comes with being evaluated. Which is its own skill.`,
    author: AUTHOR,
    category: "Career",
    tags: ["microsoft-copilot", "copilot-studio", "digital-transformation"],
    coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=700&fit=crop&auto=format",
    publishedAt: "2026-05-03",
    readTime: 8,
    status: "draft",
    views: 0,
  },
];

export const CATEGORIES = ["Engineering", "Design", "Personal", "Career"];
export const ALL_TAGS = [
  "digital-transformation",
  "artificial-intelligence",
  "copilot-studio",
  "microsoft-copilot",
  "azure-ai",
  "power-platform",
  "power-automate",
  "automation",
  "python",
  "react",
  "enterprise-architecture",
  "innovation",
  "ai-agents",
  "hyperautomation",
  "digital-strategy",
];
