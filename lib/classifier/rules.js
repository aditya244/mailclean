import { GoogleGenerativeAI } from "@google/generative-ai";

const KNOWN_DOMAINS = {
  // ─── Indian Banks ───────────────────────────────────────────
  "hdfcbank.com": { category: "Finance", confidence: 0.97 },
  "hdfcbank.net": { category: "Finance", confidence: 0.97 },
  "icicibank.com": { category: "Finance", confidence: 0.97 },
  "axisbank.com": { category: "Finance", confidence: 0.97 },
  "sbi.co.in": { category: "Finance", confidence: 0.97 },
  "kotak.com": { category: "Finance", confidence: 0.97 },
  "yesbank.in": { category: "Finance", confidence: 0.97 },
  "indusind.com": { category: "Finance", confidence: 0.97 },
  "pnbindia.in": { category: "Finance", confidence: 0.97 },
  "unionbankofindia.co.in": { category: "Finance", confidence: 0.97 },
  "federalbank.co.in": { category: "Finance", confidence: 0.97 },
  "idfcfirstbank.com": { category: "Finance", confidence: 0.97 },
  "aubank.in": { category: "Finance", confidence: 0.97 },
  // ─── Indian Banks (subdomains) ───────────────────────────────
  "hdfcbank.bank.in": { category: "Finance", confidence: 0.97 },
  "custcomm.icicibank.com": { category: "Finance", confidence: 0.97 },
  "communications.sbi.co.in": { category: "Finance", confidence: 0.97 },
  "info.paytm.com": { category: "Transactions", confidence: 0.97 },

  // ─── Investments / Mutual Funds ──────────────────────────────
  "miraeassetmf.co.in": { category: "Finance", confidence: 0.97 },
  "mailer.moneycontrol.com": { category: "Newsletter", confidence: 0.95 },

  // ─── Indian UPI / Payments / Wallets ────────────────────────
  "paytm.com": { category: "Transactions", confidence: 0.97 },
  "phonepe.com": { category: "Transactions", confidence: 0.97 },
  "gpay.app": { category: "Transactions", confidence: 0.97 },
  "razorpay.com": { category: "Transactions", confidence: 0.97 },
  "mobikwik.com": { category: "Transactions", confidence: 0.97 },
  "freecharge.in": { category: "Transactions", confidence: 0.97 },
  "amazonpay.in": { category: "Transactions", confidence: 0.97 },

  // ─── Credit Cards / BNPL ────────────────────────────────────
  "cred.club": { category: "Finance", confidence: 0.97 },
  "hdfccrediila.com": { category: "Finance", confidence: 0.97 },
  "sbicard.com": { category: "Finance", confidence: 0.97 },
  "icicicredit.com": { category: "Finance", confidence: 0.97 },
  "axiscard.in": { category: "Finance", confidence: 0.97 },
  "slice.is": { category: "Finance", confidence: 0.97 },
  "uni.club": { category: "Finance", confidence: 0.97 },
  "lazypaycredit.com": { category: "Finance", confidence: 0.97 },
  "simpl.credit": { category: "Finance", confidence: 0.97 },
  "welcome.americanexpress.com": { category: "Finance", confidence: 0.97 },
  "email.americanexpress.com": { category: "Finance", confidence: 0.97 },

  // ─── Indian Job Portals ──────────────────────────────────────
  'naukri.com':          { category: 'Jobs & Careers', confidence: 0.95 },
'naukrimail.com':      { category: 'Jobs & Careers', confidence: 0.95 },
'indeed.com':          { category: 'Jobs & Careers', confidence: 0.95 },
'match.indeed.com':    { category: 'Jobs & Careers', confidence: 0.95 },
'shine.com':           { category: 'Jobs & Careers', confidence: 0.95 },
'monster.com':         { category: 'Jobs & Careers', confidence: 0.95 },
'monsterindia.com':    { category: 'Jobs & Careers', confidence: 0.95 },
'internshala.com':     { category: 'Jobs & Careers', confidence: 0.95 },
'hirist.com':          { category: 'Jobs & Careers', confidence: 0.95 },
'cutshort.io':         { category: 'Jobs & Careers', confidence: 0.95 },
'instahyre.com':       { category: 'Jobs & Careers', confidence: 0.95 },
'foundit.in':          { category: 'Jobs & Careers', confidence: 0.95 },
'careercamp.codingninjas.com': { category: 'Jobs & Careers', confidence: 0.93 },
'linkedin.com':        { category: 'Jobs & Careers', confidence: 0.95 },
// LinkedIn is more job-related than social for most Indian users

  // ─── Indian E-commerce ──────────────────────────────────────
  "flipkart.com": { category: "Receipts", confidence: 0.95 },
  "amazon.in": { category: "Receipts", confidence: 0.95 },
  "amazon.com": { category: "Receipts", confidence: 0.9 },
  "myntra.com": { category: "Promotions", confidence: 0.95 },
  "ajio.com": { category: "Promotions", confidence: 0.95 },
  "meesho.com": { category: "Promotions", confidence: 0.95 },
  "nykaa.com": { category: "Promotions", confidence: 0.95 },
  "tatacliq.com": { category: "Receipts", confidence: 0.93 },
  "snapdeal.com": { category: "Promotions", confidence: 0.93 },
  "bigbasket.com": { category: "Receipts", confidence: 0.95 },
  "blinkit.com": { category: "Receipts", confidence: 0.95 },
  "zepto.in": { category: "Receipts", confidence: 0.95 },
  "jiomart.com": { category: "Receipts", confidence: 0.95 },

  // ─── Food Delivery ──────────────────────────────────────────
  "swiggy.in": { category: "Receipts", confidence: 0.97 },
  "zomato.com": { category: "Receipts", confidence: 0.97 },

  // ─── Travel ─────────────────────────────────────────────────
  "makemytrip.com": { category: "Travel", confidence: 0.97 },
  "goibibo.com": { category: "Travel", confidence: 0.97 },
  "irctc.co.in": { category: "Travel", confidence: 0.98 },
  "indigo.in": { category: "Travel", confidence: 0.97 },
  "airindia.in": { category: "Travel", confidence: 0.97 },
  "spicejet.com": { category: "Travel", confidence: 0.97 },
  "airasia.com": { category: "Travel", confidence: 0.97 },
  "akasaair.com": { category: "Travel", confidence: 0.97 },
  "vistara.com": { category: "Travel", confidence: 0.97 },
  "cleartrip.com": { category: "Travel", confidence: 0.97 },
  "yatra.com": { category: "Travel", confidence: 0.97 },
  "ixigo.com": { category: "Travel", confidence: 0.97 },
  "oyo.com": { category: "Travel", confidence: 0.95 },
  "oyorooms.com": { category: "Travel", confidence: 0.95 },
  "redbus.in": { category: "Travel", confidence: 0.97 },
  "abhibus.com": { category: "Travel", confidence: 0.95 },
  "booking.com": { category: "Travel", confidence: 0.95 },
  "airbnb.com": { category: "Travel", confidence: 0.95 },
  "goindigo.in": { category: "Travel", confidence: 0.97 },
  "promo.airindiaexpress.com": { category: "Travel", confidence: 0.95 },
  "travel.redbus.my": { category: "Travel", confidence: 0.97 },
  "tajhotels.com": { category: "Travel", confidence: 0.95 },

  // ─── Utilities / Bills ──────────────────────────────────────
  "jio.com": { category: "Notifications", confidence: 0.93 },
  "airtel.in": { category: "Notifications", confidence: 0.93 },
  "airtelindia.com": { category: "Notifications", confidence: 0.93 },
  "vodafone.in": { category: "Notifications", confidence: 0.93 },
  "bsnl.co.in": { category: "Notifications", confidence: 0.93 },
  "bescom.co.in": { category: "Notifications", confidence: 0.93 },
  "tatapower.com": { category: "Notifications", confidence: 0.93 },
  "adanielectricity.com": { category: "Notifications", confidence: 0.93 },
  "airtel.com": { category: "Notifications", confidence: 0.93 },
  "mailer.airtel.com": { category: "Notifications", confidence: 0.93 },

  // ─── Insurance ──────────────────────────────────────────────
  "hdfclife.com": { category: "Finance", confidence: 0.97 },
  "iciciprulife.com": { category: "Finance", confidence: 0.97 },
  "licindia.in": { category: "Finance", confidence: 0.97 },
  "starhealth.in": { category: "Finance", confidence: 0.97 },
  "policybazaar.com": { category: "Finance", confidence: 0.95 },
  "acko.com": { category: "Finance", confidence: 0.95 },
  "online.hdfclife.com": { category: "Finance", confidence: 0.97 },
  "reminders.hdfclife.com": { category: "Finance", confidence: 0.97 },

  // ─── Ed-tech ────────────────────────────────────────────────
  "byjus.com": { category: "Promotions", confidence: 0.93 },
  "unacademy.com": { category: "Promotions", confidence: 0.93 },
  "coursera.org": { category: "Newsletter", confidence: 0.93 },
  "udemy.com": { category: "Promotions", confidence: 0.93 },
  "simplilearn.com": { category: "Promotions", confidence: 0.93 },
  "upgrad.com": { category: "Promotions", confidence: 0.93 },
  "scaler.com": { category: "Promotions", confidence: 0.93 },

  // ─── Global Newsletters / Marketing ESPs ────────────────────
  "substack.com": { category: "Newsletter", confidence: 0.98 },
  "mailchimp.com": { category: "Newsletter", confidence: 0.98 },
  "sendgrid.net": { category: "Promotions", confidence: 0.9 },
  "klaviyo.com": { category: "Promotions", confidence: 0.97 },
  "mailgun.org": { category: "Notifications", confidence: 0.85 },
  "constantcontact.com": { category: "Newsletter", confidence: 0.97 },
  "campaign-archive.com": { category: "Newsletter", confidence: 0.97 },
  "amazonses.com": { category: "Notifications", confidence: 0.85 },

  // ─── Social ─────────────────────────────────────────────────
  "twitter.com": { category: "Social", confidence: 0.98 },
  "x.com": { category: "Social", confidence: 0.98 },
  "facebook.com": { category: "Social", confidence: 0.98 },
  "instagram.com": { category: "Social", confidence: 0.98 },
  "youtube.com": { category: "Social", confidence: 0.95 },
  "quora.com": { category: "Social", confidence: 0.95 },
  "reddit.com": { category: "Social", confidence: 0.95 },
  "discord.com": { category: "Social", confidence: 0.95 },
  "medium.com": { category: "Newsletter", confidence: 0.93 },

  // ─── Amazon (sends from many domains) ───────────────────────
  "amazon.in": { category: "Receipts", confidence: 0.93 },
  "amazon.com": { category: "Receipts", confidence: 0.9 },
  "uber.com": { category: "Receipts", confidence: 0.95 },

  "associates.amazon.in": { category: "Promotions", confidence: 0.93 },
  "kdp.amazon.com": { category: "Finance", confidence: 0.93 },
  "gc.email.amazon.in": { category: "Receipts", confidence: 0.97 },
  "payments.amazon.in": { category: "Transactions", confidence: 0.97 },
  "amazonpay.in": { category: "Transactions", confidence: 0.97 },

  // ─── Fitness ─────────────────────────────────────────────────
  "cult.fit": { category: "Notifications", confidence: 0.9 },
  "strava.com": { category: "Notifications", confidence: 0.9 },
  "e.blog.myfitnesspal.com": { category: "Newsletter", confidence: 0.9 },

  // ─── Tech / Developer ────────────────────────────────────────
  "github.com": { category: "Notifications", confidence: 0.95 },
  "mongodb.com": { category: "Notifications", confidence: 0.9 },
  "onedrive.com": { category: "Notifications", confidence: 0.9 },

  // ─── Ed-tech ─────────────────────────────────────────────────
  "careercamp.codingninjas.com": { category: "Promotions", confidence: 0.93 },
  "udacity.com": { category: "Promotions", confidence: 0.9 },

  // ─── Gifting / Vouchers ──────────────────────────────────────
  "updates.igp.com": { category: "Promotions", confidence: 0.93 },
  "alerts.shopwise.giftstacc.com": {
    category: "Notifications",
    confidence: 0.9,
  },
  "shopwise.giftstacc.com": { category: "Notifications", confidence: 0.9 },

  // ─── News / Media ────────────────────────────────────────────
  "yourstory.com": { category: "Newsletter", confidence: 0.93 },

  // ─── Misc ────────────────────────────────────────────────────
  "smt.plusoasis.com": { category: "Promotions", confidence: 0.85 },
  "novarace.in": { category: "Notifications", confidence: 0.85 },
  "em.kdp.com": { category: "Finance", confidence: 0.93 },
  "match.indeed.com": { category: "Jobs & Careers", confidence: 0.95 },
};

