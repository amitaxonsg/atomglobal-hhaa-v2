var navy = "#14141C",
  canvas = "#F7F4EF",
  white = "#FFFFFF",
  borderColor = "#E4DDCF",
  heartRed = "#C1443F",
  heartRedDark = "#A8443D",
  headBlue = "#6C8FAE",
  headBlueDark = "#3D6079",
  gold = "#C9A15A",
  bodyText = "#211C16",
  mutedText = "#726A5B",
  contactEmail = "sunil.setpaul@gmail.com",
  companyName = "Atom Global Consulting",
  companyUrl = "https://www.atomglobal.com",
  ageRanges = ["Under 18", "18\u201324", "25\u201334", "35\u201344", "45\u201354", "55\u201364", "65+"],
  genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"],
  workRoleOptions = ["Individual Contributor", "People Manager", "Senior Executive / Leadership", "Business Owner / Founder", "Student", "Between roles / Not currently employed", "Other"],
  industryOptions = ["Technology", "Healthcare", "Finance & Banking", "Education", "Retail & E-commerce", "Manufacturing", "Government & Public Sector", "Nonprofit", "Consulting", "Media & Entertainment", "Other"],
  countryOptions = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)", "Congo (DRC)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other / Prefer not to say"],
  workPurposeOptions = ["Personal growth / curiosity", "Recommended by my organization", "Coaching or therapy support", "Team or leadership development", "Academic or research purposes", "Other"],
  tenureOptions = ["Less than 6 months", "6 months \u2013 1 year", "1\u20132 years", "3\u20135 years", "6\u201310 years", "10+ years"],
  roleOptions = ["Individual Contributor", "People Manager", "Senior Executive / Leadership"],
  departmentOptions = ["Executive / C-Suite", "Sales", "Marketing", "Operations", "Finance", "HR / People", "Engineering / IT", "Product", "Customer Success / Support", "Legal", "R&D", "Administration", "Other"],
  levelOptions = ["Entry-Level / Individual Contributor", "Senior Individual Contributor", "Team Lead / Supervisor", "Manager", "Senior Manager / Director", "VP / Executive", "C-Suite / Founder"],
  personalSituationOptions = ["Student", "Working full-time", "Working part-time", "Self-employed / Freelance", "Between jobs / Not currently working", "Retired", "Homemaker / Caregiver", "Other"],
  personalFocusOptions = ["Career & Work", "Relationships & Family", "Personal Growth & Wellbeing", "Health", "Finances", "Education", "Other"],
  personalPurposeOptions = ["Self-understanding", "Relationship insight", "Curiosity", "Coaching or therapy support", "Recommended by someone I trust", "Other"],
  lifeChapterOptions = ["Just starting out", "Building & establishing myself", "In a period of change or transition", "Feeling stable and steady", "Reflecting & reassessing", "Winding down / simplifying"],
  intakeConfigurations = {
    personal: {
      whoLabel: "Which best describes your current situation? *",
      whoOptions: personalSituationOptions,
      whatLabel: "What area of life are you most focused on right now? *",
      whatOptions: personalFocusOptions,
      whereLabel: "Where are you based? *",
      whereOptions: countryOptions,
      whyLabel: "What brings you to this assessment? *",
      whyOptions: personalPurposeOptions,
      howLabel: "How would you describe this current chapter of your life? *",
      howOptions: lifeChapterOptions,
      hasCompanyFields: false
    },
    work: {
      whoLabel: "Which best describes you? *",
      whoOptions: workRoleOptions,
      whatLabel: "What industry do you work in? *",
      whatOptions: industryOptions,
      whereLabel: "Where are you based? *",
      whereOptions: countryOptions,
      whyLabel: "What brings you to this assessment? *",
      whyOptions: workPurposeOptions,
      howLabel: "How long have you been in your current role? *",
      howOptions: tenureOptions,
      hasCompanyFields: true
    }
  };
