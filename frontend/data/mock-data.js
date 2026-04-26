export const metrics = {
  fairnessScore: 82,
  fairnessScorePrev: 76,
  demographicParity: 0.08,
  demographicParityStatus: "Improving",
  equalizedOdds: 0.05,
  equalizedOddsStatus: "Good",
  biasRiskLevel: "Low",
};

export const stats = [
  { label: "Biased AI Tools", value: 67, suffix: "%" },
  { label: "Talent Market Impacted", value: 500, suffix: "B+" },
  { label: "Combined Audit + Fix Tools", value: 0, suffix: "" },
];

export const howItWorks = [
  { title: "Upload Hiring Data", description: "Upload CSV or candidate dataset.", icon: "Database" },
  { title: "Detect Hidden Bias", description: "Analyze demographic disparities.", icon: "Brain" },
  { title: "Explain Decisions", description: "Show why candidates were scored.", icon: "BarChart3" },
  { title: "Generate Fair Shortlist", description: "Create bias-adjusted ranking.", icon: "CheckCircle" },
];

export const features = [
  { title: "Resume Anonymizer", description: "Hide names, gender, colleges.", icon: "Users" },
  { title: "Bias Detector", description: "Measure fairness metrics.", icon: "Brain" },
  { title: "Analytics Dashboard", description: "Visual charts and reports.", icon: "BarChart3" },
  { title: "Compliance Logs", description: "Track historical audits.", icon: "Shield" },
  { title: "Fast Decisions", description: "Run audits instantly.", icon: "Zap" },
  { title: "Secure Data", description: "Enterprise-grade privacy.", icon: "Lock" },
];

export const testimonials = [
  {
    name: "Sarah Chen",
    company: "TalentForge",
    quote: "HireFlip helped us uncover hidden hiring bias in minutes.",
    rating: 5,
  },
  {
    name: "Michael Rao",
    company: "ScaleOps",
    quote: "The fairness dashboard impressed our leadership team.",
    rating: 5,
  },
  {
    name: "Alicia Gomez",
    company: "NovaHR",
    quote: "Exactly what modern recruiting needed.",
    rating: 5,
  },
];

export const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    features: ["3 audits/month", "Basic reports", "CSV upload"],
  },
  {
    name: "Growth",
    price: "$49",
    features: ["Unlimited audits", "Advanced analytics", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["SSO", "Compliance suite", "Dedicated manager"],
  },
];

export const acceptanceRates = [
  { group: "Male", rate: 72 },
  { group: "Female", rate: 69 },
];

export const departmentBias = [
  { department: "Engineering", male: 74, female: 70 },
  { department: "Sales", male: 68, female: 67 },
  { department: "HR", male: 71, female: 73 },
  { department: "Operations", male: 69, female: 66 },
];

export const candidates = [
  { id: "C001", name: "Candidate 1", score: 91, confidence: 95, status: "Selected", reason: "Strong experience" },
  { id: "C002", name: "Candidate 2", score: 84, confidence: 89, status: "Selected", reason: "Good technical fit" },
  { id: "C003", name: "Candidate 3", score: 77, confidence: 81, status: "Review", reason: "Needs review" },
  { id: "C004", name: "Candidate 4", score: 63, confidence: 74, status: "Rejected", reason: "Experience gap" },
];

export const shortlist = {
  original: ["C001", "C002", "C003"],
  adjusted: ["C001", "C003", "C004"],
};

export const auditHistory = [
  { id: "A101", date: "2026-04-26", score: 82 },
  { id: "A100", date: "2026-04-25", score: 79 },
];

export const anonymizationData = [
  { month: "Week 1", withNames: 42, anonymized: 61 },
  { month: "Week 2", withNames: 45, anonymized: 69 },
  { month: "Week 3", withNames: 38, anonymized: 76 },
  { month: "Week 4", withNames: 47, anonymized: 81 },
];

export const genderAcceptanceByDept = [
  { department: "Engineering", male: 74, female: 70 },
  { department: "Sales", male: 68, female: 67 },
  { department: "HR", male: 71, female: 73 },
  { department: "Operations", male: 69, female: 66 },
];

export const departmentBiasMap = [
  { department: "Engineering", bias: 12 },
  { department: "Sales", bias: 4 },
  { department: "HR", bias: -2 },
  { department: "Operations", bias: 7 },
];

export const currentUser = {
  name: "Sunny Satwik",
  email: "sunny@hireflip.ai",
  role: "Admin",
  avatar: "/avatar.png"
};

export const organizations = [
  {
    id: 1,
    name: "HireFlip Inc"
  },
  {
    id: 2,
    name: "TalentForge"
  },
  {
    id: 3,
    name: "NovaHR"
  }
];