// ─── Helper functions ──────────────────────────────────────────

function extractDomain(fromHeader) {
  if (!fromHeader) return null;
  const match = fromHeader.match(/@([^>>\s]+)/);
  return match ? match[1].toLowerCase() : null;
}

function isOTPEmail(subject) {
  if (!subject) return false;
  const patterns = [
    /\botp\b/i,
    /one.time.password/i,
    /verification code/i,
    /your code is/i,
    /\d{4,8} is your/i,
    /use this code/i,
    /login code/i,
    /security code/i,
    /\d{6} is the otp/i,
    /otp for/i,
    /enter this code/i,
  ];
  return patterns.some((p) => p.test(subject));
}

function isTransactionEmail(subject) {
  if (!subject) return false;
  const patterns = [
    /debited/i,
    /credited/i,
    /transaction/i,
    /payment (confirmed|received|failed|successful)/i,
    /amount of (rs\.?|inr|₹)/i,
    /\bUPI\b/,
    /NEFT|RTGS|IMPS/i,
    /a\/c.*debited/i,
    /a\/c.*credited/i,
    /sent ₹/i,
    /received ₹/i,
    /paid ₹/i,
    /your (emi|bill|due) (of|for)/i,
    /minimum.*due/i,
    /payment due/i,
    /bill generated/i,
    /statement (is )?ready/i,
    /your.*statement/i,
    /was paid on amazon/i,
    /added to your amazon pay/i,
    /cashback of ₹/i,
    /reward points/i,
    /auto debit is active/i,
    /funds.*securities balance/i,
    /account summary as on/i,
  ];
  return patterns.some((p) => p.test(subject));
}