function getIntakeConfiguration(e) {
  return e === "personal" ? intakeConfigurations.personal : intakeConfigurations.work;
}
var personalSubscales = [{
    code: "DM",
    name: "Decision-Making",
    blurb: "How you actually choose, when it counts.",
    items: [{
      d: "H",
      t: "When making important decisions, I trust my gut feeling even when I can't fully explain it."
    }, {
      d: "K",
      t: "I prefer to map out pros, cons, and data before deciding anything significant."
    }, {
      d: "H",
      t: "Some of my best decisions have come from what simply \u201Cfelt right,\u201D not from careful analysis."
    }, {
      d: "K",
      t: "I feel uneasy committing to a choice until I've thought it through logically."
    }, {
      d: "K",
      t: "I trust a well-reasoned plan more than a hunch, even when the hunch has been right before."
    }]
  }, {
    code: "RC",
    name: "Relationships & Connection",
    blurb: "What you actually filter people through.",
    items: [{
      d: "H",
      t: "I choose who to keep close in my life based on how they make me feel, not just what they offer."
    }, {
      d: "K",
      t: "I evaluate relationships mainly by whether they are useful or productive for my goals."
    }, {
      d: "H",
      t: "I stay emotionally open with people even when there's a risk of getting hurt."
    }, {
      d: "K",
      t: "I keep an emotional distance in most relationships to avoid being vulnerable."
    }, {
      d: "H",
      t: "I can tell when someone truly cares about me, even without them saying it."
    }]
  }, {
    code: "EA",
    name: "Emotional Awareness",
    blurb: "Whether you feel your feelings, or mostly think about them.",
    items: [{
      d: "H",
      t: "I notice and name my emotions as they arise, rather than pushing them aside."
    }, {
      d: "K",
      t: "I tend to intellectualize my feelings instead of actually experiencing them."
    }, {
      d: "H",
      t: "I let myself feel sadness, joy, or anger fully rather than immediately trying to \u201Cfix\u201D or explain it."
    }, {
      d: "K",
      t: "I often distract myself with tasks or thinking so I don't have to sit with uncomfortable emotions."
    }, {
      d: "K",
      t: "I often analyze my emotions logically rather than just experiencing them in my body."
    }]
  }, {
    code: "CN",
    name: "Conflict Navigation",
    blurb: "What wins in a disagreement \u2014 connection or being right.",
    items: [{
      d: "H",
      t: "During conflict, I try to understand how the other person feels before I try to be \u201Cright.\u201D"
    }, {
      d: "K",
      t: "In an argument, I focus on facts and being logically correct over the other person's feelings."
    }, {
      d: "H",
      t: "I'm willing to say \u201CI was wrong\u201D if it repairs the relationship, even if I could argue my case."
    }, {
      d: "K",
      t: "I find it hard to let go of proving my point, even when it damages the relationship."
    }, {
      d: "H",
      t: "I can stay emotionally connected to someone even in the middle of a disagreement."
    }]
  }, {
    code: "TI",
    name: "Trust & Intuition",
    blurb: "How much weight your gut gets versus proof.",
    items: [{
      d: "H",
      t: "I trust my intuition about people and situations, even when I can't back it up with evidence."
    }, {
      d: "K",
      t: "I only trust things I can prove, measure, or verify."
    }, {
      d: "H",
      t: "I've ignored my gut instinct in the past and regretted it."
    }, {
      d: "K",
      t: "I dismiss \u201Cgut feelings\u201D as unreliable compared to solid reasoning."
    }, {
      d: "K",
      t: "I trust hard evidence over hunches, even when the hunch turned out to be right before."
    }]
  }, {
    code: "EC",
    name: "Empathy & Compassion",
    blurb: "Whether others' feelings land in your body, or stay in your head.",
    items: [{
      d: "H",
      t: "I feel other people's pain or joy almost as if it were my own."
    }, {
      d: "K",
      t: "I understand other people's situations intellectually, but rarely feel moved by them."
    }, {
      d: "H",
      t: "I go out of my way to comfort someone who is hurting, even at a cost to myself."
    }, {
      d: "K",
      t: "I keep my compassion in check so it doesn't interfere with clear thinking."
    }, {
      d: "H",
      t: "Acts of kindness or connection move me emotionally, sometimes to tears."
    }]
  }, {
    code: "AE",
    name: "Authentic Self-Expression",
    blurb: "Whether what you show the world matches what you feel.",
    items: [{
      d: "H",
      t: "I speak and act in ways that are true to how I genuinely feel, even if it's not the \u201Csmart\u201D choice."
    }, {
      d: "K",
      t: "I often say what's expected or strategic rather than what I actually feel."
    }, {
      d: "H",
      t: "I'd rather be authentic and imperfect than polished and guarded."
    }, {
      d: "K",
      t: "I carefully manage what I reveal about myself to control how others see me."
    }, {
      d: "K",
      t: "I keep my emotional expression measured and controlled around others."
    }]
  }, {
    code: "SP",
    name: "Stress & Pressure Response",
    blurb: "What you reach for under pressure.",
    items: [{
      d: "H",
      t: "Under stress, I check in with how I feel and let that guide my next step."
    }, {
      d: "K",
      t: "Under stress, I shut down my emotions and focus purely on solving the problem."
    }, {
      d: "H",
      t: "When overwhelmed, I reach out for emotional connection and support."
    }, {
      d: "K",
      t: "When overwhelmed, I withdraw and try to think my way out alone."
    }, {
      d: "H",
      t: "I recover faster from stress when I let myself feel and express it rather than suppress it."
    }]
  }, {
    code: "VP",
    name: "Values & Life Priorities",
    blurb: "What you're actually optimizing for.",
    items: [{
      d: "H",
      t: "Love, connection, and meaning matter more to me than achievement or status."
    }, {
      d: "K",
      t: "Success, results, and being right matter more to me than how something feels."
    }, {
      d: "H",
      t: "I'd choose a lower-paying path that feels meaningful over a lucrative one that feels empty."
    }, {
      d: "K",
      t: "I measure a good life mostly by accomplishments and objective milestones."
    }, {
      d: "K",
      t: "I judge whether a decision was \u201Cgood\u201D mainly by its measurable outcome, not how it felt."
    }]
  }, {
    code: "CS",
    name: "Communication Style",
    blurb: "How you actually talk to people.",
    items: [{
      d: "H",
      t: "I communicate with warmth and emotional honesty, even about difficult topics."
    }, {
      d: "K",
      t: "I communicate primarily with logic and facts, keeping emotion out of it."
    }, {
      d: "H",
      t: "I tell people how I feel about them directly, rather than assuming they know."
    }, {
      d: "K",
      t: "I find it easier to talk about ideas and plans than about feelings."
    }, {
      d: "H",
      t: "People describe my communication style as heartfelt and genuine."
    }]
  }],
  answerChoices = ["Strongly Disagree", "Disagree", "Neutral / Sometimes", "Agree", "Strongly Agree"],
  personalProfiles = [{
    key: "heart-centered",
    range: [200, 250],
    name: "Heart-Centered \u2014 Authentic Living",
    color: heartRed,
    teaser: "You lead with feeling and intuition, and it shows up as real, magnetic authenticity.",
    summary: "You operate primarily from the heart. You trust feeling and intuition first, and use logic to refine rather than override them. This tends to show up as strong authenticity and relational depth \u2014 genuine, present, and easy to connect with.",
    strengths: ["Deep, trusting relationships built on emotional honesty", "Strong intuition that often proves reliable under pressure", "Comfort with vulnerability and repair in conflict", "A stable sense of self, independent of outside approval"],
    watchouts: ["Decisions can be made too quickly, without enough grounding in facts or consequences", "Boundaries can blur \u2014 you may over-give emotionally", "High-stakes, data-heavy decisions may need more deliberate analysis"],
    developmentAreas: "Your growth edge isn't feeling more \u2014 it's building enough structure around your feeling so it doesn't work against you. That means learning to slow a decision down when the stakes are high, protecting your energy so generosity doesn't tip into depletion, and getting comfortable holding two things at once: real compassion for someone, and a clear boundary with them.",
    relationships: "You bond quickly and deeply, and people generally feel your care without having to ask for it. The risk isn't a lack of connection \u2014 it's discernment: you can extend trust before it's been earned, and stay past the point where the evidence says you should leave.",
    work: "You thrive in roles built around people, culture, service, or creative judgment. Pure logistics, compliance, or numbers-heavy work will feel like a foreign language you're capable of speaking but don't enjoy speaking.",
    workingStyleTips: ["Before agreeing to a new commitment, pause for 24 hours rather than answering in the moment.", "Build one recurring checkpoint into big projects where you deliberately look only at the numbers, timeline, or risk.", "Delegate or systematize the purely administrative parts of your work."],
    handlingDifficulty: "When things get hard, you feel it fully and fast, and you tend to reach outward \u2014 toward people, conversation, connection \u2014 to process it. That keeps you from bottling things up, which is real strength. The risk is processing out loud before you've had a moment to sit with what's actually true, so your first reaction isn't always your most accurate one.",
    roadmap: [{
      area: "Boundary Setting Under Emotional Pressure",
      insight: "Your generosity is real, but it doesn't come with a built-in stop switch \u2014 you tend to keep giving past the point where it costs you, especially with people you love.",
      steps: ["Before saying yes to a request that involves your time or energy, name what saying yes will actually cost you.", "Practice one low-stakes \u201Cno\u201D per week to build the muscle before a high-stakes moment needs it.", "Notice the bodily sensation that shows up right before you over-commit \u2014 that's your cue to pause."]
    }, {
      area: "Slowing Down High-Stakes Decisions",
      insight: "Your intuition is genuinely strong, but on decisions with real financial, legal, or long-term consequences, speed can work against you.",
      steps: ["For any decision over a self-set threshold, build in a mandatory 48-hour pause before committing.", "Write the decision out in plain language \u2014 what you're choosing and why \u2014 before acting on it.", "Ask one person you trust to play devil's advocate on your biggest calls, on purpose."]
    }, {
      area: "Distinguishing Intuition from Old Patterns",
      insight: "Your growth edge isn't feeling less \u2014 it's telling the difference between a fresh read on a situation and a familiar emotional reflex wearing intuition's clothes.",
      steps: ["When a feeling arises, ask: have I felt exactly this before, with a similar person or situation? If yes, slow down.", "Keep a short running list of decisions where your gut was right, and where it was actually an old fear.", "Bring recurring emotional patterns to a therapist or mentor rather than re-deciding them alone each time."]
    }, {
      area: "Building Structure Without Losing Warmth",
      insight: "You can add analytical rigor to your decision-making without becoming someone else \u2014 structure isn't the opposite of heart, it's a container for it.",
      steps: ["Pick one recurring area of life (finances, work commitments) and build a simple, repeatable checklist.", "Delegate or automate the purely administrative tasks that drain you without engaging your strengths.", "Revisit this roadmap in 3 months and note which habits actually stuck."]
    }],
    growth: ["Before a big financial, legal, or contractual decision, write out the facts and risks in plain language.", "Practice saying no to requests that feel emotionally compelling but don't actually serve you.", "Notice the difference between \u201Cthis feels right\u201D and \u201Cthis feels familiar.\u201D", "Keep a one-line daily note of a moment you led with logic instead of feeling.", "Practice \u201Clet me think about this\u201D as a full, complete response."]
  }, {
    key: "heart-leaning",
    range: [150, 199],
    name: "Heart-Leaning \u2014 Integrated, Feeling-First",
    color: heartRedDark,
    teaser: "You use both head and heart \u2014 but when they disagree, your heart casts the deciding vote.",
    summary: "You use both head and heart, but when they conflict, your heart usually gets the final vote. You're capable of analysis and planning, but meaning, connection, and how something feels tend to carry more weight than pure logic.",
    strengths: ["Balanced decision-making that rarely ignores data or feeling", "Genuine relationships, with enough self-protection to avoid being taken advantage of", "Good instincts, checked \u2014 not overridden \u2014 by reason"],
    watchouts: ["Under stress, the balance can tip further toward the heart than the situation calls for", "May avoid necessary hard-nosed analysis because it feels uncomfortable", "Worth noticing when a feeling is old pattern or fear, not present-moment truth"],
    developmentAreas: "You're already integrating both sides more than most \u2014 the refinement now is consistency. The tip toward feeling gets stronger exactly when you're tired, rushed, or emotionally invested, which is precisely when a second opinion from the analytical side matters most. Building a reliable habit for those specific moments, rather than relying on however you happen to feel that day, is the real work.",
    relationships: "Your relationships are warm and reciprocal, and you're usually able to sense early when something is off \u2014 even if you don't always act on it right away. People experience you as genuine but not naive.",
    work: "You're comfortable with both feedback loops and gut calls, which makes you effective in ambiguous, people-facing roles. Your risk is deferring to feeling in the specific situations that genuinely call for more rigor \u2014 contracts, hiring, numbers.",
    workingStyleTips: ["Name in advance the 2-3 categories of decision where you'll always force a written pros/cons pass.", "When you notice you're avoiding analysis because it feels cold, treat that as a signal to lean in.", "Ask a trusted, more analytical colleague to sanity-check your biggest calls."],
    handlingDifficulty: "You meet difficulty by feeling it honestly first, then figuring out what to do \u2014 which generally serves you well. Where it can go sideways is under real pressure, when an old emotional pattern quietly takes the wheel disguised as intuition.",
    roadmap: [{
      area: "Consistency Under Pressure",
      insight: "You already integrate head and heart well in calm conditions \u2014 the gap shows up specifically when you're tired, rushed, or emotionally invested.",
      steps: ["Pre-decide your 2-3 \u201Calways analyze first\u201D categories (money, hiring, contracts) before you're in the heat of a decision.", "Build a simple pros/cons template you reach for automatically under stress.", "Set a rule: any decision made while emotionally activated gets revisited 24 hours later."]
    }, {
      area: "Recognizing Old Patterns Disguised as Instinct",
      insight: "Under real pressure, familiar emotional reflexes (fear of conflict, need to be liked) can borrow your intuition's voice.",
      steps: ["Ask, in hard moments: is this what the situation calls for, or a familiar reflex?", "Track decisions weekly where you later realized fear was driving, not insight.", "Loop in a second opinion specifically on relationship or conflict decisions."]
    }, {
      area: "Doing the Analysis You'd Rather Skip",
      insight: "You can avoid necessary hard-nosed analysis because it feels emotionally cold, not because it's actually unnecessary.",
      steps: ["Notice when \u201CI'll just trust my gut\u201D shows up for a decision that actually has real stakes.", "Ask a more analytical colleague or friend to sanity-check big calls before, not after.", "Give yourself permission to be temporarily \u201Cunfeeling\u201D in service of a better outcome."]
    }, {
      area: "Calibrating Your Own Track Record",
      insight: "You don't yet have a clear, evidence-based sense of when your heart is right and when your head is \u2014 most people never build this.",
      steps: ["Keep a short decision log: what you chose, which side led, how it turned out.", "Review it monthly, not just after big wins or failures.", "Use the pattern you find to adjust how much weight you give each side going forward."]
    }],
    growth: ["When the stakes are high and unfamiliar, slow down and build a simple pros/cons list.", "Ask yourself whether reluctance to analyze is a values statement, or just discomfort.", "Keep a short log of decisions where the head was right and the heart was wrong.", "Once a month, revisit a stressful decision and ask what a calmer you would've done.", "Practice stating your logical reasoning out loud to someone else."]
  }, {
    key: "head-leaning",
    range: [100, 149],
    name: "Head-Leaning \u2014 Integrated, Thinking-First",
    color: headBlueDark,
    teaser: "You use both head and heart \u2014 but logic usually wins the tie-break.",
    summary: "You use both head and heart, but logic usually wins the tie-break. You value being right, being prepared, and being able to justify your choices. Feelings are noticed, but filtered through analysis before you act on them.",
    strengths: ["Clear-headed, well-reasoned decisions, especially under pressure", "Reliability \u2014 people trust your judgment because it's consistent", "Not easily swept away by a passing emotion"],
    watchouts: ["Relationships can read as guarded, or like you're managing them rather than being in them", "Intuition may get overridden even when correct, because it isn't \u201Cprovable\u201D", "Unexpressed feelings tend to surface later as stress or distance"],
    developmentAreas: "The work for you isn't becoming less rigorous \u2014 it's letting feeling in as a legitimate input rather than noise to be managed around. That starts small: noticing a feeling without immediately explaining it away, and treating a gut instinct as a real data point worth weighing, even when it can't yet be justified on paper.",
    relationships: "People generally experience you as competent and trustworthy, but may have to work harder to feel truly close to you, since connection gets filtered through analysis first. You show love through reliability more than through words.",
    work: "You're well-suited to complex, high-stakes decisions where being right matters more than being warm. The same wiring can make you slow to sit with a win, a loss, or any strong emotion \u2014 including other people's.",
    workingStyleTips: ["In meetings, ask \u201Chow does this land for people\u201D as a standing question, not an afterthought.", "When you dismiss an instinct because you can't prove it, write it down anyway and check back later.", "Build in real recovery time after high-output periods."],
    handlingDifficulty: "Under difficulty, you default to solving \u2014 you get quiet, analytical, and focused on the fix, which genuinely works for a lot of problems. What it doesn't do is process the emotional residue of the difficulty itself, which tends to sit unresolved and surface later.",
    roadmap: [{
      area: "Letting Feeling Count as Data",
      insight: "You treat emotion as noise to manage around rather than a legitimate input \u2014 even when it's accurate.",
      steps: ["When you dismiss an instinct because you can't prove it, write it down anyway and check back later.", "Before finalizing a decision, explicitly ask \u201Chow does this feel,\u201D not just \u201Cdoes this hold up.\u201D", "Practice treating a strong gut reaction as a hypothesis worth testing, not noise to filter out."]
    }, {
      area: "Making Relationships Feel as Close as They Are",
      insight: "People trust your judgment but may not feel close to you, because warmth doesn't reliably make it to the surface.",
      steps: ["Add one sentence of feeling or impact to feedback you give, not just facts and outcomes.", "Say the appreciative thing out loud instead of assuming it's understood.", "Ask someone close what they wish you expressed more, and act on the answer."]
    }, {
      area: "Processing Instead of Postponing Emotion",
      insight: "Under difficulty, you solve and move on \u2014 the emotional residue doesn't disappear, it resurfaces later as tension or distance.",
      steps: ["Name one emotion out loud, even briefly, before moving to solutions.", "After a stressful project, ask how it felt, not just whether it succeeded.", "Build in real recovery time after high-output periods, not just after visible burnout."]
    }, {
      area: "Recovering the Muscle of Feeling",
      insight: "Emotional awareness is a muscle like any other \u2014 under-used, it genuinely atrophies, and that's reversible with practice.",
      steps: ["Once a week, make one small decision purely on feeling and notice what happens.", "Sit with an unresolved feeling for five minutes without trying to fix or explain it.", "Reflect someone's feeling back to them before offering a solution, at least once a day."]
    }],
    growth: ["Once a week, make one small decision purely on how it feels.", "When someone shares a problem, try reflecting their feeling back before offering a solution.", "Name one emotion out loud each day, even a mundane one.", "After finishing a stressful project, ask yourself how it felt, not just whether it succeeded.", "Practice sitting with an unresolved feeling for five minutes without trying to fix it."]
  }, {
    key: "head-dominant",
    range: [50, 99],
    name: "Head-Dominant \u2014 Detached / Analytical",
    color: headBlue,
    teaser: "Logic, control, and analysis are your default setting \u2014 composed on the outside, sometimes distant on the inside.",
    summary: "You operate primarily from the head. Logic, control, and analysis are your default mode, and emotional input \u2014 yours and others' \u2014 is often minimized or arrives late. This can look like competence from the outside, while feeling like distance from the inside.",
    strengths: ["Composure and clarity in high-pressure or high-stakes situations", "Objectivity \u2014 less prone to being derailed by emotional reactivity", "Strong follow-through once a decision is made"],
    watchouts: ["Relationships may feel one-sided or shallow to others, even with good intent", "Suppressed emotion tends to leak out as tension, health symptoms, or sudden overreaction", "Intuition is real data \u2014 dismissing it entirely removes useful information"],
    developmentAreas: "The growth path here is reconnecting with feeling as information, not weakness. That's not about becoming a different kind of person \u2014 it's about noticing that a physical stress signal, or a nagging sense that something's off, is data your analytical mind hasn't caught up to yet, and it deserves a seat at the table rather than automatic dismissal.",
    relationships: "Others may read you as composed but hard to reach. The depth of your care is often real but doesn't reliably make it to the surface where people can feel it, which can leave them guessing where they stand with you.",
    work: "You're a strong asset under pressure, in ambiguity, or in any high-stakes analytical role. Unprocessed emotion in this profile tends not to disappear \u2014 it tends to resurface later as tension, health symptoms, or an unexpected blow-up.",
    workingStyleTips: ["Schedule genuine unstructured time with colleagues or team members.", "When giving feedback, add one sentence about impact or feeling, not just facts and outcomes.", "Before a high-stakes call, check in on your physical state as a real input."],
    handlingDifficulty: "You handle difficulty by controlling what you can and analyzing your way through the rest, which makes you genuinely steady in a crisis. The cost shows up afterward: emotion that never got processed doesn't disappear, it resurfaces later as tension or a health symptom that seems to come from nowhere.",
    roadmap: [{
      area: "Treating Physical Signals as Information",
      insight: "A tight chest or a nagging sense something's off is data your analytical mind hasn't caught up to yet \u2014 not a distraction from the \u201Creal\u201D analysis.",
      steps: ["Before a high-stakes call, check in on your physical state as a real input.", "When you notice a stress signal, pause and name what you're feeling before doing anything else.", "Keep a simple log of physical signals and what they later turned out to mean."]
    }, {
      area: "Making Care Visible, Not Just Real",
      insight: "Your care is often genuine but doesn't reliably reach the people it's for, which leaves them guessing where they stand.",
      steps: ["Schedule genuine unstructured time with people you trust, with no agenda.", "Say the caring thing out loud instead of assuming actions speak for themselves.", "Ask directly what someone wishes you expressed more often \u2014 then do it."]
    }, {
      area: "Preventing the Delayed Cost of Suppressed Emotion",
      insight: "Emotion that never gets processed doesn't vanish \u2014 it resurfaces later as tension, irritability, or a health symptom that seems to come from nowhere.",
      steps: ["Build a small, regular check-in practice: how am I actually doing, not just what have I accomplished.", "Name one feeling in one word each day, without analyzing why.", "Notice patterns: does tension spike after specific kinds of unprocessed situations?"]
    }, {
      area: "Giving Intuition a Real Vote",
      insight: "Dismissing gut reactions entirely removes a genuine source of information your analytical process doesn't have access to.",
      steps: ["Before dismissing a gut reaction, ask what evidence would need to exist for you to take it seriously.", "Write down instincts you overrode and revisit whether they turned out to be right.", "Treat a strong, repeated gut signal as equivalent in weight to a moderate amount of data."]
    }],
    growth: ["Build in unstructured time with people you trust, with no agenda or problem to solve.", "When you notice a physical stress signal, pause and name what you're feeling.", "Ask someone close what they wish you expressed more often, and take it seriously.", "Once a day, name one feeling in one word, without analyzing why you feel it.", "Before dismissing a gut reaction, ask what you'd need to see to take it seriously."]
  }],
  personalSubscaleReads = {
    DM: {
      whyItMatters: "How you make decisions determines everything downstream \u2014 your career trajectory, your relationships, your finances. Getting this dial right for the decision in front of you, rather than defaulting to one mode automatically, is one of the highest-leverage skills there is.",
      high: {
        read: "Decisions come from a felt sense of rightness first, with logic used to sanity-check rather than lead. This serves you well in ambiguous or fast-moving situations.",
        tip: "Keep leaning on intuition for people-reading and fast calls, but add a deliberate pause for financial, legal, or irreversible decisions."
      },
      mid: {
        read: "You draw on both gut feeling and analysis fairly evenly, adjusting based on the situation.",
        tip: "Notice which mode you default to under time pressure \u2014 that's usually your true default, worth being aware of."
      },
      low: {
        read: "You won't move until the numbers or the reasoning check out \u2014 even on choices that are really about how something feels.",
        tip: "For your next personal decision, try deciding on gut feel first, then check it against logic second \u2014 reverse your usual order."
      }
    },
    RC: {
      whyItMatters: "Relationship quality is one of the strongest predictors of long-term happiness and even physical health. How you filter and choose people shapes who ends up in your life.",
      high: {
        read: "You bond with people based on emotional resonance, and you let that closeness show.",
        tip: "Keep trusting your read on people, but build in one evidence check for new relationships before extending full trust."
      },
      mid: {
        read: "You balance emotional connection with practical judgment when choosing who to let close.",
        tip: "Notice if you evaluate new vs. established relationships differently \u2014 consistency here compounds."
      },
      low: {
        read: "You keep relationships at arm's length and tend to evaluate them by what they do for you.",
        tip: "Pick one relationship this month and share something real and non-strategic \u2014 practice connection without an agenda."
      }
    },
    EA: {
      whyItMatters: "You can't manage what you can't feel. Emotional awareness is the foundation every other emotional skill \u2014 empathy, regulation, communication \u2014 is built on.",
      high: {
        read: "You feel your emotions in real time and let them inform you before you explain them away.",
        tip: "Keep the practice, and start naming emotions with more precision \u2014 the specific word deepens the skill."
      },
      mid: {
        read: "You notice emotions some of the time, though they can slip past you when you're busy or stressed.",
        tip: "Set a daily two-minute check-in: name what you're feeling, no analysis required."
      },
      low: {
        read: "You tend to think about feelings rather than actually feel them, which can leave you reading your own signals late.",
        tip: "Pause at transition points in your day \u2014 before a meeting, after a call \u2014 and ask what you're actually feeling right now."
      }
    },
    CN: {
      whyItMatters: "Every close relationship will have conflict. How you navigate it \u2014 repair vs. rupture \u2014 determines whether relationships get stronger over time or slowly erode.",
      high: {
        read: "Staying close to someone matters more to you, in the moment, than winning the argument.",
        tip: "Keep prioritizing repair, but make sure you're not avoiding necessary confrontations just to keep the peace."
      },
      mid: {
        read: "You can hold your ground and repair a relationship, depending on the stakes of the disagreement.",
        tip: "Notice your pattern with specific people \u2014 do you always yield to some and never to others?"
      },
      low: {
        read: "Being right tends to outweigh staying connected, especially once a disagreement escalates.",
        tip: "In your next disagreement, ask the other person what they need to feel heard before making your own case."
      }
    },
    TI: {
      whyItMatters: "Intuition is pattern recognition your conscious mind hasn't caught up to yet. Dismissing it entirely, or trusting it blindly, both cost you good information.",
      high: {
        read: "Your gut gets a real vote, without needing proof \u2014 and you've learned, mostly, to trust it.",
        tip: "Keep honoring your gut, and start keeping a light log of when it's right vs. wrong to sharpen your calibration."
      },
      mid: {
        read: "You weigh intuition alongside evidence, giving neither automatic priority.",
        tip: "Notice the situations where you override your gut \u2014 is there a pattern to when you don't trust it?"
      },
      low: {
        read: "If it can't be measured or demonstrated, you discount it, even in the moments it turns out to be right.",
        tip: "Next time a hunch shows up, write it down before you dismiss it, then check back later to see if it was right."
      }
    },
    EC: {
      whyItMatters: "Empathy is the mechanism through which other people feel understood by you \u2014 it's the difference between being around someone and actually connecting with them.",
      high: {
        read: "Other people's emotions genuinely move you, not just register with you intellectually.",
        tip: "Keep letting yourself feel with others, and build in recovery time so it doesn't tip into emotional exhaustion."
      },
      mid: {
        read: "You can access empathy, though it takes more conscious effort in some situations than others.",
        tip: "Notice who you find it easiest to empathize with, and practice extending that same effort to people less like you."
      },
      low: {
        read: "You understand what others feel more than you feel it alongside them.",
        tip: "Next time someone shares a problem, resist offering a solution for the first minute \u2014 just reflect what they're feeling back."
      }
    },
    AE: {
      whyItMatters: "The gap between how you feel and how you present costs energy every day, and it's the thing other people unconsciously sense as \u201Csomething's off.\u201D",
      high: {
        read: "What you show the world lines up with what you actually feel, even when that's inconvenient.",
        tip: "Keep being real, and notice if there are specific contexts \u2014 work, family \u2014 where you still perform rather than express."
      },
      mid: {
        read: "You're authentic in some contexts and more guarded in others.",
        tip: "Pick your most guarded context and experiment with one small, honest disclosure."
      },
      low: {
        read: "You manage your image carefully, and what people see isn't always what's underneath.",
        tip: "Practice one small act of visible authenticity a week \u2014 a genuine reaction, not a curated one."
      }
    },
    SP: {
      whyItMatters: "Your stress response isn't a character flaw or a virtue \u2014 it's a pattern, and patterns can be worked with once you actually see them clearly.",
      high: {
        read: "Under pressure, you turn toward feeling and connection rather than away from them.",
        tip: "Keep reaching out under stress, and add one grounding practice \u2014 breath, movement \u2014 so you're not relying on others alone to regulate."
      },
      mid: {
        read: "Your stress response shifts depending on the type and intensity of the pressure.",
        tip: "Notice what kind of stress makes you shut down vs. reach out \u2014 that's useful self-knowledge."
      },
      low: {
        read: "Under pressure, you shut emotion down and retreat into your head to solve your way out alone.",
        tip: "Next time you're stressed, text one person just to say you're having a hard time \u2014 no solving required."
      }
    },
    VP: {
      whyItMatters: "What you're actually optimizing for, not what you say you value, quietly steers every major life decision you make.",
      high: {
        read: "Meaning and connection outrank achievement in what you're actually optimizing your life for.",
        tip: "Keep protecting what matters, and sanity-check occasionally that this is a choice, not a way to avoid ambition."
      },
      mid: {
        read: "You hold both meaning and achievement as real priorities, weighing them situationally.",
        tip: "Notice which one wins when you're tired or under pressure \u2014 that's usually the truer default."
      },
      low: {
        read: "Results and measurable success matter more to you than how a choice feels while you're making it.",
        tip: "Before your next big decision, ask what you'd choose if no one would ever know the outcome."
      }
    },
    CS: {
      whyItMatters: "How you communicate determines whether people actually receive what you mean \u2014 the gap between intent and impact lives almost entirely here.",
      high: {
        read: "You talk from the heart, plainly, even about hard things.",
        tip: "Keep the directness, and check occasionally that warmth isn't tipping into oversharing in professional contexts."
      },
      mid: {
        read: "You adjust your communication style depending on the person and the stakes.",
        tip: "Notice which relationships get your warmer register and which get your more guarded one \u2014 is that intentional?"
      },
      low: {
        read: "You default to facts and ideas in conversation, and feelings rarely make it in.",
        tip: "In your next important conversation, add one sentence of feeling before you get to the facts."
      }
    }
  },
  managerSubscales = [{
    code: "DM",
    name: "Decision-Making",
    blurb: "How you make calls that affect your team.",
    items: [{
      d: "H",
      t: "When making an important call about my team, I trust my gut feeling even when I can't fully explain it."
    }, {
      d: "K",
      t: "I prefer to map out data and options before deciding anything that affects my team."
    }, {
      d: "H",
      t: "Some of my best management decisions have come from what simply felt right, not from careful analysis."
    }, {
      d: "K",
      t: "I feel uneasy committing to a team decision until I've thought it through logically."
    }, {
      d: "K",
      t: "I trust a well-reasoned plan more than a hunch, even when the hunch about a person or situation has been right before."
    }]
  }, {
    code: "RC",
    name: "Team Relationships & Trust",
    blurb: "How you build and extend trust with your team.",
    items: [{
      d: "H",
      t: "I choose who to give more autonomy to based on how they make me feel about their reliability, not just their track record on paper."
    }, {
      d: "K",
      t: "I evaluate team members mainly by their measurable output and results."
    }, {
      d: "H",
      t: "I stay emotionally open with my direct reports even when there's a risk of being let down."
    }, {
      d: "K",
      t: "I keep an emotional distance from my team to stay objective."
    }, {
      d: "H",
      t: "I can tell when someone on my team is struggling, even before they say anything."
    }]
  }, {
    code: "EA",
    name: "Emotional Awareness at Work",
    blurb: "Whether you notice your own reactions, or move past them.",
    items: [{
      d: "H",
      t: "I notice and name my own frustration or stress in the moment, rather than pushing it aside during a busy day."
    }, {
      d: "K",
      t: "I tend to intellectualize my reactions to workplace setbacks instead of actually feeling them."
    }, {
      d: "H",
      t: "I let myself feel disappointment about a project outcome fully rather than immediately moving to \u201Cwhat's next.\u201D"
    }, {
      d: "K",
      t: "I often distract myself with tasks so I don't have to sit with how a difficult meeting made me feel."
    }, {
      d: "K",
      t: "I analyze my own frustration logically rather than just noticing it in the moment."
    }]
  }, {
    code: "CN",
    name: "Conflict & Difficult Conversations",
    blurb: "What wins when it's hard \u2014 the relationship or being right.",
    items: [{
      d: "H",
      t: "During a disagreement with a peer or direct report, I try to understand how they feel before I try to be right."
    }, {
      d: "K",
      t: "In a workplace disagreement, I focus on facts and being correct over the other person's feelings."
    }, {
      d: "H",
      t: "I'm willing to say \u201CI was wrong\u201D in front of my team if it repairs trust, even if I could defend my original call."
    }, {
      d: "K",
      t: "I find it hard to let go of proving my point in a meeting, even when it costs team morale."
    }, {
      d: "H",
      t: "I can stay warm toward a direct report even in the middle of a hard performance conversation."
    }]
  }, {
    code: "TI",
    name: "Trust & Intuition About People",
    blurb: "How much weight your read on someone gets versus proof.",
    items: [{
      d: "H",
      t: "I trust my read on a candidate or team member, even when I can't fully justify it on paper."
    }, {
      d: "K",
      t: "I only trust what's in the data \u2014 performance reviews, metrics \u2014 not my gut read on someone."
    }, {
      d: "H",
      t: "I've ignored my gut instinct about a hire or a risk and regretted it."
    }, {
      d: "K",
      t: "I dismiss my gut feeling about a team situation as unreliable compared to hard evidence."
    }, {
      d: "K",
      t: "I trust a spreadsheet over a hunch, even when the hunch about a person turned out to be right before."
    }]
  }, {
    code: "EC",
    name: "Empathy for Your Team",
    blurb: "Whether your team's struggles land with you, or stay at arm's length.",
    items: [{
      d: "H",
      t: "A direct report's stress or frustration genuinely affects me, not just registers as a fact to manage."
    }, {
      d: "K",
      t: "I understand my team's struggles intellectually but rarely feel moved by them."
    }, {
      d: "H",
      t: "I go out of my way to support a struggling team member, even at a cost to my own workload."
    }, {
      d: "K",
      t: "I keep my empathy for my team in check so it doesn't interfere with clear decision-making."
    }, {
      d: "H",
      t: "Seeing my team succeed or struggle genuinely moves me emotionally."
    }]
  }, {
    code: "AE",
    name: "Authentic Leadership",
    blurb: "Whether the leader your team sees matches how you actually feel.",
    items: [{
      d: "H",
      t: "I lead in a way that's true to how I genuinely feel, even when it's not the \u201Csafe\u201D corporate answer."
    }, {
      d: "K",
      t: "I often say what's expected of a manager rather than what I actually think."
    }, {
      d: "H",
      t: "I'd rather be a genuine, occasionally imperfect leader than a polished, guarded one."
    }, {
      d: "K",
      t: "I carefully manage what I reveal to my team to control how I'm perceived as a leader."
    }, {
      d: "K",
      t: "I keep my emotional expression measured and controlled around my team."
    }]
  }, {
    code: "SP",
    name: "Stress & Pressure at Work",
    blurb: "What you reach for under deadline pressure.",
    items: [{
      d: "H",
      t: "Under deadline pressure, I check in with how I feel and let that guide my next step."
    }, {
      d: "K",
      t: "Under deadline pressure, I shut down my emotions and focus purely on solving the problem."
    }, {
      d: "H",
      t: "When overwhelmed at work, I reach out to a peer or mentor for support."
    }, {
      d: "K",
      t: "When overwhelmed at work, I withdraw and try to think my way out alone."
    }, {
      d: "H",
      t: "I recover faster from a stressful week when I let myself feel and express it rather than suppress it."
    }]
  }, {
    code: "VP",
    name: "What You're Optimizing For",
    blurb: "What actually drives your calls when it's close.",
    items: [{
      d: "H",
      t: "Team wellbeing and meaning matter more to me than hitting every metric."
    }, {
      d: "K",
      t: "Results and being right matter more to me than how the team feels about how we got there."
    }, {
      d: "H",
      t: "I'd choose a harder, more meaningful project over an easy, high-visibility one."
    }, {
      d: "K",
      t: "I measure a good quarter mostly by the numbers, not the team's experience getting there."
    }, {
      d: "K",
      t: "I judge whether a management decision was \u201Cgood\u201D mainly by the outcome, not how it felt to make it."
    }]
  }, {
    code: "CS",
    name: "Communication as a Manager",
    blurb: "How you actually talk to your team.",
    items: [{
      d: "H",
      t: "I communicate with warmth and honesty with my team, even about difficult topics like underperformance."
    }, {
      d: "K",
      t: "I communicate primarily with facts and logic, keeping emotion out of feedback."
    }, {
      d: "H",
      t: "I tell my team how I feel about their work directly, rather than assuming they know."
    }, {
      d: "K",
      t: "I find it easier to talk about deliverables and plans than about how people are doing."
    }, {
      d: "H",
      t: "My team would describe my communication style as heartfelt and genuine."
    }]
  }],
  managerProfiles = [{
    key: "heart-centered",
    range: [200, 250],
    name: "Heart-Centered \u2014 Team-Centered Leadership",
    color: heartRed,
    teaser: "You lead with feeling and instinct, and your team feels genuinely led, not just managed.",
    summary: "You lead primarily from the heart. You trust your read on people and situations first, and use data and process to refine rather than override that read. This tends to show up as a leader people trust quickly and follow genuinely, not just because of your title.",
    strengths: ["Direct reports trust you and feel genuinely supported", "Strong read on team dynamics and morale, often ahead of the data", "Comfortable repairing trust after a misstep", "Leads with a stable sense of self, not just what the org wants to see"],
    watchouts: ["Difficult performance conversations can get delayed or softened past the point of usefulness", "Team boundaries can blur \u2014 you may absorb your team's stress as your own", "High-stakes resourcing or org decisions may need more deliberate analysis than feel alone provides"],
    developmentAreas: "Your growth edge as a manager isn't caring more \u2014 it's building enough structure around that care so it doesn't work against your team. That means delivering hard feedback on time even when it feels unkind in the moment, and protecting your own capacity so support doesn't tip into absorbing your team's problems as your own.",
    relationships: "Your team generally trusts you fast, and they feel your investment in them without having to ask for it. The risk is discernment: you can extend trust or slack to someone before it's earned, and hold onto an underperformer past the point the evidence says you should act.",
    work: "You thrive managing through relationship and culture \u2014 your team feels genuinely led, not just managed. Purely administrative or metrics-first management tasks will feel like a chore you're capable of but don't enjoy.",
    workingStyleTips: ["Before agreeing to protect an underperforming team member \u201Ca little longer,\u201D name out loud what that delay is actually costing the rest of the team.", "Build one recurring checkpoint into big team decisions where you deliberately look only at the numbers, timeline, or risk, separate from how it feels.", "Delegate or systematize the purely administrative parts of managing \u2014 they drain you disproportionately."],
    handlingDifficulty: "When your team hits a hard patch, you feel it fully and reach toward connection \u2014 checking in, gathering the team, talking it through. That keeps morale from cratering silently, which is real strength. The risk is reacting to the room's mood before you've had a moment to separate your own feeling from the situation's actual facts.",
    leadershipImpact: "Reporting to you likely feels safe and genuinely human \u2014 people say what they think because you make it feel low-risk to be honest. The flip side: your team may also sense when you're avoiding a hard call on someone's performance, and over time that can quietly erode trust in your fairness, even while your warmth stays intact.",
    cultureFitPrompt: "If your organization's culture rewards fast, metrics-first decisions over relationship-building, you may find yourself working against the grain daily \u2014 worth naming honestly: is this friction pushing you to grow, or slowly wearing you down?",
    roadmap: [{
      area: "Delivering Hard Feedback On Time",
      insight: "Your instinct to protect team members you care about can quietly become a habit of delaying feedback until it's overdue.",
      steps: ["Set a personal rule: performance concerns get raised within one week of noticing, not \u201Cwhen the time feels right.\u201D", "Before delaying a hard conversation, name out loud what the delay costs the rest of the team.", "Practice a scripted opener for hard feedback so the conversation starts even when it feels uncomfortable."]
    }, {
      area: "Adding Structure to High-Stakes Team Decisions",
      insight: "On resourcing, promotions, or org changes, speed on instinct can work against you and your team.",
      steps: ["For decisions above a certain impact threshold, build in a mandatory data review before deciding.", "Write the decision out in plain language \u2014 what you're choosing and why \u2014 before acting on it.", "Ask a trusted peer manager to sanity-check your biggest people calls."]
    }, {
      area: "Protecting Your Own Capacity",
      insight: "Absorbing your team's stress as your own is generous, but it isn't sustainable, and it isn't actually what your team needs from you.",
      steps: ["Notice the bodily signal that shows up when you're taking on a team member's stress as your own.", "Build one recurring boundary \u2014 a no-meeting block, a hard stop time \u2014 and hold it.", "Ask yourself whether staying late to support someone is necessary, or a habit."]
    }, {
      area: "Building Fair, Consistent Structure",
      insight: "Structure isn't the opposite of a people-first leadership style \u2014 it's what makes your care fair and repeatable across your whole team, not just your favorites.",
      steps: ["Pick one recurring management process (ratings, 1:1 cadence) and build a simple, consistent checklist.", "Delegate or systematize the administrative parts of managing that drain you.", "Revisit this roadmap in 3 months and note which habits actually stuck."]
    }],
    growth: ["Before your next hard conversation, set a date within one week rather than waiting for the 'right moment.'", "Practice saying 'let's look at the numbers on this one' as a complete, valid response.", "Notice the difference between a team member who needs support and one who needs a consequence.", "Keep a one-line weekly note of a moment you led with process instead of feeling.", "Block one hour a week that's just for your own recovery, not your team's."]
  }, {
    key: "heart-leaning",
    range: [150, 199],
    name: "Heart-Leaning \u2014 People-First, Integrated",
    color: heartRedDark,
    teaser: "You manage with both head and heart \u2014 but when they disagree, your read on people usually wins.",
    summary: "You lead with both head and heart, but when they conflict, your read on people usually wins. You're capable of rigorous analysis, but team morale and relational trust tend to carry more weight than pure metrics.",
    strengths: ["Balanced management decisions that rarely ignore data or team sentiment", "Genuine team relationships with enough boundary to avoid being taken advantage of", "Good people-instincts, checked not overridden by data"],
    watchouts: ["Under deadline stress, the balance can tip further toward people-pleasing than the situation calls for", "May avoid necessary hard metrics conversations because they feel uncomfortable", "Worth noticing when leniency with a team member is old pattern (conflict avoidance) rather than present-moment judgment"],
    developmentAreas: "You're already integrating both sides more than most managers \u2014 the refinement now is consistency, especially under deadline pressure when the pull toward keeping the peace gets strongest, which is exactly when a second, more analytical opinion matters most.",
    relationships: "Your team relationships are warm and reciprocal, and you usually sense early when someone's struggling \u2014 even if you don't always act on it immediately. Your team experiences you as genuine, not a pushover.",
    work: "You're comfortable with both structured feedback and gut calls on people, which makes you effective managing through ambiguity. Your risk is deferring to team sentiment in the specific calls that need more rigor \u2014 performance ratings, resourcing, promotions.",
    workingStyleTips: ["Name in advance the decisions (performance ratings, promotions, resourcing) where you'll always force a written, criteria-based pass before deciding.", "When you notice you're avoiding a hard metric because it feels uncomfortable, treat that discomfort as a signal to lean in.", "Ask a trusted, more data-driven peer manager to sanity-check your biggest calls about people."],
    handlingDifficulty: "You meet team difficulty by feeling it honestly first, then figuring out what to do \u2014 which generally builds trust. Where it goes sideways is under real pressure, when a fear of conflict quietly takes the wheel disguised as \u201Creading the room.\u201D",
    leadershipImpact: "Your team likely feels genuinely cared for and safe bringing you problems. The risk: high performers may quietly notice when you let an underperformer coast too long, and start to wonder if the bar actually matters.",
    cultureFitPrompt: "If your organization runs on hard metrics and fast performance cuts, your people-first instinct may create real friction \u2014 worth asking whether that tension is making you a better check on the culture, or just making your job harder.",
    roadmap: [{
      area: "Consistency Under Deadline Pressure",
      insight: "You integrate people and data well normally \u2014 the gap shows specifically when you're behind on a deadline and emotionally invested in your team.",
      steps: ["Pre-decide which decisions (ratings, promotions, PIPs) always get a written criteria pass, no exceptions.", "Build a simple checklist you reach for automatically under deadline stress.", "Any people decision made while stressed gets revisited 24 hours later before it's final."]
    }, {
      area: "Recognizing Conflict-Avoidance Disguised as Instinct",
      insight: "Under pressure, a fear of confrontation can borrow the voice of \u201Creading the team.\u201D",
      steps: ["Ask, in hard moments: is this what the team needs, or my own discomfort with conflict?", "Track weekly when you later realize avoidance was driving, not insight.", "Loop in a peer specifically on performance or conflict calls."]
    }, {
      area: "Doing the Hard Metric Review You'd Rather Skip",
      insight: "You can avoid a necessary hard conversation about someone's numbers because it feels unkind, not because it's unnecessary.",
      steps: ["Notice when 'they're going through a lot right now' becomes a permanent excuse.", "Ask a data-driven peer to sanity-check ratings before you finalize them.", "Give yourself permission to be temporarily 'unkind' in service of the team's fairness."]
    }, {
      area: "Calibrating Your Own Track Record on People Calls",
      insight: "You don't yet have an evidence-based sense of when your people-read is right and when it's wishful thinking.",
      steps: ["Keep a light log: who you gave the benefit of the doubt to, and how it played out.", "Review it quarterly, not just after a blow-up.", "Use the pattern to recalibrate how much benefit-of-the-doubt you extend by default."]
    }],
    growth: ["Before your next performance rating, write the criteria-based case first, then check it against how you feel about the person.", "Ask yourself whether avoiding a tough conversation is kindness, or your own discomfort.", "Keep a short log of people calls where the data was right and your gut was wrong, and vice versa.", "Once a month, revisit a people decision made under deadline stress and ask what a calmer you would've done.", "Practice stating the data-driven case out loud to a peer before you make your final call."]
  }, {
    key: "head-leaning",
    range: [100, 149],
    name: "Head-Leaning \u2014 Results-First, Integrated",
    color: headBlueDark,
    teaser: "You manage with both head and heart \u2014 but logic usually wins the tie-break.",
    summary: "You manage with both head and heart, but logic usually wins the tie-break. You value being right, being prepared, and defensible decisions. Team sentiment is noticed, but filtered through data before you act on it.",
    strengths: ["Clear-headed, well-reasoned management decisions, especially under pressure", "Reliability \u2014 your team trusts your judgment because it's consistent", "Not easily swayed by a vocal minority or a bad week"],
    watchouts: ["Team relationships can read as transactional, or like you're managing rather than leading", "A good instinct about a person may get overridden because it isn't provable in a review cycle", "Team frustration that goes unexpressed for too long tends to surface as attrition or disengagement"],
    developmentAreas: "The work for you isn't becoming less rigorous \u2014 it's letting team sentiment count as a real input, not noise to manage around. That starts small: noticing team mood without immediately looking for the metric that explains it away.",
    relationships: "Your team generally experiences you as competent and fair, but may work harder to feel close to you, since warmth gets filtered through your analytical process first. You show you care through consistency, not words.",
    work: "You're well-suited to managing through complexity and ambiguity, where being right matters more than being warm. The same wiring can make you slow to celebrate a team win or sit with a team's disappointment.",
    workingStyleTips: ["In 1:1s, ask \u201Chow are you actually doing\u201D as a standing question, not an afterthought.", "When you dismiss a read on a team member because you can't prove it yet, write it down and check back.", "Build in real recovery time for your team after high-output sprints, not just for yourself."],
    handlingDifficulty: "Under team difficulty, you default to solving \u2014 quiet, analytical, focused on the fix, which works for a lot of problems. What it doesn't do is process the team's emotional residue, which tends to surface later as quiet disengagement.",
    leadershipImpact: "Your team trusts your judgment and feels safe under your consistency, but may not feel truly seen by you. Over time, your best people may leave not because of bad management, but because they never felt like more than a strong performer to you.",
    cultureFitPrompt: "If your organization explicitly values a \u201Cpeople-first\u201D culture on paper, your results-first default may create a quiet mismatch worth naming \u2014 are you the counterbalance the culture needs, or out of step with it?",
    roadmap: [{
      area: "Letting Team Sentiment Count as Data",
      insight: "You treat team mood as noise to manage around rather than a legitimate input \u2014 even when it's accurate.",
      steps: ["When you dismiss a read on morale because you can't prove it, write it down anyway and check back later.", "Before finalizing a team decision, explicitly ask 'how does this land,' not just 'does this hold up.'", "Practice treating a strong read on team mood as a hypothesis worth testing."]
    }, {
      area: "Making Care Visible to Your Team",
      insight: "People trust your judgment but may not feel close to you, because warmth doesn't reliably make it to the surface.",
      steps: ["Add one sentence of impact or feeling to feedback you give, not just facts and outcomes.", "Say the appreciative thing out loud instead of assuming it's understood.", "Ask a direct report what they wish you expressed more, and act on the answer."]
    }, {
      area: "Processing Team Difficulty Instead of Just Solving It",
      insight: "Under difficulty, you solve and move on \u2014 the team's emotional residue doesn't disappear, it resurfaces later as disengagement.",
      steps: ["Name the team's likely feeling out loud, even briefly, before moving to solutions.", "After a stressful sprint, ask the team how it felt, not just whether it succeeded.", "Build in real recovery time after high-output periods, not just after visible burnout."]
    }, {
      area: "Recovering the Muscle of Noticing Morale",
      insight: "Noticing team sentiment is a skill like any other \u2014 under-used, it atrophies, and that's reversible with practice.",
      steps: ["Once a week, make one small team call purely on read, and notice what happens.", "Sit with an unresolved team tension for a few minutes without trying to fix it immediately.", "Reflect a team member's feeling back to them before offering a solution, at least once a day."]
    }],
    growth: ["Once a week, make one small team decision purely on how it feels, and notice what happens.", "When a direct report shares a problem, try reflecting their feeling back before offering a solution.", "Name your own reaction out loud in a team meeting at least once a week.", "After a stressful project, ask the team how it felt, not just whether it succeeded.", "Practice sitting with team tension for five minutes without rushing to fix it."]
  }, {
    key: "head-dominant",
    range: [50, 99],
    name: "Head-Dominant \u2014 Command-and-Control, Analytical",
    color: headBlue,
    teaser: "Logic, control, and process are your default setting as a manager \u2014 strong execution, sometimes distant.",
    summary: "You manage primarily from the head. Logic, control, and process are your default mode, and emotional input from your team is often minimized or arrives late. This can look like strong execution from the outside, while your team experiences distance.",
    strengths: ["Composure and clarity in high-pressure or crisis situations", "Objectivity \u2014 your team decisions are less prone to favoritism or reactivity", "Strong follow-through once a decision is made"],
    watchouts: ["Team relationships may feel one-sided or purely transactional, even with good intent", "Suppressed frustration with the team tends to leak out as tension or a sudden sharp reaction", "A read on a team risk is real data \u2014 dismissing it entirely removes useful information"],
    developmentAreas: "The growth path here is reconnecting with team sentiment as information, not weakness. A nagging sense that morale is off is data your analytical process hasn't caught up to yet, and it deserves a seat at the table.",
    relationships: "Your team may read you as composed but hard to reach. Your investment in their growth is often real but doesn't reliably surface where they can feel it, which can leave them guessing where they stand.",
    work: "You're a strong asset managing through crisis, ambiguity, or any high-stakes execution challenge. Team emotion that goes unprocessed under your management doesn't disappear \u2014 it resurfaces as attrition or a blow-up that seems to come from nowhere.",
    workingStyleTips: ["Schedule genuine unstructured time with your team \u2014 connection without an agenda builds trust pure competence doesn't.", "When giving feedback, add one sentence about impact or feeling, not just facts and outcomes.", "Before a high-stakes team call, check your own physical stress signals as a real input."],
    handlingDifficulty: "You handle team difficulty by controlling what you can and analyzing through the rest, which makes you genuinely steady in a crisis. The cost shows up in your team afterward \u2014 unprocessed tension resurfaces as disengagement or a sudden resignation that blindsides you.",
    leadershipImpact: "Your team likely respects your competence and composure under pressure, but may not experience you as approachable. The specific risk: problems get hidden from you longer than they should, because your team senses you'd rather have the fix than the feeling.",
    cultureFitPrompt: "If your organization is shifting toward a more people-centered leadership model, your command-and-control default may be increasingly out of step \u2014 worth an honest look at whether your style is evolving with the culture or holding steady against it.",
    roadmap: [{
      area: "Treating Team Morale Signals as Information",
      insight: "A nagging sense that something's off with your team is data your analytical mind hasn't caught up to yet \u2014 not a distraction from the \u201Creal\u201D work.",
      steps: ["Before a high-stakes team call, check in on your own physical state as a real input.", "When you notice a team stress signal, pause and name what might be going on before acting.", "Keep a simple log of morale signals and what they later turned out to mean."]
    }, {
      area: "Making Care Visible to Your Team",
      insight: "Your investment in your team is often genuine but doesn't reliably reach them, which leaves them guessing where they stand.",
      steps: ["Schedule genuine unstructured time with your team, with no agenda.", "Say the caring thing out loud instead of assuming actions speak for themselves.", "Ask directly what your team wishes you expressed more often \u2014 then do it."]
    }, {
      area: "Preventing the Delayed Cost of an Unprocessed Team",
      insight: "Team emotion that never gets processed doesn't vanish \u2014 it resurfaces as disengagement, attrition, or a blow-up that seems to come from nowhere.",
      steps: ["Build a small, regular check-in practice with your team beyond status updates.", "Ask one open, non-metric question in every 1:1: how are you actually doing?", "Notice patterns: does attrition or disengagement spike after specific kinds of unprocessed situations?"]
    }, {
      area: "Giving Your Read on People a Real Vote",
      insight: "Dismissing a gut read on a team risk entirely removes a genuine source of information your analytical process doesn't have access to.",
      steps: ["Before dismissing a read on someone, ask what evidence would need to exist for you to take it seriously.", "Write down instincts about people you overrode and revisit whether they turned out to be right.", "Treat a strong, repeated read on a team risk as equivalent in weight to a moderate amount of data."]
    }],
    growth: ["Build in unstructured time with your team, with no agenda or problem to solve.", "When you notice a physical stress signal, pause and name what you're feeling before doing anything else.", "Ask your team what they wish you expressed more often, and take it seriously.", "Once a day, name one feeling about work in one word, without analyzing why.", "Before dismissing a read on a team risk, ask what you'd need to see to take it seriously."]
  }],
  managerSubscaleReads = {
    DM: {
      whyItMatters: "How you make team-affecting decisions shapes your team's trust in your judgment and your own credibility as a leader over time.",
      high: {
        read: "Decisions about your team come from a felt sense of rightness first, with data used to sanity-check rather than lead.",
        tip: "Keep trusting your read on people and situations, but add a deliberate data check before resourcing or org-structure decisions."
      },
      mid: {
        read: "You draw on both gut feeling and data fairly evenly when deciding for your team.",
        tip: "Notice which mode you default to under deadline pressure \u2014 that's usually your true default."
      },
      low: {
        read: "You won't act on a team decision until the data checks out, even when it's really a people-read call.",
        tip: "For your next people-related call, decide on read first, then check it against the data second."
      }
    },
    RC: {
      whyItMatters: "Team trust is the currency that makes everything else \u2014 delegation, honest feedback, retention \u2014 possible.",
      high: {
        read: "You extend trust and autonomy based on how someone makes you feel about their reliability.",
        tip: "Keep trusting your read, but build one evidence check before extending major autonomy to a new team member."
      },
      mid: {
        read: "You balance gut trust with a track record when deciding how much autonomy to give.",
        tip: "Notice if you extend trust faster to people similar to you \u2014 worth checking for bias."
      },
      low: {
        read: "You evaluate your team mainly by measurable output, keeping emotional distance.",
        tip: "Pick one team member this month and have a real, non-agenda conversation \u2014 practice connection without evaluating."
      }
    },
    EA: {
      whyItMatters: "Your own emotional state leaks into every interaction with your team, whether you notice it or not.",
      high: {
        read: "You notice your own frustration or stress in the moment rather than pushing it aside during a busy day.",
        tip: "Keep naming it, and start sharing an appropriately calibrated version with your team \u2014 modeling awareness helps them too."
      },
      mid: {
        read: "You notice your reactions to workplace setbacks sometimes, though busy weeks can bury them.",
        tip: "Build a 2-minute end-of-day check-in: what did I actually feel today, no analysis required."
      },
      low: {
        read: "You intellectualize your reactions to workplace setbacks rather than actually feeling them.",
        tip: "Before your next 1:1, pause and name what you're actually feeling walking in."
      }
    },
    CN: {
      whyItMatters: "How you handle disagreement and hard conversations determines whether your team trusts you to be fair.",
      high: {
        read: "You prioritize understanding how someone feels before being right in a disagreement.",
        tip: "Keep prioritizing repair, but make sure necessary hard conversations aren't being delayed to preserve harmony."
      },
      mid: {
        read: "You can hold your ground or prioritize the relationship depending on the stakes.",
        tip: "Notice your pattern with specific team members \u2014 do you go easier on some than others?"
      },
      low: {
        read: "Being right tends to outweigh team morale once a disagreement escalates.",
        tip: "In your next hard conversation, ask what the other person needs to feel heard before making your case."
      }
    },
    TI: {
      whyItMatters: "Your gut read on people \u2014 candidates, risks, team dynamics \u2014 is pattern recognition built from experience.",
      high: {
        read: "You trust your read on a hire or a risk, even without full justification on paper.",
        tip: "Keep honoring your read, and log outcomes to sharpen your calibration over time."
      },
      mid: {
        read: "You weigh gut read alongside data, giving neither automatic priority.",
        tip: "Notice when you override your read \u2014 is there a pattern to when you don't trust it?"
      },
      low: {
        read: "You trust the spreadsheet over the hunch, even when the hunch about a person was right before.",
        tip: "Next time a read on someone shows up, write it down before dismissing it \u2014 check back later."
      }
    },
    EC: {
      whyItMatters: "Empathy is what makes people feel like more than a line on your org chart.",
      high: {
        read: "A direct report's stress genuinely affects you, not just registers as a fact to manage.",
        tip: "Keep letting it in, and build recovery time so it doesn't tip into carrying your whole team's stress."
      },
      mid: {
        read: "You access empathy for your team, though it takes more effort for some people than others.",
        tip: "Notice who's easiest to empathize with, and extend that same effort to people less like you."
      },
      low: {
        read: "You understand your team's struggles intellectually more than you feel them.",
        tip: "In your next 1:1, resist problem-solving for the first two minutes \u2014 just reflect what they're feeling."
      }
    },
    AE: {
      whyItMatters: "The gap between how you actually feel and the \u201Cmanager voice\u201D you perform costs you energy daily, and your team usually senses it.",
      high: {
        read: "You lead in a way that's true to how you feel, even when it's not the safe corporate answer.",
        tip: "Keep being real, and notice if there's a specific context \u2014 board updates, skip-levels \u2014 where you still perform."
      },
      mid: {
        read: "You're authentic in some management contexts, more guarded in others.",
        tip: "Pick your most guarded context and experiment with one honest disclosure."
      },
      low: {
        read: "You manage what you reveal to control how you're perceived as a leader.",
        tip: "Practice one small act of visible authenticity a week with your team."
      }
    },
    SP: {
      whyItMatters: "How you handle deadline pressure sets the emotional tone your whole team absorbs, whether you intend it to or not.",
      high: {
        read: "Under deadline pressure, you check in with how you feel and let that guide your next step.",
        tip: "Keep that instinct, and add one grounding practice so you're not relying on the team's mood to regulate you."
      },
      mid: {
        read: "Your stress response shifts depending on the type of pressure.",
        tip: "Notice what kind of deadline makes you shut down vs. reach out."
      },
      low: {
        read: "Under pressure, you shut down and retreat into solving alone.",
        tip: "Next high-pressure week, tell one peer you're having a hard time \u2014 no solving required."
      }
    },
    VP: {
      whyItMatters: "What you're actually optimizing for \u2014 team wellbeing or the number \u2014 quietly steers every close call you make as a manager.",
      high: {
        read: "Team wellbeing and meaning matter more to you than hitting every metric.",
        tip: "Keep protecting what matters, and sanity-check that this isn't avoiding necessary hard targets."
      },
      mid: {
        read: "You hold both team wellbeing and results as real priorities, weighing them situationally.",
        tip: "Notice which one wins when you're behind on a deadline \u2014 that's your truer default."
      },
      low: {
        read: "Results matter more to you than how the team felt getting there.",
        tip: "Before your next big call, ask what you'd choose if no one would ever see the metric."
      }
    },
    CS: {
      whyItMatters: "How you communicate as a manager determines whether feedback actually lands, or just gets heard and forgotten.",
      high: {
        read: "You communicate with warmth and honesty, even about underperformance.",
        tip: "Keep the directness, and check that warmth isn't softening necessary clarity."
      },
      mid: {
        read: "You adjust communication style depending on the person and stakes.",
        tip: "Notice which reports get your warmer register and which get the guarded one."
      },
      low: {
        read: "You default to facts and deliverables, and feelings rarely enter feedback.",
        tip: "In your next feedback conversation, add one sentence of feeling before the facts."
      }
    }
  },
  pendingUnlockStorageKey = "hha_pending_unlock";
