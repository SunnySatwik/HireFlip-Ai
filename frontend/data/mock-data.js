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
  { label: "Average Bias Reduction", value: 42, suffix: "%" },
  { label: "Active Users", value: 2400, suffix: "+" },
  { label: "Audits Completed", value: 48000, suffix: "+" },
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
    title: "Head of Talent",
    quote: "HireFlip helped us uncover hidden hiring bias in minutes. The insights were eye-opening.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    name: "Michael Rao",
    company: "ScaleOps",
    title: "VP of People",
    quote: "The fairness dashboard impressed our leadership team. We've reduced bias by 40% in 3 months.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    name: "Alicia Gomez",
    company: "NovaHR",
    title: "Recruiting Director",
    quote: "Exactly what modern recruiting needed. Our hiring is now fairer and faster.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    name: "James Wilson",
    company: "CloudCore",
    title: "Chief People Officer",
    quote: "HireFlip gave us the transparency we needed in our hiring decisions. Highly recommend.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
];

export const pricingTiers = [
  {
    name: "Starter",
    price: "0",
    description: "For teams getting started with fairness audits",
    cta: "Start Free",
    recommended: false,
    features: ["3 audits/month", "Basic reports", "CSV upload", "Email support"],
  },
  {
    name: "Growth",
    price: "49",
    description: "For growing companies scaling their hiring",
    cta: "Start Free Trial",
    recommended: true,
    features: ["Unlimited audits", "Advanced analytics", "Priority support", "API access", "Custom reports"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom needs",
    cta: "Contact Sales",
    recommended: false,
    features: ["SSO & SAML", "Compliance suite", "Dedicated manager", "SLA guarantee", "Custom integrations"],
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