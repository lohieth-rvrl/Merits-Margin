// Run once after setting up your MongoDB Atlas cluster:
//   node seed.js
// Reads MONGODB_URI, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD from .env

require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const Article = require("./models/Article");

const articles = [
  {
    title: "How to Build a Budget When Your Income Isn't the Same Every Month",
    slug: "budget-with-irregular-income",
    category: "finance",
    date: new Date("2026-06-02"),
    readTime: "7 min read",
    dek: "A percentage-based system that works whether you're freelancing, on commission, or between gigs.",
    toc: [
      "Start with your floor, not your average",
      "Use percentages, not fixed dollar amounts",
      "Build a one-month buffer before anything else",
      "Review monthly, not daily",
    ],
    related: ["emergency-fund-how-much", "credit-card-debt-payoff-strategies", "freelance-vs-fulltime-pay"],
    body: `## Start with your floor, not your average
Most budgeting advice assumes a steady paycheck. If your income moves month to month, averaging it out is the wrong starting point -- an average hides the bad months, and the bad months are exactly when a budget needs to hold up.

Instead, look back over the last 6-12 months and find your **lowest** earning month. That number is your floor.

## Use percentages, not fixed dollar amounts
- **50%** to essentials and near-term bills
- **20%** to savings and debt payoff beyond the minimum
- **20%** to a buffer account that smooths out next month
- **10%** to discretionary spending

## Build a one-month buffer before anything else
Before investing or aggressively paying down debt, put one full month of your floor expenses into a separate account you don't touch.

## Review monthly, not daily
Set one review day a month: log what came in, refill the buffer if it dipped, and adjust the next month's percentages if your floor has genuinely changed.`,
  },
  {
    title: "Emergency Fund: How Much Do You Actually Need?",
    slug: "emergency-fund-how-much",
    category: "finance",
    date: new Date("2026-05-18"),
    readTime: "6 min read",
    dek: "The standard \"3 to 6 months\" advice isn't wrong, but it's incomplete. Here's how to size yours.",
    toc: [
      "Why the generic range exists",
      "What should actually change your number",
      "Where to actually keep it",
      "Start smaller if 3-6 months feels impossible",
    ],
    related: ["budget-with-irregular-income", "credit-card-debt-payoff-strategies", "rising-rates-savings-accounts"],
    body: `## Why the generic range exists
The 3-to-6-months rule comes from a simple idea: if you lost your income today, how long could you cover essential costs before things got desperate?

## What should actually change your number
- **Job stability** -- commission-based or contract work pushes you toward the higher end
- **Number of income earners in your household**
- **Fixed obligations** -- dependents, medical needs, or a mortgage
- **How fast you could realistically re-earn income**

## Where to actually keep it
A high-yield savings account, not a brokerage account. The goal is availability, not growth.

## Start smaller if 3-6 months feels impossible
A starter target of $1,000-$2,000 still covers most common emergencies while you build toward the larger number.`,
  },
  {
    title: "Credit Card Debt Payoff Strategies, Compared Honestly",
    slug: "credit-card-debt-payoff-strategies",
    category: "finance",
    date: new Date("2026-04-30"),
    readTime: "8 min read",
    dek: "Avalanche vs. snowball vs. consolidation -- what actually gets people out of debt fastest, and what actually gets finished.",
    toc: ["The avalanche method", "The snowball method", "Which one actually works better", "When consolidation makes sense"],
    related: ["emergency-fund-how-much", "budget-with-irregular-income", "freelance-vs-fulltime-pay"],
    body: `## The avalanche method
Pay minimums on everything, then throw every extra dollar at the card with the **highest interest rate** first.

## The snowball method
Pay minimums on everything, then throw every extra dollar at the **smallest balance** first, regardless of interest rate.

## Which one actually works better
The honest answer is whichever one you'll stick with.

## When consolidation makes sense
A balance-transfer card or personal loan can help if you qualify for a meaningfully lower rate and have a concrete plan to avoid re-running the balance back up.`,
  },
  {
    title: "How to Write a Resume When You Don't Have Direct Work Experience",
    slug: "resume-with-no-experience",
    category: "career",
    date: new Date("2026-06-10"),
    readTime: "6 min read",
    dek: "Coursework, projects, and volunteer work can carry real weight -- if you frame them the right way.",
    toc: [
      "Lead with a skills summary, not a work history gap",
      "Reframe projects and coursework as accomplishments",
      "Volunteer and informal work counts",
      "Use the job posting's own language",
    ],
    related: ["salary-negotiation-scripts", "highest-paying-remote-jobs", "freelance-vs-fulltime-pay"],
    body: `## Lead with a skills summary, not a work history gap
Open with a 3-4 line summary that states the role you want and the concrete skills you bring to it.

## Reframe projects and coursework as accomplishments
"Built a budgeting app used by 40 classmates" reads like real experience, even without a job title attached to it.

## Volunteer and informal work counts
Running a club, organizing an event, or freelancing informally are all legitimate resume content.

## Use the job posting's own language
Pull key phrases directly from the job description and mirror them in your skills and summary sections.`,
  },
  {
    title: "Salary Negotiation Scripts That Actually Work",
    slug: "salary-negotiation-scripts",
    category: "career",
    date: new Date("2026-05-25"),
    readTime: "7 min read",
    dek: "Exact phrasing for the moments that usually trip people up -- the counter-offer, the silence, and the final ask.",
    toc: ["Never give a number first if you can avoid it", "Responding to an offer below your target", "Sitting with silence", "Negotiating beyond base salary"],
    related: ["resume-with-no-experience", "highest-paying-remote-jobs", "budget-with-irregular-income"],
    body: `## Never give a number first if you can avoid it
"I'd like to learn more about the role's scope first -- what range has the team budgeted for this position?"

## Responding to an offer below your target
"Thank you for the offer -- I'm genuinely excited about this role. Based on my research, I was expecting something closer to [number]. Is there flexibility here?"

## Sitting with silence
After you state your number, stop talking.

## Negotiating beyond base salary
Signing bonus, extra vacation days, a title adjustment, or an earlier performance review date.`,
  },
  {
    title: "Highest-Paying Remote Jobs Worth Training Toward Right Now",
    slug: "highest-paying-remote-jobs",
    category: "career",
    date: new Date("2026-06-20"),
    readTime: "6 min read",
    dek: "Roles with genuine remote demand and real salary growth, not just \"work from anywhere\" listicle filler.",
    toc: ["What makes a remote role durable, not just trendy", "Fields worth a closer look", "How to actually break in"],
    related: ["salary-negotiation-scripts", "resume-with-no-experience", "freelance-vs-fulltime-pay"],
    body: `## What makes a remote role durable, not just trendy
The most reliable remote roles share two traits: measurable output, and an ongoing skills shortage.

## Fields worth a closer look
- **Cloud and DevOps engineering**
- **Technical/product-adjacent writing**
- **Data and analytics**
- **Customer success for B2B software**

## How to actually break in
A public GitHub project, a written case study, or a small freelance client result demonstrates capability faster than a credential alone.`,
  },
  {
    title: "What Rising Interest Rates Actually Mean for Your Savings Account",
    slug: "rising-rates-savings-accounts",
    category: "news",
    date: new Date("2026-06-25"),
    readTime: "5 min read",
    dek: "Higher rates aren't only bad news -- here's the side of the story that gets less coverage.",
    toc: ["The part that gets the headlines", "The part that doesn't", "What to actually do about it"],
    related: ["emergency-fund-how-much", "is-now-good-time-buy-house", "freelance-vs-fulltime-pay"],
    body: `## The part that gets the headlines
Coverage of rate changes usually focuses on borrowers -- higher mortgage rates, pricier auto loans, tighter credit.

## The part that doesn't
Higher rates typically mean better yields on savings accounts and CDs, sometimes meaningfully so.

## What to actually do about it
Check what competitive high-yield accounts are currently offering -- moving cash between them is usually free and immediate.`,
  },
  {
    title: "Is Now a Good Time to Buy a House? What the Data Actually Says",
    slug: "is-now-good-time-buy-house",
    category: "news",
    date: new Date("2026-06-05"),
    readTime: "7 min read",
    dek: "Less \"gut feeling,\" more of the numbers worth checking before you decide.",
    toc: ["There is no single right answer", "The market-level factors worth checking", "The personal factors that matter more than timing the market"],
    related: ["rising-rates-savings-accounts", "emergency-fund-how-much", "budget-with-irregular-income"],
    body: `## There is no single right answer
"Is now a good time" is really three separate questions: prices, borrowing costs, and your own finances and life plans.

## The market-level factors worth checking
- Local inventory levels
- How long homes are sitting on the market
- Whether local prices are rising, flat, or falling year-over-year

## The personal factors that matter more than timing the market
How long you plan to stay in the home matters more than short-term price movement.`,
  },
  {
    title: "Freelance vs. Full-Time: Which Actually Pays Better Right Now",
    slug: "freelance-vs-fulltime-pay",
    category: "news",
    date: new Date("2026-06-15"),
    readTime: "6 min read",
    dek: "A fair comparison has to account for benefits, taxes, and time -- not just the headline hourly rate.",
    toc: ["Why the raw hourly comparison is misleading", "What to actually add to a freelance rate", "Where freelancing genuinely wins"],
    related: ["budget-with-irregular-income", "highest-paying-remote-jobs", "rising-rates-savings-accounts"],
    body: `## Why the raw hourly comparison is misleading
A freelance rate of $60/hour looks far better than a full-time salary that works out to $35/hour -- until you account for benefits and taxes a salary quietly absorbs.

## What to actually add to a freelance rate
A reasonable rule of thumb: charge roughly 1.5-2x an equivalent full-time hourly wage.

## Where freelancing genuinely wins
Schedule control and, for people who can keep a full pipeline, a higher earnings ceiling than a fixed salary allows.`,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in .env — cannot seed.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  // Create the admin account, if it doesn't already exist
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "").toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await Admin.hashPassword(adminPassword);
      await Admin.create({ email: adminEmail, passwordHash });
      console.log(`Created admin account: ${adminEmail}`);
    } else {
      console.log(`Admin account already exists: ${adminEmail}`);
    }
  } else {
    console.log("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin creation.");
  }

  // Seed articles, skipping any that already exist (by slug)
  let created = 0;
  for (const a of articles) {
    const exists = await Article.findOne({ slug: a.slug });
    if (!exists) {
      await Article.create(a);
      created++;
    }
  }
  console.log(`Seeded ${created} new article(s) (${articles.length - created} already existed).`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