function savePendingUnlock(e, t, a) {
  try {
    localStorage.setItem(pendingUnlockStorageKey, JSON.stringify({
      trackKey: e,
      answers: t,
      intake: a,
      savedAt: Date.now()
    }));
  } catch (n) {}
}
function loadPendingUnlock() {
  try {
    let e = localStorage.getItem(pendingUnlockStorageKey);
    if (!e) return null;
    let t = JSON.parse(e);
    return Date.now() - t.savedAt > 1440 * 60 * 1e3 ? (localStorage.removeItem(pendingUnlockStorageKey), null) : t;
  } catch (e) {
    return null;
  }
}
function clearPendingUnlock() {
  try {
    localStorage.removeItem(pendingUnlockStorageKey);
  } catch (e) {}
}
function getScoreBand(e) {
  return e === null ? null : e >= 19 ? "high" : e >= 12 ? "mid" : "low";
}
var scoreBands = {
    high: {
      label: "Strength",
      color: heartRed
    },
    mid: {
      label: "Balanced",
      color: gold
    },
    low: {
      label: "Development Area",
      color: headBlue
    }
  },
  executiveSubscales = [{
    code: "DM",
    name: "Strategic Decision-Making",
    blurb: "How you make bets that shape the whole organization.",
    items: [{
      d: "H",
      t: "When making a major strategic bet, I trust my gut feeling even when I can't fully justify it to the board."
    }, {
      d: "K",
      t: "I prefer to build the full business case and data model before committing to a major strategic bet."
    }, {
      d: "H",
      t: "Some of my best strategic calls have come from what simply felt right, not from the deck."
    }, {
      d: "K",
      t: "I feel uneasy committing to a strategic direction until the analysis is airtight."
    }, {
      d: "K",
      t: "I trust a rigorous model over a hunch, even when the hunch about market timing has been right before."
    }]
  }, {
    code: "RC",
    name: "Executive Trust & Relationships",
    blurb: "How you build trust with your leadership team, board, and investors.",
    items: [{
      d: "H",
      t: "I extend trust to my leadership team based on how they make me feel about their judgment, not just their track record."
    }, {
      d: "K",
      t: "I evaluate my leadership team mainly by their measurable performance against targets."
    }, {
      d: "H",
      t: "I stay emotionally open with my executive peers even when there's a risk of being let down."
    }, {
      d: "K",
      t: "I keep emotional distance from my leadership team and the board to stay objective."
    }, {
      d: "H",
      t: "I can tell when a leadership team member is struggling or losing confidence, even before it shows in the numbers."
    }]
  }, {
    code: "EA",
    name: "Emotional Awareness in the C-Suite",
    blurb: "Whether you notice your own reactions under organizational pressure.",
    items: [{
      d: "H",
      t: "I notice and name my own anxiety or frustration during a board meeting, rather than pushing it aside."
    }, {
      d: "K",
      t: "I intellectualize my reactions to organizational setbacks instead of actually feeling them."
    }, {
      d: "H",
      t: "I let myself feel the weight of a hard call \u2014 a layoff, a pivot \u2014 fully rather than immediately moving to execution."
    }, {
      d: "K",
      t: "I distract myself with the next task so I don't have to sit with how a difficult board conversation made me feel."
    }, {
      d: "K",
      t: "I analyze my own stress logically rather than just noticing it in the moment."
    }]
  }, {
    code: "CN",
    name: "High-Stakes Conflict & Negotiation",
    blurb: "What wins when the stakes are the whole company.",
    items: [{
      d: "H",
      t: "In a boardroom disagreement, I try to understand what's driving the other side before I try to win the point."
    }, {
      d: "K",
      t: "In a high-stakes negotiation, I focus on leverage and being right over the relationship."
    }, {
      d: "H",
      t: "I'm willing to say \u201CI was wrong\u201D in front of my leadership team if it rebuilds trust, even if I could defend my original call."
    }, {
      d: "K",
      t: "I find it hard to let go of winning a boardroom argument, even when it costs organizational trust."
    }, {
      d: "H",
      t: "I can stay relationally warm with a board member or investor even in the middle of a hard negotiation."
    }]
  }, {
    code: "TI",
    name: "Trust & Intuition on Big Bets",
    blurb: "How much weight your instinct gets on irreversible calls.",
    items: [{
      d: "H",
      t: "I trust my read on a major partnership or acquisition, even when I can't fully justify it on paper."
    }, {
      d: "K",
      t: "I only trust what's in the model \u2014 market data, financials \u2014 not my gut read on a deal."
    }, {
      d: "H",
      t: "I've ignored my gut instinct on a major bet and regretted it."
    }, {
      d: "K",
      t: "I dismiss my gut feeling about organizational risk as unreliable compared to hard data."
    }, {
      d: "K",
      t: "I trust the financial model over the hunch, even when the hunch about a market shift turned out right before."
    }]
  }, {
    code: "EC",
    name: "Empathy at Scale",
    blurb: "Whether the organization's experience lands with you, or stays abstract.",
    items: [{
      d: "H",
      t: "The organization's collective stress during a hard period genuinely affects me, not just registers as a metric."
    }, {
      d: "K",
      t: "I understand what the organization is going through intellectually but rarely feel moved by it."
    }, {
      d: "H",
      t: "I go out of my way to address organizational pain, even at a cost to strategic momentum."
    }, {
      d: "K",
      t: "I keep my empathy for the organization in check so it doesn't interfere with hard strategic calls."
    }, {
      d: "H",
      t: "Seeing the organization struggle or succeed genuinely moves me emotionally."
    }]
  }, {
    code: "AE",
    name: "Authentic Executive Presence",
    blurb: "Whether the leader the org sees matches how you actually feel.",
    items: [{
      d: "H",
      t: "I lead in a way that's true to how I genuinely feel, even when it's not the polished executive answer."
    }, {
      d: "K",
      t: "I often say what's expected of a CEO or executive rather than what I actually think."
    }, {
      d: "H",
      t: "I'd rather be a genuine, occasionally imperfect leader than a flawlessly polished one."
    }, {
      d: "K",
      t: "I carefully manage what I reveal to control how I'm perceived at the executive level."
    }, {
      d: "K",
      t: "I keep my emotional expression tightly controlled in front of the board and the organization."
    }]
  }, {
    code: "SP",
    name: "Pressure at the Top",
    blurb: "What you reach for when the whole company is watching.",
    items: [{
      d: "H",
      t: "Under company-wide crisis pressure, I check in with how I feel and let that guide my next step."
    }, {
      d: "K",
      t: "Under company-wide crisis pressure, I shut down my emotions and focus purely on execution."
    }, {
      d: "H",
      t: "When overwhelmed at the executive level, I reach out to a peer, coach, or mentor for support."
    }, {
      d: "K",
      t: "When overwhelmed at the executive level, I withdraw and try to think my way out alone."
    }, {
      d: "H",
      t: "I recover faster from a brutal quarter when I let myself feel and express it rather than suppress it."
    }]
  }, {
    code: "VP",
    name: "What You're Building For",
    blurb: "What you're actually optimizing for at the highest level.",
    items: [{
      d: "H",
      t: "Organizational meaning and people matter more to me than hitting every board target."
    }, {
      d: "K",
      t: "Results and shareholder value matter more to me than how the organization feels about how we got there."
    }, {
      d: "H",
      t: "I'd choose a harder, more meaningful strategic direction over an easier, more lucrative one."
    }, {
      d: "K",
      t: "I measure a good year mostly by the numbers, not the organization's experience getting there."
    }, {
      d: "K",
      t: "I judge whether a strategic decision was \u201Cgood\u201D mainly by the outcome, not how it felt to make it."
    }]
  }, {
    code: "CS",
    name: "Communication as an Executive",
    blurb: "How you talk to your leadership team, board, and the whole company.",
    items: [{
      d: "H",
      t: "I communicate with warmth and honesty with my leadership team, even about existential threats to the business."
    }, {
      d: "K",
      t: "I communicate primarily with facts and strategy, keeping emotion out of company-wide messaging."
    }, {
      d: "H",
      t: "I tell my leadership team how I feel about their work directly, rather than assuming they know."
    }, {
      d: "K",
      t: "I find it easier to talk about strategy and numbers than about how the organization is doing emotionally."
    }, {
      d: "H",
      t: "My leadership team would describe my communication style as heartfelt and genuine."
    }]
  }],
  executiveProfiles = [{
    key: "heart-centered",
    range: [200, 250],
    name: "Heart-Centered \u2014 Purpose-Driven Leadership",
    color: heartRed,
    teaser: "You lead the organization with feeling and instinct \u2014 people follow you because they believe in you, not just your title.",
    summary: "You lead primarily from the heart at the highest level. You trust your read on people, markets, and moments first, and use data and process to refine rather than override that read. This tends to show up as an executive who inspires real loyalty, not just compliance.",
    strengths: ["Leadership team and board trust you and feel genuinely aligned with your vision", "Strong read on organizational culture and morale, often ahead of engagement data", "Comfortable rebuilding trust after a strategic misstep", "Leads with values that don't bend under shareholder pressure"],
    watchouts: ["Difficult organizational decisions (layoffs, pivots) can get delayed past the point of strategic necessity", "Executive boundaries can blur \u2014 you may absorb the whole organization's stress as your own", "High-stakes financial or M&A decisions may need more deliberate analysis than instinct alone provides"],
    developmentAreas: "Your growth edge at this level isn't caring more about the mission \u2014 it's building enough rigor around that care so it doesn't compromise the organization's survival. That means making the hard call on time even when it feels like a betrayal of your values, and protecting your own capacity so the weight of the whole organization doesn't become yours alone to carry.",
    relationships: "Your leadership team and board generally trust you fast, and they feel your investment in the mission without having to ask for it. The risk is discernment: you can extend trust to an underperforming executive past the point the evidence says you should act, and the cost compounds at this level.",
    work: "You thrive leading through vision, culture, and purpose \u2014 the organization feels genuinely inspired, not just directed. Purely financial or operational-first executive tasks will feel like a language you're capable of speaking but don't enjoy.",
    workingStyleTips: ["Before protecting an underperforming executive \u201Ca little longer,\u201D name out loud what that delay is costing the rest of the leadership team and the organization.", "Build one recurring checkpoint into major strategic decisions where you deliberately look only at the financial model, separate from how the vision feels.", "Delegate or systematize the purely operational parts of the role \u2014 they drain you disproportionately."],
    handlingDifficulty: "When the organization hits a hard patch, you feel it fully and reach toward connection \u2014 town halls, direct conversations, visible presence. That keeps trust from cratering silently, which is real strength at this level. The risk is reacting to the organization's mood before you've had a moment to separate your own feeling from the strategic facts.",
    leadershipImpact: "Being led by you likely feels genuinely inspiring \u2014 people commit because they believe, not just because they're paid to. The flip side: your leadership team may sense when you're avoiding a hard call on a peer executive's performance, and over time that can quietly erode trust in your fairness at the top.",
    cultureFitPrompt: "If your board or investors reward fast, metrics-first decisions over mission and culture, you may find yourself working against the grain constantly \u2014 worth naming honestly whether that tension is making you a better check on short-termism, or slowly burning you out.",
    roadmap: [{
      area: "Delivering Hard Organizational Decisions On Time",
      insight: "Your instinct to protect people you believe in can quietly become a habit of delaying necessary organizational decisions until they're overdue.",
      steps: ["Set a personal rule: performance or strategic concerns about a leader get raised within two weeks of noticing.", "Before delaying a hard decision, name out loud what the delay costs the organization.", "Practice a scripted opener for hard executive conversations so they start even when uncomfortable."]
    }, {
      area: "Adding Rigor to High-Stakes Bets",
      insight: "On M&A, major capital allocation, or strategic pivots, speed on instinct can put the whole organization at risk.",
      steps: ["For decisions above a certain impact threshold, build in a mandatory model review before deciding.", "Write the decision out in plain language before acting on it.", "Ask a trusted board member or peer CEO to sanity-check your biggest bets."]
    }, {
      area: "Protecting Your Own Capacity",
      insight: "Absorbing the whole organization's stress as your own is generous, but it isn't sustainable at this scale.",
      steps: ["Notice the bodily signal that shows up when you're taking on organizational stress as your own.", "Build one recurring boundary and hold it, even during a crisis.", "Work with a coach or peer group built specifically for this weight."]
    }, {
      area: "Building Fair, Scalable Structure",
      insight: "Structure isn't the opposite of purpose-driven leadership \u2014 it's what makes your care fair and repeatable across an organization too large to touch personally.",
      steps: ["Pick one recurring executive process (reviews, succession) and build a consistent framework.", "Delegate or systematize the operational parts of the role that drain you.", "Revisit this roadmap in 3 months and note what stuck."]
    }],
    growth: ["Before your next hard organizational decision, set a date within two weeks rather than waiting for the 'right moment.'", "Practice saying 'let's look at the model on this one' as a complete, valid response.", "Notice the difference between an executive who needs support and one who needs a consequence.", "Keep a one-line weekly note of a moment you led with rigor instead of feeling.", "Block real recovery time weekly that's just for you, not the organization."]
  }, {
    key: "heart-leaning",
    range: [150, 199],
    name: "Heart-Leaning \u2014 People-First, Integrated",
    color: heartRedDark,
    teaser: "You lead with both head and heart \u2014 but when they disagree, your read on people and culture usually wins.",
    summary: "You lead with both head and heart at the executive level, but when they conflict, your read on people and organizational culture usually wins. You're capable of rigorous strategic analysis, but organizational morale and trust tend to carry more weight than pure metrics.",
    strengths: ["Balanced strategic decisions that rarely ignore data or organizational sentiment", "Genuine trust with your leadership team, with enough boundary to avoid being taken advantage of", "Good instincts on people and culture, checked not overridden by data"],
    watchouts: ["Under board pressure, the balance can tip further toward preserving harmony than the situation calls for", "May avoid necessary hard financial conversations because they feel uncomfortable", "Worth noticing when leniency with an underperforming executive is old pattern rather than present-moment judgment"],
    developmentAreas: "You're already integrating both sides more than most executives \u2014 the refinement now is consistency, especially under board or investor pressure when the pull toward keeping the peace gets strongest, which is exactly when a second, more analytical opinion matters most.",
    relationships: "Your relationships with your leadership team and board are warm and reciprocal, and you usually sense early when something's off \u2014 even if you don't always act on it immediately. They experience you as genuine, not a pushover.",
    work: "You're comfortable with both structured financial review and gut calls on people and culture, which makes you effective leading through ambiguity. Your risk is deferring to organizational sentiment in the specific calls that need more rigor \u2014 executive performance, M&A, resourcing.",
    workingStyleTips: ["Name in advance the decisions (executive performance, M&A, major resourcing) where you'll always force a written, criteria-based pass before deciding.", "When you notice you're avoiding a hard financial conversation because it feels uncomfortable, treat that discomfort as a signal to lean in.", "Ask a trusted, more data-driven board member or peer to sanity-check your biggest calls."],
    handlingDifficulty: "You meet organizational difficulty by feeling it honestly first, then figuring out what to do \u2014 which generally builds trust. Where it goes sideways is under real board pressure, when a fear of conflict quietly takes the wheel disguised as \u201Creading the room.\u201D",
    leadershipImpact: "Your leadership team likely feels genuinely cared for and safe bringing you problems. The risk: your strongest executives may quietly notice when you let an underperforming peer coast too long, and start to wonder if the bar actually matters at the top.",
    cultureFitPrompt: "If your board runs on hard metrics and fast executive turnover, your people-first instinct may create real friction \u2014 worth asking whether that tension makes you a better check on the culture, or just makes the job harder.",
    roadmap: [{
      area: "Consistency Under Board Pressure",
      insight: "You integrate people and data well normally \u2014 the gap shows specifically when you're under board pressure and emotionally invested.",
      steps: ["Pre-decide which decisions (executive performance, M&A) always get a written criteria pass, no exceptions.", "Build a simple checklist you reach for automatically under board pressure.", "Any people decision made while stressed gets revisited 24 hours later before it's final."]
    }, {
      area: "Recognizing Conflict-Avoidance Disguised as Instinct",
      insight: "Under board pressure, a fear of confrontation can borrow the voice of \u201Creading the room.\u201D",
      steps: ["Ask, in hard moments: is this what the organization needs, or my own discomfort with conflict?", "Track weekly when you later realize avoidance was driving, not insight.", "Loop in a board member specifically on executive performance calls."]
    }, {
      area: "Doing the Hard Financial Review You'd Rather Skip",
      insight: "You can avoid a necessary hard conversation about an executive's numbers because it feels unkind, not because it's unnecessary.",
      steps: ["Notice when 'they're navigating a lot right now' becomes a permanent excuse.", "Ask a data-driven board member to sanity-check assessments before you finalize them.", "Give yourself permission to be temporarily 'unkind' in service of organizational fairness."]
    }, {
      area: "Calibrating Your Own Track Record on People Calls",
      insight: "You don't yet have an evidence-based sense of when your people-read is right and when it's wishful thinking.",
      steps: ["Keep a light log: who you gave the benefit of the doubt to, and how it played out.", "Review it quarterly, not just after a blow-up.", "Use the pattern to recalibrate how much benefit-of-the-doubt you extend by default."]
    }],
    growth: ["Before your next executive review, write the criteria-based case first, then check it against how you feel about the person.", "Ask yourself whether avoiding a tough conversation is kindness, or your own discomfort.", "Keep a short log of people calls where the data was right and your gut was wrong, and vice versa.", "Once a month, revisit a people decision made under board pressure and ask what a calmer you would've done.", "Practice stating the data-driven case out loud to a peer before your final call."]
  }, {
    key: "head-leaning",
    range: [100, 149],
    name: "Head-Leaning \u2014 Results-First, Integrated",
    color: headBlueDark,
    teaser: "You lead with both head and heart \u2014 but logic usually wins the tie-break at the highest level.",
    summary: "You lead with both head and heart, but logic usually wins the tie-break. You value being right, being prepared, and defensible strategic decisions. Organizational sentiment is noticed, but filtered through data before you act on it.",
    strengths: ["Clear-headed, well-reasoned strategic decisions, especially under board pressure", "Reliability \u2014 your leadership team and board trust your judgment because it's consistent", "Not easily swayed by a vocal minority or a bad quarter"],
    watchouts: ["Executive relationships can read as transactional, or like you're managing rather than leading", "A good instinct about a person or market may get overridden because it isn't provable in a board deck", "Organizational frustration that goes unexpressed for too long tends to surface as executive attrition"],
    developmentAreas: "The work for you isn't becoming less rigorous \u2014 it's letting organizational sentiment count as a real input, not noise to manage around. That starts small: noticing the mood in the room without immediately looking for the metric that explains it away.",
    relationships: "Your leadership team and board generally experience you as competent and fair, but may work harder to feel close to you, since warmth gets filtered through your analytical process first. You show you care through consistency, not words.",
    work: "You're well-suited to leading through complexity and existential ambiguity, where being right matters more than being warm. The same wiring can make you slow to celebrate a major win or sit with organizational disappointment.",
    workingStyleTips: ["In leadership team meetings, ask \u201Chow does this land across the organization\u201D as a standing question, not an afterthought.", "When you dismiss a read on an executive or the market because you can't prove it yet, write it down and check back.", "Build in real recovery time for your leadership team after high-output periods, not just for yourself."],
    handlingDifficulty: "Under organizational difficulty, you default to solving \u2014 quiet, analytical, focused on the strategic fix, which works for a lot of problems. What it doesn't do is process the organization's emotional residue, which tends to surface later as quiet disengagement or unexpected departures.",
    leadershipImpact: "Your leadership team trusts your judgment and feels safe under your consistency, but may not feel truly seen by you. Over time, your strongest executives may leave not because of bad leadership, but because they never felt like more than a strong performer to you.",
    cultureFitPrompt: "If your organization explicitly values a \u201Cpeople-first\u201D culture on paper, your results-first default may create a quiet mismatch worth naming \u2014 are you the counterbalance the culture needs, or out of step with it?",
    roadmap: [{
      area: "Letting Organizational Sentiment Count as Data",
      insight: "You treat organizational mood as noise to manage around rather than a legitimate input \u2014 even when it's accurate.",
      steps: ["When you dismiss a read on culture because you can't prove it, write it down anyway and check back later.", "Before finalizing a major decision, explicitly ask 'how does this land,' not just 'does this hold up.'", "Practice treating a strong read on organizational mood as a hypothesis worth testing."]
    }, {
      area: "Making Care Visible at the Top",
      insight: "People trust your judgment but may not feel close to you, because warmth doesn't reliably make it to the surface.",
      steps: ["Add one sentence of impact or feeling to feedback you give executives, not just facts and outcomes.", "Say the appreciative thing out loud instead of assuming it's understood.", "Ask an executive what they wish you expressed more, and act on the answer."]
    }, {
      area: "Processing Organizational Difficulty Instead of Just Solving It",
      insight: "Under difficulty, you solve and move on \u2014 the organization's emotional residue doesn't disappear, it resurfaces later as disengagement.",
      steps: ["Name the organization's likely feeling out loud, even briefly, before moving to solutions.", "After a hard quarter, ask the leadership team how it felt, not just whether targets were hit.", "Build in real recovery time after high-output periods, not just after visible burnout."]
    }, {
      area: "Recovering the Muscle of Noticing Culture",
      insight: "Noticing organizational sentiment is a skill like any other \u2014 under-used, it atrophies, and that's reversible with practice.",
      steps: ["Once a week, make one small call purely on read, and notice what happens.", "Sit with unresolved organizational tension for a few minutes without rushing to fix it.", "Reflect an executive's feeling back to them before offering a solution, at least once a week."]
    }],
    growth: ["Once a week, make one small leadership decision purely on how it feels.", "When an executive shares a problem, try reflecting their feeling back before offering a solution.", "Name your own reaction out loud in a leadership meeting at least once a week.", "After a hard quarter, ask the leadership team how it felt, not just whether targets were hit.", "Practice sitting with organizational tension for five minutes without rushing to fix it."]
  }, {
    key: "head-dominant",
    range: [50, 99],
    name: "Head-Dominant \u2014 Command-and-Control at Scale",
    color: headBlue,
    teaser: "Logic, control, and process are your default setting at the highest level \u2014 strong execution, sometimes distant.",
    summary: "You lead primarily from the head at the executive level. Logic, control, and process are your default mode, and emotional input from your leadership team and organization is often minimized or arrives late. This can look like strong execution from the outside, while the organization experiences distance.",
    strengths: ["Composure and clarity in existential crisis or high-stakes situations", "Objectivity \u2014 your strategic decisions are less prone to favoritism or reactivity", "Strong follow-through once a strategic decision is made"],
    watchouts: ["Executive and board relationships may feel one-sided or purely transactional, even with good intent", "Suppressed frustration with the organization tends to leak out as tension or a sudden sharp reaction", "A read on organizational or market risk is real data \u2014 dismissing it entirely removes useful information"],
    developmentAreas: "The growth path here is reconnecting with organizational sentiment as information, not weakness. A nagging sense that culture or morale is off is data your analytical process hasn't caught up to yet, and it deserves a seat at the table.",
    relationships: "Your leadership team and board may read you as composed but hard to reach. Your investment in the organization's growth is often real but doesn't reliably surface where they can feel it, which can leave them guessing where they stand.",
    work: "You're a strong asset leading through crisis, ambiguity, or any high-stakes execution challenge. Organizational emotion that goes unprocessed under your leadership doesn't disappear \u2014 it resurfaces as executive attrition or a culture problem that seems to come from nowhere.",
    workingStyleTips: ["Schedule genuine unstructured time with your leadership team \u2014 connection without an agenda builds trust pure competence doesn't.", "When giving feedback to executives, add one sentence about impact or feeling, not just facts and outcomes.", "Before a high-stakes board call, check your own physical stress signals as a real input."],
    handlingDifficulty: "You handle organizational difficulty by controlling what you can and analyzing through the rest, which makes you genuinely steady in a crisis. The cost shows up in your organization afterward \u2014 unprocessed tension resurfaces as disengagement or a sudden executive departure that blindsides you.",
    leadershipImpact: "Your leadership team likely respects your competence and composure under pressure, but may not experience you as approachable. The specific risk: problems get hidden from you longer than they should, because your team senses you'd rather have the fix than the feeling.",
    cultureFitPrompt: "If your organization is shifting toward a more people-centered leadership model, your command-and-control default may be increasingly out of step \u2014 worth an honest look at whether your style is evolving with the culture or holding steady against it.",
    roadmap: [{
      area: "Treating Organizational Signals as Information",
      insight: "A nagging sense that something's off in the culture is data your analytical mind hasn't caught up to yet.",
      steps: ["Before a high-stakes board call, check in on your own physical state as a real input.", "When you notice an organizational stress signal, pause and name what might be going on before acting.", "Keep a simple log of culture signals and what they later turned out to mean."]
    }, {
      area: "Making Care Visible at the Top",
      insight: "Your investment in the organization is often genuine but doesn't reliably reach people, which leaves them guessing where they stand.",
      steps: ["Schedule genuine unstructured time with your leadership team, with no agenda.", "Say the caring thing out loud instead of assuming actions speak for themselves.", "Ask directly what your leadership team wishes you expressed more often \u2014 then do it."]
    }, {
      area: "Preventing the Delayed Cost of an Unprocessed Organization",
      insight: "Organizational emotion that never gets processed doesn't vanish \u2014 it resurfaces as attrition or a culture problem that seems to come from nowhere.",
      steps: ["Build a small, regular check-in practice with your leadership team beyond metrics.", "Ask one open, non-metric question in every 1:1 with a direct report: how are you actually doing?", "Notice patterns: does attrition spike after specific kinds of unprocessed situations?"]
    }, {
      area: "Giving Your Read on People and Markets a Real Vote",
      insight: "Dismissing a gut read on an organizational or market risk entirely removes a genuine source of information.",
      steps: ["Before dismissing a read, ask what evidence would need to exist for you to take it seriously.", "Write down instincts about people or markets you overrode and revisit whether they were right.", "Treat a strong, repeated read as equivalent in weight to a moderate amount of data."]
    }],
    growth: ["Build in unstructured time with your leadership team, with no agenda or problem to solve.", "When you notice a physical stress signal, pause and name what you're feeling before doing anything else.", "Ask your leadership team what they wish you expressed more often, and take it seriously.", "Once a day, name one feeling about the organization in one word, without analyzing why.", "Before dismissing a read on an organizational risk, ask what you'd need to see to take it seriously."]
  }],
  executiveSubscaleReads = {
    DM: {
      whyItMatters: "How you make strategic bets shapes the trajectory of the entire organization and your credibility with the board over time.",
      high: {
        read: "Strategic bets come from a felt sense of rightness first, with the model used to sanity-check rather than lead.",
        tip: "Keep trusting your read, but add a deliberate model review before irreversible or highly capital-intensive bets."
      },
      mid: {
        read: "You draw on both instinct and data fairly evenly when making strategic calls.",
        tip: "Notice which mode you default to under board pressure \u2014 that's usually your true default."
      },
      low: {
        read: "You won't commit to a strategic direction until the model is airtight, even when it's really a market-timing read.",
        tip: "For your next major bet, decide on instinct first, then check it against the model second."
      }
    },
    RC: {
      whyItMatters: "Trust at the top is the currency that makes delegation, honest dissent, and retention of your best executives possible.",
      high: {
        read: "You extend trust to your leadership team based on how they make you feel about their judgment.",
        tip: "Keep trusting your read, but build one evidence check before extending major autonomy to a new executive."
      },
      mid: {
        read: "You balance instinct with track record when deciding how much autonomy to extend.",
        tip: "Notice if you extend trust faster to executives similar to you \u2014 worth checking for bias."
      },
      low: {
        read: "You evaluate your leadership team mainly by measurable performance, keeping emotional distance.",
        tip: "Pick one executive relationship this month and have a real, non-agenda conversation."
      }
    },
    EA: {
      whyItMatters: "Your emotional state sets the tone the entire organization absorbs, whether you intend it to or not.",
      high: {
        read: "You notice your own anxiety or frustration during high-stakes moments rather than pushing it aside.",
        tip: "Keep naming it, and model appropriately calibrated awareness for your leadership team."
      },
      mid: {
        read: "You notice your reactions to organizational setbacks sometimes, though crisis periods can bury them.",
        tip: "Build a brief end-of-day check-in, especially during high-stakes stretches."
      },
      low: {
        read: "You intellectualize your reactions to organizational setbacks rather than actually feeling them.",
        tip: "Before your next board meeting, pause and name what you're actually feeling walking in."
      }
    },
    CN: {
      whyItMatters: "How you handle boardroom conflict and high-stakes negotiation determines whether people trust you to be fair when it matters most.",
      high: {
        read: "You prioritize understanding what's driving the other side before winning the point.",
        tip: "Keep prioritizing the relationship, but make sure necessary hard calls aren't being delayed to preserve harmony."
      },
      mid: {
        read: "You can hold your ground or prioritize the relationship depending on the stakes.",
        tip: "Notice your pattern with specific board members or executives \u2014 do you go easier on some?"
      },
      low: {
        read: "Winning the point tends to outweigh the relationship once a boardroom disagreement escalates.",
        tip: "In your next hard negotiation, ask what the other side needs to feel heard before making your case."
      }
    },
    TI: {
      whyItMatters: "Your instinct on major bets \u2014 deals, markets, people \u2014 is pattern recognition built from experience that data alone can't replicate.",
      high: {
        read: "You trust your read on a major deal or bet, even without full justification on paper.",
        tip: "Keep honoring your read, and log outcomes to sharpen your calibration."
      },
      mid: {
        read: "You weigh instinct alongside data, giving neither automatic priority.",
        tip: "Notice when you override your read \u2014 is there a pattern to when you don't trust it?"
      },
      low: {
        read: "You trust the model over the instinct, even when the instinct about a market or person was right before.",
        tip: "Next time a strong read shows up, write it down before dismissing it."
      }
    },
    EC: {
      whyItMatters: "Empathy at scale is what keeps the organization feeling like a mission people believe in, not just a headcount number.",
      high: {
        read: "The organization's collective stress genuinely affects you, not just registers as a metric.",
        tip: "Keep letting it in, and build recovery time so it doesn't tip into carrying the whole organization's stress."
      },
      mid: {
        read: "You access empathy for the organization, though it takes more effort in some situations.",
        tip: "Notice which parts of the organization are easiest to empathize with, and extend that effort further."
      },
      low: {
        read: "You understand the organization's struggles intellectually more than you feel them.",
        tip: "In your next skip-level or town hall, resist problem-solving first \u2014 just listen."
      }
    },
    AE: {
      whyItMatters: "The gap between how you actually feel and the \u201Cexecutive voice\u201D you perform costs you energy daily, and your organization usually senses it.",
      high: {
        read: "You lead in a way that's true to how you feel, even when it's not the polished executive answer.",
        tip: "Keep being real, and notice if there's a specific context \u2014 investor calls, board decks \u2014 where you still perform."
      },
      mid: {
        read: "You're authentic in some executive contexts, more guarded in others.",
        tip: "Pick your most guarded context and experiment with one honest disclosure."
      },
      low: {
        read: "You manage what you reveal to control how you're perceived at the top.",
        tip: "Practice one small act of visible authenticity a week with your leadership team."
      }
    },
    SP: {
      whyItMatters: "How you handle company-wide crisis pressure sets the emotional ceiling for how the whole organization copes.",
      high: {
        read: "Under crisis pressure, you check in with how you feel and let that guide your next step.",
        tip: "Keep that instinct, and add one grounding practice so you're not relying on the room's mood to regulate you."
      },
      mid: {
        read: "Your stress response shifts depending on the type of crisis.",
        tip: "Notice what kind of pressure makes you shut down vs. reach out."
      },
      low: {
        read: "Under pressure, you shut down and retreat into solving alone.",
        tip: "Next high-pressure stretch, tell one peer or coach you're having a hard time."
      }
    },
    VP: {
      whyItMatters: "What you're actually optimizing for at the top \u2014 mission or the number \u2014 quietly steers every close strategic call.",
      high: {
        read: "Organizational meaning and people matter more to you than hitting every board target.",
        tip: "Keep protecting what matters, and sanity-check that this isn't avoiding necessary hard targets."
      },
      mid: {
        read: "You hold both mission and results as real priorities, weighing them situationally.",
        tip: "Notice which one wins when you're behind on a board commitment \u2014 that's your truer default."
      },
      low: {
        read: "Results matter more to you than how the organization felt getting there.",
        tip: "Before your next big call, ask what you'd choose if no board member would ever see the metric."
      }
    },
    CS: {
      whyItMatters: "How you communicate at the top determines whether the whole organization actually trusts what you say, or just hears it.",
      high: {
        read: "You communicate with warmth and honesty, even about existential threats to the business.",
        tip: "Keep the directness, and check that warmth isn't softening necessary clarity."
      },
      mid: {
        read: "You adjust communication style depending on the audience and stakes.",
        tip: "Notice which parts of the organization get your warmer register and which get the guarded one."
      },
      low: {
        read: "You default to facts and strategy, and feelings rarely enter company-wide communication.",
        tip: "In your next all-hands, add one sentence of feeling before the facts."
      }
    }
  },
  newJoinerSubscales = [{
    code: "DM",
    name: "Decision-Making as You Start Out",
    blurb: "How you make calls when you're still learning the ropes.",
    items: [{
      d: "H",
      t: "When making a call at my new job, I trust my gut feeling even when I don't have much context yet."
    }, {
      d: "K",
      t: "I prefer to ask around and gather information before making any decision at my new job."
    }, {
      d: "H",
      t: "Some of my best early decisions have come from what simply felt right, not from asking everyone first."
    }, {
      d: "K",
      t: "I feel uneasy making a call at work until I've checked with someone more experienced."
    }, {
      d: "K",
      t: "I trust what my manager or a mentor says over my own instinct, even when my gut has been right before."
    }]
  }, {
    code: "RC",
    name: "Building Relationships at a New Job",
    blurb: "How you build trust with new colleagues and your manager.",
    items: [{
      d: "H",
      t: "I choose who to trust among my new colleagues based on how they make me feel, not just their title."
    }, {
      d: "K",
      t: "I evaluate new colleagues mainly by how useful they seem to my career progress."
    }, {
      d: "H",
      t: "I stay open and warm with new coworkers even though I don't know them well yet."
    }, {
      d: "K",
      t: "I keep my distance from new colleagues until I'm sure I can trust them."
    }, {
      d: "H",
      t: "I can tell when a colleague genuinely wants to help me, even without them saying it directly."
    }]
  }, {
    code: "EA",
    name: "Emotional Awareness in a New Environment",
    blurb: "Whether you notice your own reactions while still finding your footing.",
    items: [{
      d: "H",
      t: "I notice and name my own nervousness or excitement on a new project, rather than pushing it aside."
    }, {
      d: "K",
      t: "I intellectualize my reactions to a rough first few weeks instead of actually feeling them."
    }, {
      d: "H",
      t: "I let myself feel disappointed after a mistake fully rather than immediately jumping to fix it."
    }, {
      d: "K",
      t: "I distract myself with more tasks so I don't have to sit with how a hard day at my new job made me feel."
    }, {
      d: "K",
      t: "I analyze my own stress about fitting in logically rather than just noticing it."
    }]
  }, {
    code: "CN",
    name: "Handling Feedback & Early Conflict",
    blurb: "What wins when you're new and unsure of the unwritten rules.",
    items: [{
      d: "H",
      t: "When I get critical feedback, I try to understand where it's coming from before reacting."
    }, {
      d: "K",
      t: "When I get critical feedback, I focus on defending my work over understanding the feedback."
    }, {
      d: "H",
      t: "I'm willing to admit I was wrong to a new colleague if it helps build trust, even early on."
    }, {
      d: "K",
      t: "I find it hard to let go of being right in a disagreement, even as the new person."
    }, {
      d: "H",
      t: "I can stay warm toward a colleague even after a tense disagreement in my first few months."
    }]
  }, {
    code: "TI",
    name: "Trust & Intuition as a Newcomer",
    blurb: "How much weight your instinct gets when you don't have context yet.",
    items: [{
      d: "H",
      t: "I trust my read on a new colleague or manager, even when I don't have much evidence yet."
    }, {
      d: "K",
      t: "I only trust what I've been explicitly told about someone, not my gut read."
    }, {
      d: "H",
      t: "I've ignored my gut instinct about a workplace situation and regretted it."
    }, {
      d: "K",
      t: "I dismiss my gut feeling about my new job as unreliable since I don't have context yet."
    }, {
      d: "K",
      t: "I trust what more experienced coworkers say over my own read, even when my read has been right before."
    }]
  }, {
    code: "EC",
    name: "Empathy for Your New Team",
    blurb: "Whether your new colleagues' experience lands with you.",
    items: [{
      d: "H",
      t: "A new colleague's stress or frustration genuinely affects me, even though I just met them."
    }, {
      d: "K",
      t: "I understand what my new colleagues are going through intellectually but rarely feel moved by it."
    }, {
      d: "H",
      t: "I go out of my way to help a struggling new teammate, even though I'm new myself."
    }, {
      d: "K",
      t: "I keep my empathy in check at work so it doesn't get in the way of learning my job."
    }, {
      d: "H",
      t: "Seeing a new colleague struggle or succeed genuinely moves me emotionally."
    }]
  }, {
    code: "AE",
    name: "Authentic Presence as the New Person",
    blurb: "Whether you show up as yourself, or perform who you think they want.",
    items: [{
      d: "H",
      t: "I show up as myself at my new job, even when it's not the safest first-impression move."
    }, {
      d: "K",
      t: "I often say what I think a new employee is supposed to say rather than what I actually think."
    }, {
      d: "H",
      t: "I'd rather be a genuine, occasionally awkward new hire than a perfectly polished one."
    }, {
      d: "K",
      t: "I carefully manage what I reveal about myself to control my first impression."
    }, {
      d: "K",
      t: "I keep my emotional expression tightly controlled while I'm still new."
    }]
  }, {
    code: "SP",
    name: "Pressure & Imposter Moments",
    blurb: "What you reach for when you feel out of your depth.",
    items: [{
      d: "H",
      t: "When I feel out of my depth, I check in with how I feel and let that guide my next step."
    }, {
      d: "K",
      t: "When I feel out of my depth, I shut down my emotions and just push through."
    }, {
      d: "H",
      t: "When overwhelmed as the new person, I reach out to a colleague or mentor for support."
    }, {
      d: "K",
      t: "When overwhelmed as the new person, I withdraw and try to figure it out alone."
    }, {
      d: "H",
      t: "I recover faster from a hard week when I let myself feel and express it rather than suppress it."
    }]
  }, {
    code: "VP",
    name: "What You're Optimizing For Early On",
    blurb: "What actually drives your choices as you build your career.",
    items: [{
      d: "H",
      t: "Learning and genuine connection matter more to me right now than looking impressive fast."
    }, {
      d: "K",
      t: "Looking capable and being right matter more to me than how the process feels."
    }, {
      d: "H",
      t: "I'd rather take on meaningful work slowly than easy, high-visibility work fast."
    }, {
      d: "K",
      t: "I measure my early success mostly by output, not how the experience felt."
    }, {
      d: "K",
      t: "I judge whether I'm doing well mainly by results, not how it felt to get there."
    }]
  }, {
    code: "CS",
    name: "Communication as a New Team Member",
    blurb: "How you talk to your manager and new colleagues.",
    items: [{
      d: "H",
      t: "I communicate with warmth and honesty with my manager, even about things I don't understand yet."
    }, {
      d: "K",
      t: "I communicate primarily with facts and questions, keeping how I feel out of it."
    }, {
      d: "H",
      t: "I tell my manager or teammates how I feel about the work directly, rather than assuming they know."
    }, {
      d: "K",
      t: "I find it easier to ask about tasks and deadlines than to talk about how I'm doing."
    }, {
      d: "H",
      t: "My new colleagues would describe my communication style as heartfelt and genuine."
    }]
  }],
  newJoinerProfiles = [{
    key: "heart-centered",
    range: [200, 250],
    name: "Heart-Centered \u2014 Genuine From Day One",
    color: heartRed,
    teaser: "You lead with feeling and instinct even as the new person \u2014 people warm to you fast because you're real.",
    summary: "You operate primarily from the heart, even this early in your career. You trust your read on people and situations first, and use guidance and process to refine rather than override that read. This tends to show up as a new hire people genuinely warm to, not just tolerate.",
    strengths: ["Colleagues and your manager trust you quickly and feel your genuine investment", "Strong read on team dynamics, often ahead of what's said out loud", "Comfortable admitting mistakes and repairing trust early", "Shows up as authentically yourself rather than performing a \u201Cnew hire\u201D persona"],
    watchouts: ["Difficult feedback conversations can get avoided past the point of learning from them", "Boundaries can blur \u2014 you may take on too much to be liked or helpful", "High-stakes early decisions (which project to take, who to trust) may need more deliberate analysis"],
    developmentAreas: "Your growth edge this early isn't caring more about fitting in \u2014 it's building enough structure around that care so it doesn't work against your own learning curve. That means asking for hard feedback on time even when it feels uncomfortable, and protecting your own energy so being liked doesn't become more important than actually growing.",
    relationships: "You bond with new colleagues quickly, and they feel your genuine interest without having to ask for it. The risk is discernment: you can extend trust to a colleague or take on a task before you've had time to evaluate whether it's actually good for you.",
    work: "You thrive in roles where relationship and culture matter \u2014 people notice and remember you. Purely technical or process-heavy onboarding tasks will feel like a language you're capable of speaking but don't enjoy.",
    workingStyleTips: ["Before saying yes to extra work to be helpful, name out loud what saying yes will cost your own learning time.", "Build one recurring checkpoint into big early decisions where you deliberately look only at the facts, separate from how it feels.", "Ask for feedback on a schedule, not just when it's offered \u2014 waiting can let small issues become bigger ones."],
    handlingDifficulty: "When your first few months get hard, you feel it fully and reach toward connection \u2014 asking questions, checking in with people, being visible about the struggle. That keeps small problems from becoming isolating ones, which is real strength this early. The risk is reacting to how a moment feels before you've had a chance to separate your own feeling from what's actually happening.",
    leadershipImpact: "You're likely making a strong first impression \u2014 people remember you as warm and genuine, not just competent. The flip side: your manager or team may sense when you're avoiding asking a hard question because you don't want to seem unprepared, and that avoidance can slow your own ramp-up.",
    cultureFitPrompt: "If your organization's culture rewards fast, heads-down execution over relationship-building, you may feel like you're working against the grain early on \u2014 worth naming honestly whether that's a values mismatch worth watching, or just the normal discomfort of being new.",
    roadmap: [{
      area: "Asking for Hard Feedback Early",
      insight: "Your instinct to keep things warm can quietly become a habit of avoiding the feedback that would actually accelerate your growth.",
      steps: ["Ask your manager for specific, critical feedback on a fixed schedule, not just when it's offered.", "Before avoiding a hard question, name out loud what the delay costs your own learning.", "Practice a simple opener for asking for feedback so it becomes routine, not a big moment."]
    }, {
      area: "Adding Structure to Big Early Decisions",
      insight: "On which projects to take, who to align with, or how to spend your ramp-up time, speed on instinct can cost you months of misdirected effort.",
      steps: ["For decisions with real career impact, build in a deliberate pros/cons pass before committing.", "Write the decision out in plain language before acting on it.", "Ask a mentor or more experienced colleague to sanity-check your biggest early calls."]
    }, {
      area: "Protecting Your Own Learning Capacity",
      insight: "Saying yes to everything to be liked is generous, but it isn't sustainable, and it isn't actually what will make you good at your job.",
      steps: ["Notice the bodily signal that shows up when you're about to over-commit to be helpful.", "Build one recurring boundary \u2014 protected focus time \u2014 and hold it.", "Ask yourself whether saying yes serves your learning, or just your desire to be liked."]
    }, {
      area: "Building Genuine Relationships Without Overextending",
      insight: "Connection doesn't require self-sacrifice \u2014 the best relationships you'll build here can coexist with real boundaries.",
      steps: ["Pick one or two colleagues to invest in deeply rather than trying to befriend everyone at once.", "Notice which relationships give energy back, and which only take it.", "Revisit this roadmap in 3 months and note what actually stuck."]
    }],
    growth: ["Before your next feedback conversation, write down one question you're afraid to ask, and ask it anyway.", "Practice saying 'let me think about that and get back to you' as a complete, valid response.", "Notice the difference between a task that helps you grow and one that just makes you liked.", "Keep a one-line weekly note of a moment you led with process instead of feeling.", "Block time weekly that's just for your own learning, not for helping others."]
  }, {
    key: "heart-leaning",
    range: [150, 199],
    name: "Heart-Leaning \u2014 Warm, Still Learning to Trust the Process",
    color: heartRedDark,
    teaser: "You use both head and heart as you find your footing \u2014 but when they disagree, your read on people usually wins.",
    summary: "You use both head and heart this early in your career, but when they conflict, your read on people usually wins. You're capable of careful, methodical learning, but connection and how something feels tend to carry more weight than pure process.",
    strengths: ["Balanced early decisions that rarely ignore facts or how things feel", "Genuine relationships with new colleagues, with enough self-protection to avoid being taken advantage of", "Good instincts about people and situations, checked not overridden by process"],
    watchouts: ["Under pressure to fit in, the balance can tip further toward people-pleasing than the situation calls for", "May avoid asking necessary 'obvious' questions because they feel embarrassing", "Worth noticing when going along with something is genuine agreement or just wanting to belong"],
    developmentAreas: "You're already integrating both sides more than most new hires \u2014 the refinement now is consistency, especially under the pressure to seem like you've got it figured out, which is exactly when a second, more analytical check matters most.",
    relationships: "Your relationships with new colleagues are warm and reciprocal, and you usually sense early when something's off with the team dynamic \u2014 even if you don't always act on it right away. People experience you as genuine, not performative.",
    work: "You're comfortable with both structured onboarding and reading the room, which makes you effective in ambiguous early situations. Your risk is deferring to how something feels in the specific moments that need more rigor \u2014 understanding a process correctly, clarifying an unclear task.",
    workingStyleTips: ["Name in advance the situations (unclear instructions, technical processes) where you'll always ask a clarifying question, no exceptions.", "When you notice you're avoiding a question because it feels embarrassing, treat that discomfort as a signal to ask anyway.", "Find one more experienced colleague to sanity-check your understanding of anything ambiguous."],
    handlingDifficulty: "You meet early difficulty by feeling it honestly first, then figuring out what to do \u2014 which generally builds trust. Where it goes sideways is under real pressure to seem competent, when a fear of looking unprepared quietly takes the wheel disguised as \u201CI'll figure it out myself.\u201D",
    leadershipImpact: "Your team and manager likely feel genuinely warmly toward you. The risk: they may not realize when you're actually confused or struggling, because you default to seeming like you're keeping up rather than asking for help.",
    cultureFitPrompt: "If your organization runs on fast, independent execution with little hand-holding, your people-first instinct to ask and connect may create friction worth noticing \u2014 is it slowing you down, or actually helping you learn faster than pure independence would?",
    roadmap: [{
      area: "Asking the \u2018Obvious\u2019 Question Anyway",
      insight: "The questions that feel most embarrassing to ask are often the ones that would save you the most time.",
      steps: ["Give yourself permission to ask any question once without judging it as 'obvious.'", "Before staying quiet, ask yourself: would a senior person actually think less of me for asking this?", "Keep a running list of questions and ask them in batches if one-off asking feels harder."]
    }, {
      area: "Recognizing Fear of Looking Unprepared Disguised as Independence",
      insight: "Under pressure to seem competent, avoiding help can masquerade as self-sufficiency.",
      steps: ["Ask, in hard moments: am I avoiding help because I don't need it, or because I'm afraid to ask?", "Track weekly when you later realize you struggled longer than necessary alone.", "Loop in your manager specifically when you notice this pattern."]
    }, {
      area: "Clarifying Instead of Assuming",
      insight: "Assuming you understand an unclear instruction to avoid seeming behind can cost far more time than asking would have.",
      steps: ["Restate instructions back in your own words before starting any ambiguous task.", "Ask a more experienced colleague to sanity-check your understanding before you're deep into the work.", "Give yourself permission to be 'behind' in service of actually getting it right."]
    }, {
      area: "Calibrating When Your Read on a Situation Is Right",
      insight: "You don't yet have a track record of when your early instincts about people or situations are accurate.",
      steps: ["Keep a light log: what you read about a situation, and how it played out.", "Review it monthly, not just after something goes wrong.", "Use the pattern to build confidence in your own read over time."]
    }],
    growth: ["Before assuming you understand an instruction, restate it back and confirm.", "Ask yourself whether staying quiet is confidence, or fear of looking unprepared.", "Keep a short log of moments your gut read on a situation was right, and where it wasn't.", "Once a month, revisit a moment you struggled alone and ask what asking for help would have changed.", "Practice asking one 'obvious' question a week on purpose."]
  }, {
    key: "head-leaning",
    range: [100, 149],
    name: "Head-Leaning \u2014 Careful, Still Warming Up",
    color: headBlueDark,
    teaser: "You use both head and heart as you start out \u2014 but logic usually wins the tie-break.",
    summary: "You use both head and heart early in your career, but logic usually wins the tie-break. You value being prepared, being right, and understanding the process fully. Team sentiment is noticed, but filtered through analysis before you act on it.",
    strengths: ["Clear-headed, well-prepared work, especially on technical or process-heavy tasks", "Reliability \u2014 colleagues trust your output because it's consistent", "Not easily rattled by a chaotic first few weeks"],
    watchouts: ["New relationships can read as reserved, or like you're keeping people at arm's length while you get oriented", "A good instinct about a colleague or situation may get dismissed because it isn't provable yet", "Early frustration that goes unexpressed for too long can surface as disengagement before you've even settled in"],
    developmentAreas: "The work for you isn't becoming less careful \u2014 it's letting the social and emotional side of a new job count as real information, not noise to get through. That starts small: noticing team mood without immediately looking for the process explanation.",
    relationships: "Colleagues generally experience you as competent and reliable, but may take longer to feel close to you, since warmth gets filtered through your analytical process first. You show you're settling in through consistency, not small talk.",
    work: "You're well-suited to roles with clear processes and technical depth, where being right matters more than being warm early on. The same wiring can make you slow to celebrate an early win or connect over a hard week.",
    workingStyleTips: ["In 1:1s with your manager, ask 'how am I actually doing socially, not just on output' as a standing question.", "When you dismiss a read on a colleague because you can't prove it yet, write it down and check back.", "Say yes to one purely social team moment a week, even if it feels unproductive."],
    handlingDifficulty: "Under early difficulty, you default to solving \u2014 quiet, analytical, focused on figuring it out, which works for a lot of onboarding problems. What it doesn't do is process the emotional residue of being new, which tends to surface later as quiet disengagement.",
    leadershipImpact: "Your manager and team trust your output, but may not feel like they know you yet. Over time, this can mean you're seen as competent but replaceable rather than someone people are invested in keeping.",
    cultureFitPrompt: "If your organization explicitly prizes \u201Cculture fit\u201D and relationship-building in its early stages, your results-first default may create a quiet mismatch worth naming \u2014 are you settling in on your own terms, or missing something the culture actually rewards?",
    roadmap: [{
      area: "Letting Social Signals Count as Data",
      insight: "You treat team mood and social cues as noise to get through rather than a legitimate input \u2014 even when they're accurate.",
      steps: ["When you dismiss a social read because you can't prove it, write it down anyway and check back later.", "Before finalizing your sense of a situation, explicitly ask 'how does this feel,' not just 'does this make sense.'", "Practice treating a strong social read as a hypothesis worth testing."]
    }, {
      area: "Making Your Interest in People Visible",
      insight: "People can't feel your investment in them if it never surfaces \u2014 warmth has to be expressed to register.",
      steps: ["Say one appreciative thing to a colleague out loud each week, instead of assuming it's understood.", "Ask a colleague a genuine, non-work question at least once a week.", "Ask someone what they wish they knew about you, and tell them."]
    }, {
      area: "Processing the Emotional Side of Being New",
      insight: "Under difficulty, you solve and move on \u2014 the emotional residue of being new doesn't disappear, it resurfaces later as disengagement.",
      steps: ["Name what you're feeling out loud, even briefly, before moving to solutions.", "After a hard week, ask yourself how it felt, not just whether you got through it.", "Build in real recovery time, not just after visible burnout."]
    }, {
      area: "Building the Muscle of Small Talk and Connection",
      insight: "Connection is a skill like any other \u2014 under-used, it atrophies, and that's reversible with practice.",
      steps: ["Once a week, start one conversation purely for connection, with no work agenda.", "Sit with a moment of social discomfort for a few minutes without rushing to end it.", "Reflect a colleague's feeling back to them before offering a solution, at least once."]
    }],
    growth: ["Once a week, make one small decision purely on how it feels.", "When a colleague shares a problem, try reflecting their feeling back before offering a solution.", "Name your own reaction out loud in a team setting at least once a week.", "After a hard week, ask yourself how it felt, not just whether you got through it.", "Practice sitting with social discomfort for five minutes without rushing to fix it."]
  }, {
    key: "head-dominant",
    range: [50, 99],
    name: "Head-Dominant \u2014 Heads-Down and Analytical",
    color: headBlue,
    teaser: "Logic, competence, and independence are your default setting as the new person \u2014 capable, sometimes distant.",
    summary: "You operate primarily from the head, even this early in your career. Logic, competence, and independence are your default mode, and emotional or social input is often minimized or arrives late. This can look like strong early output from the outside, while you experience the new job as isolating.",
    strengths: ["Composure and clarity even in a confusing or high-pressure first few months", "Objectivity \u2014 your early work is less prone to people-pleasing or overreaction", "Strong follow-through once you understand what's expected"],
    watchouts: ["New relationships may feel one-sided or purely functional, even with good intent", "Suppressed frustration with the ramp-up process tends to leak out as tension or a sudden sharp reaction", "A nagging feeling about the team or the role is real data \u2014 dismissing it entirely removes useful information"],
    developmentAreas: "The growth path here is reconnecting with the social and emotional side of starting a new job as information, not weakness. A nagging sense that something's off with the team or the fit is data your analytical mind hasn't caught up to yet, and it deserves attention.",
    relationships: "Colleagues may read you as composed but hard to get to know. Your investment in doing well is often real but doesn't reliably surface where people can feel it, which can leave them unsure how to read you.",
    work: "You're a strong asset for technical, process-heavy, or high-focus early work. Emotion that goes unprocessed during onboarding doesn't disappear \u2014 it resurfaces as isolation or a sudden decision to leave that surprises everyone but you.",
    workingStyleTips: ["Schedule genuine unstructured time with new colleagues \u2014 connection without an agenda builds relationships pure competence doesn't.", "When asking for help, add one sentence about how you're feeling, not just what you need.", "Before a stressful first presentation or meeting, check your own physical stress signals as a real input."],
    handlingDifficulty: "You handle early difficulty by controlling what you can and figuring out the rest analytically, which makes you genuinely capable even when confused. The cost shows up later: unprocessed stress about fitting in doesn't disappear, it resurfaces as isolation or burnout that seems to come from nowhere.",
    leadershipImpact: "Your manager and team likely respect your competence, but may not experience you as approachable this early. The specific risk: struggles get hidden longer than they should, because you'd rather solve it yourself than have the feeling.",
    cultureFitPrompt: "If your organization is genuinely relationship- and culture-driven, your heads-down default may be increasingly out of step with what actually gets rewarded \u2014 worth an honest look at whether connecting more would actually serve you here.",
    roadmap: [{
      area: "Treating Social Signals as Information",
      insight: "A nagging sense that something's off with the team or the role is data your analytical mind hasn't caught up to yet.",
      steps: ["Before a high-stakes early meeting, check in on your own physical state as a real input.", "When you notice a social stress signal, pause and name what might be going on before acting.", "Keep a simple log of social signals and what they later turned out to mean."]
    }, {
      area: "Making Your Investment Visible",
      insight: "Your investment in doing well is often genuine but doesn't reliably reach the people around you, which leaves them unsure how to read you.",
      steps: ["Schedule genuine unstructured time with colleagues, with no agenda.", "Say the thing you appreciate about a colleague out loud instead of assuming it's understood.", "Ask directly what a colleague wishes they knew about you \u2014 then share it."]
    }, {
      area: "Preventing the Delayed Cost of Unprocessed Onboarding Stress",
      insight: "Emotion that never gets processed during a hard ramp-up doesn't vanish \u2014 it resurfaces as isolation or a sudden decision to leave.",
      steps: ["Build a small, regular check-in practice with yourself beyond task completion.", "Ask one open, non-task question of your manager in every 1:1: how do you think I'm actually doing?", "Notice patterns: does tension spike after specific kinds of unprocessed situations?"]
    }, {
      area: "Giving Your Read on the Team a Real Vote",
      insight: "Dismissing a gut read on the team or the role entirely removes a genuine source of information your analytical process doesn't have access to.",
      steps: ["Before dismissing a read on the team, ask what evidence would need to exist for you to take it seriously.", "Write down instincts about the role or the fit you've overridden and revisit whether they were right.", "Treat a strong, repeated read as equivalent in weight to a moderate amount of data."]
    }],
    growth: ["Build in unstructured time with new colleagues, with no agenda or problem to solve.", "When you notice a physical stress signal, pause and name what you're feeling before doing anything else.", "Ask a colleague what they wish they knew about you, and take it seriously.", "Once a day, name one feeling about your new job in one word, without analyzing why.", "Before dismissing a read on the team or the role, ask what you'd need to see to take it seriously."]
  }],
  newJoinerSubscaleReads = {
    DM: {
      whyItMatters: "How you make early decisions \u2014 even small ones \u2014 shapes how quickly you build credibility and how much autonomy you're given going forward.",
      high: {
        read: "Early decisions come from a felt sense of rightness first, with guidance used to sanity-check rather than lead.",
        tip: "Keep trusting your read, but check in with a mentor before decisions with real stakes while you're still building context."
      },
      mid: {
        read: "You draw on both instinct and guidance fairly evenly when deciding early on.",
        tip: "Notice which mode you default to when you're unsure \u2014 that's usually your true default."
      },
      low: {
        read: "You won't act until you've checked with someone else, even when it's really a read you could trust.",
        tip: "For your next low-stakes call, decide on instinct first, then check it after."
      }
    },
    RC: {
      whyItMatters: "The relationships you build in your first months set the tone for how supported \u2014 or isolated \u2014 the rest of your tenure feels.",
      high: {
        read: "You extend trust to new colleagues based on how they make you feel, not just their title.",
        tip: "Keep trusting your read, but give yourself permission to reassess as you learn more."
      },
      mid: {
        read: "You balance instinct with observation when deciding who to trust early on.",
        tip: "Notice if you extend trust faster to people similar to you \u2014 worth checking for bias."
      },
      low: {
        read: "You evaluate new colleagues mainly by usefulness, keeping emotional distance.",
        tip: "Pick one colleague this month and have a real, non-agenda conversation."
      }
    },
    EA: {
      whyItMatters: "Starting a new job is emotionally taxing whether you notice it or not \u2014 awareness is what lets you manage that load instead of being blindsided by it.",
      high: {
        read: "You notice your own nervousness or excitement in the moment rather than pushing it aside.",
        tip: "Keep naming it \u2014 it's a strength that will serve you well beyond onboarding."
      },
      mid: {
        read: "You notice your reactions sometimes, though busy weeks can bury them.",
        tip: "Build a 2-minute end-of-day check-in during your first few months especially."
      },
      low: {
        read: "You intellectualize your reactions to a hard week rather than actually feeling them.",
        tip: "Before your next 1:1, pause and name what you're actually feeling walking in."
      }
    },
    CN: {
      whyItMatters: "How you handle early feedback and disagreement shapes whether people see you as coachable or defensive \u2014 a reputation that's hard to shift later.",
      high: {
        read: "You prioritize understanding feedback before defending your work.",
        tip: "Keep that openness \u2014 it's one of the fastest ways to build trust as a new hire."
      },
      mid: {
        read: "You can take feedback well or defend your work depending on how it's delivered.",
        tip: "Notice your pattern with specific people \u2014 do you get defensive with some more than others?"
      },
      low: {
        read: "Defending your work tends to outweigh understanding the feedback.",
        tip: "In your next feedback conversation, ask a clarifying question before responding."
      }
    },
    TI: {
      whyItMatters: "Your instinct about people and situations is real information, even without much tenure \u2014 dismissing it just because you're new costs you good calls.",
      high: {
        read: "You trust your read on a colleague or situation, even without much history yet.",
        tip: "Keep honoring your read, and note when it's confirmed to build your own confidence."
      },
      mid: {
        read: "You weigh instinct alongside what others tell you, giving neither automatic priority.",
        tip: "Notice when you override your read because you assume you don't have enough experience yet."
      },
      low: {
        read: "You trust what more experienced people say over your own read, even when your read has been right.",
        tip: "Next time a read shows up, write it down before dismissing it \u2014 check back later."
      }
    },
    EC: {
      whyItMatters: "Empathy for new colleagues \u2014 even ones you barely know \u2014 is what turns a group of strangers into a team you actually want to work with.",
      high: {
        read: "A new colleague's stress genuinely affects you, even though you just met them.",
        tip: "Keep letting it in, and build recovery time so it doesn't tip into overextending yourself early."
      },
      mid: {
        read: "You access empathy for new colleagues, though it takes more effort with some than others.",
        tip: "Notice who's easiest to empathize with, and extend that effort further."
      },
      low: {
        read: "You understand new colleagues' struggles intellectually more than you feel them.",
        tip: "In your next conversation with a struggling colleague, resist problem-solving first \u2014 just listen."
      }
    },
    AE: {
      whyItMatters: "The gap between how you actually feel and the \u201Cnew hire performance\u201D you put on costs energy daily, and people usually sense it even when they can't name it.",
      high: {
        read: "You show up as yourself, even when it's not the safest first-impression move.",
        tip: "Keep being real \u2014 authenticity early on builds trust faster than a polished performance."
      },
      mid: {
        read: "You're authentic in some early contexts, more guarded in others.",
        tip: "Pick your most guarded context and experiment with one honest disclosure."
      },
      low: {
        read: "You manage what you reveal to control your first impression.",
        tip: "Practice one small act of visible authenticity a week."
      }
    },
    SP: {
      whyItMatters: "How you handle the pressure of being new sets a pattern for how you'll handle pressure for the rest of your career.",
      high: {
        read: "When you feel out of your depth, you check in with how you feel and let that guide your next step.",
        tip: "Keep that instinct, and add one grounding practice for your hardest weeks."
      },
      mid: {
        read: "Your stress response shifts depending on the type of pressure.",
        tip: "Notice what kind of pressure makes you shut down vs. reach out."
      },
      low: {
        read: "Under pressure, you shut down and try to figure it out alone.",
        tip: "Next hard week, tell one colleague or mentor you're struggling \u2014 no solving required."
      }
    },
    VP: {
      whyItMatters: "What you're actually optimizing for in your first year \u2014 looking good or actually learning \u2014 quietly shapes the trajectory of your whole career.",
      high: {
        read: "Learning and genuine connection matter more to you right now than looking impressive fast.",
        tip: "Keep protecting that, and trust that it compounds even when it's not immediately visible."
      },
      mid: {
        read: "You hold both learning and looking capable as real priorities, weighing them situationally.",
        tip: "Notice which one wins when you're anxious \u2014 that's your truer default."
      },
      low: {
        read: "Looking capable matters more to you than how the learning process feels.",
        tip: "Before your next stretch task, ask what you'd choose if no one would ever know how it went."
      }
    },
    CS: {
      whyItMatters: "How you communicate as the new person determines whether people invest in you early, or wait to see if you're worth the effort.",
      high: {
        read: "You communicate with warmth and honesty, even about things you don't understand yet.",
        tip: "Keep the openness \u2014 it invites people to help you faster."
      },
      mid: {
        read: "You adjust communication style depending on the person and stakes.",
        tip: "Notice which relationships get your warmer register and which get the guarded one."
      },
      low: {
        read: "You default to facts and questions, and feelings rarely enter the conversation.",
        tip: "In your next check-in, add one sentence of feeling before the facts."
      }
    }
  },
  upgradeReasons = {
    personal: [{
      title: "3\u20135 Personal Development Areas",
      detail: "Not generic advice \u2014 the specific patterns showing up in your own answers, each with a concrete roadmap."
    }, {
      title: "Full Subscale Radar & Breakdown",
      detail: "See exactly where your head overrides your heart, across all 10 areas of life, not just the headline number."
    }, {
      title: "How You Handle Difficulty",
      detail: "Your real coping pattern under stress, including what it costs you and how to work with it."
    }, {
      title: "A Working-Style Improvement Plan",
      detail: "Specific, practical tips for how this profile shows up at work \u2014 and what to actually do about it."
    }, {
      title: "Your Sharpest Edge & Growth Edge",
      detail: "The one subscale where you're strongest, and the one quietly holding you back the most."
    }, {
      title: "A Beautifully Designed, Shareable Report",
      detail: "A polished, multi-page report you can save, print, or revisit \u2014 built to actually be useful, not just interesting."
    }],
    manager: [{
      title: "3\u20135 Leadership Development Areas",
      detail: "The specific patterns showing up in how you manage, each with a concrete roadmap."
    }, {
      title: "Leadership Impact Section",
      detail: "What it's actually like to report to you \u2014 not how you see yourself, but how your team likely experiences you."
    }, {
      title: "Culture Fit Reflection",
      detail: "Whether your natural management style is working with your organization's culture, or quietly against it."
    }, {
      title: "Full Subscale Radar & Breakdown",
      detail: "See exactly where your head overrides your heart across 10 areas of management, not just the headline number."
    }, {
      title: "A Management Style Improvement Plan",
      detail: "Specific, practical tips for how this profile shows up in your management \u2014 and what to do about it."
    }, {
      title: "A Beautifully Designed, Shareable Report",
      detail: "A polished, multi-page report you can save, print, or bring into a development conversation."
    }],
    executive: [{
      title: "3\u20135 Executive Development Areas",
      detail: "The specific patterns showing up in how you lead at scale, each with a concrete roadmap."
    }, {
      title: "Leadership Impact Section",
      detail: "What it's actually like to be led by you \u2014 not how you see yourself, but how your leadership team and board likely experience you."
    }, {
      title: "Culture Fit Reflection",
      detail: "Whether your natural leadership style is working with your organization's culture and board, or quietly against it."
    }, {
      title: "Full Subscale Radar & Breakdown",
      detail: "See exactly where your head overrides your heart across 10 areas of executive leadership, not just the headline number."
    }, {
      title: "An Executive Style Improvement Plan",
      detail: "Specific, practical tips for how this profile shows up at the top \u2014 and what to do about it."
    }, {
      title: "A Beautifully Designed, Shareable Report",
      detail: "A polished, multi-page report you can save, print, or bring into a board or coaching conversation."
    }],
    newjoiner: [{
      title: "3\u20135 Early-Career Development Areas",
      detail: "The specific patterns showing up in your first months, each with a concrete roadmap."
    }, {
      title: "\u201CHow You're Coming Across\u201D Section",
      detail: "What it's actually like for your manager and new team to work with you \u2014 not how you see yourself."
    }, {
      title: "Culture Fit Reflection",
      detail: "Whether your natural style is working with your new organization's culture, or quietly against it."
    }, {
      title: "Full Subscale Radar & Breakdown",
      detail: "See exactly where your head overrides your heart across 10 areas of starting a new job, not just the headline number."
    }, {
      title: "A Working Style Improvement Plan",
      detail: "Specific, practical tips for how this profile shows up as you ramp up \u2014 and what to do about it."
    }, {
      title: "A Beautifully Designed, Shareable Report",
      detail: "A polished, multi-page report you can save, print, or bring into a check-in with your manager."
    }]
  };
