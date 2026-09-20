// A rotating list of evergreen topics for the daily article automation.
// No external trends API -- the script works through this list in order,
// remembering where it left off in state.json, and wraps back to the start
// once it reaches the end. Add, remove, or reorder freely.

module.exports = [
  // ---- Finance ----
  { topic: "How to build a 6-month emergency fund from scratch", category: "finance" },
  { topic: "The debt avalanche vs. debt snowball method, compared honestly", category: "finance" },
  { topic: "How compound interest actually works, with real numbers", category: "finance" },
  { topic: "A beginner's guide to index fund investing", category: "finance" },
  { topic: "How to negotiate a lower interest rate on existing debt", category: "finance" },
  { topic: "The true cost of only paying credit card minimums", category: "finance" },
  { topic: "How to build a budget on an irregular or freelance income", category: "finance" },
  { topic: "Roth IRA vs. traditional IRA -- which fits which situation", category: "finance" },
  { topic: "How to read a credit report and dispute an error", category: "finance" },
  { topic: "The 50/30/20 budgeting rule, and when it doesn't fit", category: "finance" },
  { topic: "How to automate your savings so it actually sticks", category: "finance" },
  { topic: "What actually happens to your credit score after a late payment", category: "finance" },
  { topic: "How to decide between renting and buying a home right now", category: "finance" },
  { topic: "A practical guide to building credit from zero", category: "finance" },
  { topic: "How high-yield savings accounts actually compare to a normal bank", category: "finance" },
  { topic: "How to plan a no-spend month without it feeling miserable", category: "finance" },
  { topic: "What a 401(k) match actually means for your paycheck", category: "finance" },
  { topic: "How to spot a predatory loan before you sign anything", category: "finance" },

  // ---- Career ----
  { topic: "How to answer 'What's your biggest weakness' without a cliche", category: "career" },
  { topic: "How to ask for a raise using real numbers, not just tenure", category: "career" },
  { topic: "How to write a resume when switching industries entirely", category: "career" },
  { topic: "What to do in the first 90 days of a new job", category: "career" },
  { topic: "How to handle a counteroffer when you've already accepted elsewhere", category: "career" },
  { topic: "How to build a portfolio when you have no professional projects yet", category: "career" },
  { topic: "The real difference between a manager and a mentor", category: "career" },
  { topic: "How to negotiate remote work into an in-office offer", category: "career" },
  { topic: "How to explain a resume gap without over-explaining it", category: "career" },
  { topic: "What actually helps in a performance review, from both sides", category: "career" },
  { topic: "How to tell if a company's culture is healthy before you join", category: "career" },
  { topic: "How to network without it feeling transactional", category: "career" },
  { topic: "When it's actually time to quit a job you don't hate", category: "career" },
  { topic: "How to ask for a letter of recommendation the right way", category: "career" },
  { topic: "How to prepare for a panel interview with multiple people", category: "career" },

  // ---- Money News / trends commentary ----
  { topic: "What a Federal Reserve rate decision actually changes for regular people", category: "news" },
  { topic: "How inflation numbers translate into your actual grocery bill", category: "news" },
  { topic: "What rising or falling mortgage rates mean for buyers this year", category: "news" },
  { topic: "How remote work trends are actually affecting salaries by city", category: "news" },
  { topic: "What a stock market correction means for someone not actively trading", category: "news" },
  { topic: "How layoff waves in tech have actually changed hiring elsewhere", category: "news" },
  { topic: "What gig economy platforms don't tell you about total take-home pay", category: "news" },
  { topic: "How student loan policy changes affect repayment strategy", category: "news" },
];