function isReceiptEmail(subject) {
  if (!subject) return false;
  const patterns = [
    /your order/i,
    /order confirmed/i,
    /order #/i,
    /order id/i,
    /invoice/i,
    /receipt for/i,
    /your receipt/i,
    /booking confirmed/i,
    /reservation confirmed/i,
    /shipment/i,
    /dispatched/i,
    /out for delivery/i,
    /delivered/i,
    /^shipped:/i,
    /^ordered:/i,
    /^out for delivery:/i,
    /^delivered:/i,
    /your.*order for \d+ item/i,
    /your return of/i,
    /gift voucher/i,
  ];
  return patterns.some((p) => p.test(subject));
}

function isTravelEmail(subject) {
  if (!subject) return false;
  const patterns = [
    /flight/i,
    /boarding pass/i,
    /itinerary/i,
    /hotel booking/i,
    /train ticket/i,
    /\bpnr\b/i,
    /check.in/i,
    /e-ticket/i,
    /bus ticket/i,
    /cab booking/i,
  ];
  return patterns.some((p) => p.test(subject));
}

function isJobEmail(subject) {
  if (!subject) return false
  const patterns = [
    /job alert/i,
    /new jobs/i,
    /jobs matching/i,
    /\d+ new jobs/i,
    /jobs? for you/i,
    /recommended jobs/i,
    /job opening/i,
    /career opportunity/i,
  ]
  return patterns.some(p => p.test(subject))
}