function flattenItems(e) {
  return e.flatMap((t, a) => t.items.map(n => Object.assign({}, n, {
    subIndex: a
  })));
}
function createProfileLookup(e) {
  return t => e.find(a => t >= a.range[0] && t <= a.range[1]) || e[1];
}
var assessmentTracks = {
  personal: {
    key: "personal",
    label: "Personal",
    available: true,
    tagline: "For anyone who wants to understand how they lead their own life.",
    subscales: personalSubscales,
    profiles: personalProfiles,
    subscaleReads: personalSubscaleReads,
    upgradeReasons: upgradeReasons.personal,
    hasLeadershipImpact: false,
    hasCultureFit: false,
    priceLabel: "$4.99",
    stripePaymentLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_PERSONAL_LINK"
  },
  newjoiner: {
    key: "newjoiner",
    label: "New Joiner",
    available: true,
    tagline: "For new joinees and anyone in their first 1\u20132 years of work \u2014 not managing anyone yet.",
    subscales: newJoinerSubscales,
    profiles: newJoinerProfiles,
    subscaleReads: newJoinerSubscaleReads,
    upgradeReasons: upgradeReasons.newjoiner,
    hasLeadershipImpact: true,
    hasCultureFit: true,
    leadershipImpactLabel: "How You're Coming Across",
    cultureFitLabel: "Culture Fit Reflection",
    priceLabel: "$19",
    stripePaymentLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_NEWJOINER_LINK"
  },
  manager: {
    key: "manager",
    label: "Manager",
    available: true,
    tagline: "For people managers \u2014 how you lead your team, not just yourself.",
    subscales: managerSubscales,
    profiles: managerProfiles,
    subscaleReads: managerSubscaleReads,
    upgradeReasons: upgradeReasons.manager,
    hasLeadershipImpact: true,
    hasCultureFit: true,
    leadershipImpactLabel: "Leadership Impact",
    cultureFitLabel: "Culture Fit Reflection",
    priceLabel: "$29",
    stripePaymentLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_MANAGER_LINK"
  },
  executive: {
    key: "executive",
    label: "Executive",
    available: true,
    tagline: "For senior leaders shaping strategy and culture at scale.",
    subscales: executiveSubscales,
    profiles: executiveProfiles,
    subscaleReads: executiveSubscaleReads,
    upgradeReasons: upgradeReasons.executive,
    hasLeadershipImpact: true,
    hasCultureFit: true,
    leadershipImpactLabel: "Leadership Impact",
    cultureFitLabel: "Culture Fit Reflection",
    priceLabel: "$99",
    stripePaymentLink: "https://buy.stripe.com/REPLACE_WITH_YOUR_EXECUTIVE_LINK"
  }
};
Object.values(assessmentTracks).forEach(e => {
  e.available && (e.allItems = flattenItems(e.subscales), e.getProfileFn = createProfileLookup(e.profiles));
});
export { navy, canvas, white, borderColor, heartRed, heartRedDark, headBlue, headBlueDark, gold, bodyText, mutedText, contactEmail, companyName, companyUrl, ageRanges, genderOptions, workRoleOptions, industryOptions, countryOptions, workPurposeOptions, tenureOptions, roleOptions, departmentOptions, levelOptions, personalSituationOptions, personalFocusOptions, personalPurposeOptions, lifeChapterOptions, intakeConfigurations, getIntakeConfiguration, personalSubscales, answerChoices, personalProfiles, personalSubscaleReads, managerSubscales, managerProfiles, managerSubscaleReads, pendingUnlockStorageKey, savePendingUnlock, loadPendingUnlock, clearPendingUnlock, getScoreBand, scoreBands, executiveSubscales, executiveProfiles, executiveSubscaleReads, newJoinerSubscales, newJoinerProfiles, newJoinerSubscaleReads, upgradeReasons, flattenItems, createProfileLookup, assessmentTracks };
