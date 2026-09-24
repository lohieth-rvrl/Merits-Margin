// Real, stable, well-known authoritative sites per category, used for the
// "Sources & further reading" section at the end of auto-generated articles.
// These are intentionally organization-level links (not specific article
// URLs) to avoid ever citing a fabricated or dead link -- the model never
// invents these, they're hand-picked and fixed.

module.exports = {
  finance: [
    { name: "Consumer Financial Protection Bureau", url: "https://www.consumerfinance.gov" },
    { name: "Investopedia", url: "https://www.investopedia.com" },
    { name: "Investor.gov (U.S. SEC)", url: "https://www.investor.gov" },
  ],
  career: [
    { name: "U.S. Bureau of Labor Statistics", url: "https://www.bls.gov" },
    { name: "O*NET Online", url: "https://www.onetonline.org" },
    { name: "U.S. Department of Labor", url: "https://www.dol.gov" },
  ],
  news: [
    { name: "Federal Reserve", url: "https://www.federalreserve.gov" },
    { name: "U.S. Bureau of Labor Statistics", url: "https://www.bls.gov" },
    { name: "Reuters Business", url: "https://www.reuters.com/business" },
  ],
};