function isFinanceEmail(subject) {
  if (!subject) return false;
  const patterns = [
    /account (update|summary|statement)/i,
    /auto debit/i,
    /base total expense ratio/i,
    /funds.*securities/i,
    /policy no\./i,
    /mutual fund/i,
    /portfolio/i,
    /investment/i,
    /your.*statement/i,
    /closing bell/i,
    /market (update|wrap|recap)/i,
    /m-?cap/i,
  ];
  return patterns.some((p) => p.test(subject));
}

function isWorkEmail(subject) {
  if (!subject) return false
  const patterns = [
    /urgent requirement/i,
    /requirement for the role/i,
    /hiring for/i,
    /we.re hiring/i,
    /open position/i,
    /your (cv|resume|profile)/i,
    /interview (scheduled|invite|call)/i,
  ]
  return patterns.some(p => p.test(subject))
}

// ─── Main classification function ─────────────────────────────

export function classifyByRules(email) {
  const { from, subject, headers, hasAttachment } = email;
  const domain = extractDomain(from);

  // Priority 0: Finance domain + attachment = definitely important
  // e.g. bank statement PDF, insurance policy document, tax form
  const FINANCE_DOMAINS = [
    "hdfcbank.com",
    "hdfcbank.bank.in",
    "icicibank.com",
    "custcomm.icicibank.com",
    "axisbank.com",
    "sbi.co.in",
    "communications.sbi.co.in",
    "kotak.com",
    "hdfclife.com",
    "online.hdfclife.com",
    "reminders.hdfclife.com",
    "licindia.in",
    "miraeassetmf.co.in",
    "cred.club",
    "sbicard.com",
    "welcome.americanexpress.com",
    "email.americanexpress.com",
    "em.kdp.com",
  ];

  if (hasAttachment && domain && FINANCE_DOMAINS.includes(domain)) {
    return {
      category: "Finance",
      confidence: 0.97,
      reason: "Finance sender with attachment — likely statement or document",
    };
  }

  // Priority 0.5: Any domain + attachment with finance subject
  if (hasAttachment && isFinanceEmail(subject)) {
    return {
      category: "Finance",
      confidence: 0.93,
      reason: "Finance subject with attachment",
    };
  }

  // Priority 1: OTP — check first, highest priority
  if (isOTPEmail(subject)) {
    return {
      category: "OTP & Security",
      confidence: 0.97,
      reason: "OTP pattern in subject",
    };
  }

  // Priority 2: Transaction patterns
  if (isTransactionEmail(subject)) {
    return {
      category: "Transactions",
      confidence: 0.93,
      reason: "Transaction pattern in subject",
    };
  }

  // Priority 3: Known sender domain
  if (domain && KNOWN_DOMAINS[domain]) {
    return {
      ...KNOWN_DOMAINS[domain],
      reason: `Known domain: ${domain}`,
    };
  }

  // Priority 4: Bulk email headers
  if (headers?.["list-unsubscribe"]) {
    if (headers?.["precedence"] === "bulk") {
      return {
        category: "Newsletter",
        confidence: 0.9,
        reason: "List-Unsubscribe + Precedence: bulk",
      };
    }
    return {
      category: "Promotions",
      confidence: 0.82,
      reason: "List-Unsubscribe header present",
    };
  }

  // Priority 5: Receipt patterns
  if (isReceiptEmail(subject)) {
    return {
      category: "Receipts",
      confidence: 0.88,
      reason: "Receipt pattern in subject",
    };
  }

  // Priority 5.5: Finance patterns
  if (isFinanceEmail(subject)) {
    return {
      category: "Finance",
      confidence: 0.88,
      reason: "Finance pattern in subject",
    };
  }

  // Priority 6: Travel patterns
  if (isTravelEmail(subject)) {
    return {
      category: "Travel",
      confidence: 0.88,
      reason: "Travel pattern in subject",
    };
  }

  // Priority 7: Job portal patterns (naukri, indeed style alerts)
  if (isJobEmail(subject)) {
  return { category: 'Jobs & Careers', confidence: 0.85, reason: 'Job alert pattern in subject' }
}

  // Priority 8: Recruiter / work opportunity patterns
  if (isWorkEmail(subject)) {
  return { category: 'Jobs & Careers', confidence: 0.87, reason: 'Recruiter pattern in subject' }
}

  // Priority 9: Precedence header alone
  if (headers?.["precedence"] === "bulk") {
    return {
      category: "Promotions",
      confidence: 0.85,
      reason: "Precedence: bulk header",
    };
  }

  return null;
}
