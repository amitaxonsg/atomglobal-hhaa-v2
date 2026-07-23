export const stageContent = {
  version: { image: "/media/stages/reflection-portrait.png", mobileImage: "", alt: "A thoughtful professional pausing beside a window", focalPoint: "52% 50%", overlay: 40, headline: "Pause.\nReflect.\nChoose wisely.", supporting: "Align with what you feel and what you reason with.", active: true, order: 1 },
  participant: { image: "/media/stages/reflection-portrait.png", mobileImage: "", alt: "A reflective moment before beginning", focalPoint: "52% 50%", overlay: 40, headline: "Begin with\nwhere you are.", supporting: "Your context makes the reflection more useful.", active: true, order: 2 },
  personal: { image: "/media/stages/reflection-portrait.png", mobileImage: "", alt: "A quiet moment of personal reflection", focalPoint: "52% 50%", overlay: 40, headline: "Notice the\npattern.", supporting: "There are no right answers—only honest ones.", active: true, order: 3 },
  newjoiner: { image: "/media/stages/reflection-portrait.png", mobileImage: "", alt: "A professional considering a new beginning", focalPoint: "52% 50%", overlay: 40, headline: "Find your\nfooting.", supporting: "See how you balance belonging, judgement and instinct.", active: true, order: 4 },
  manager: { image: "/media/stages/reflection-portrait.png", mobileImage: "", alt: "A manager reflecting on how they lead", focalPoint: "52% 50%", overlay: 40, headline: "Lead with\nclarity.", supporting: "Understand what your team experiences from you.", active: true, order: 5 },
  executive: { image: "/media/stages/reflection-portrait.png", mobileImage: "", alt: "An executive considering a complex decision", focalPoint: "52% 50%", overlay: 40, headline: "Hold the\nwhole picture.", supporting: "Balance evidence, instinct and human consequence.", active: true, order: 6 },
  report: { image: "/media/stages/reflection-portrait.png", mobileImage: "/media/stages/reflection-mobile.webp", alt: "A participant reviewing a personal report", focalPoint: "52% 50%", overlay: 40, headline: "Turn insight\ninto action.", supporting: "Your result is a starting point, not a label.", active: true, order: 7 },
};

export const dashboardData = {
  metrics: [
    ["Surveys started", "38", "+12.4%"], ["Completed", "29", "76.3%"], ["Paid reports", "11", "37.9%"], ["Revenue", "$684", "+8.1%"],
  ],
  participants: [
    { name: "Maya Rodriguez", email: "maya.r@example.com", track: "Executive", progress: 100, payment: "Paid", affiliate: "NORTHSTAR", activity: "18 min ago" },
    { name: "Elliot Tan", email: "elliot.t@example.com", track: "Manager", progress: 70, payment: "Free", affiliate: "—", activity: "1 hr ago" },
    { name: "Priya Nair", email: "priya.n@example.com", track: "New Joiner", progress: 24, payment: "—", affiliate: "CAREERLAB", activity: "3 hrs ago" },
    { name: "Jonas Berg", email: "jonas.b@example.com", track: "Personal", progress: 100, payment: "Free", affiliate: "—", activity: "Yesterday" },
  ],
  activity: ["Paid report unlocked for Maya Rodriguez", "Executive assessment v1.0 published", "Reminder email delivered to Elliot Tan", "Affiliate CAREERLAB attributed a new session"],
};

export const emailTemplates = ["Participant registration", "Survey resume link", "Abandoned reminder 1", "Abandoned reminder 2", "Final reminder", "Assessment completed", "Free report ready", "Payment successful", "Paid report ready", "Password reset"];
