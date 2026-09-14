export type AreaSection = {
  heading?: string;
  body: string[];
};

export type Area = {
  slug: string;
  name: string;
  /** Short card description on the services index. */
  blurb: string;
  /** Bold opening line on the detail page. */
  tagline: string;
  sections: AreaSection[];
  /** Arrow-separated journey line. */
  cycle?: string;
  /** Highlighted closing line. */
  closing?: string;
  disclaimer?: string;
  /** Which primary action the page offers. */
  cta: "self" | "decision" | "calm";
  /** Which column the service belongs to on the services index. */
  audience: "individual" | "corporate";
};

export const AREAS: Area[] = [
  {
    slug: "individual-development",
    audience: "individual",
    name: "Individual Development",
    blurb:
      "Build deeper self-knowledge with InwardWise Self, then bring that understanding into the decisions that shape your life.",
    tagline:
      "Build deeper self-knowledge with InwardWise Self, then bring that understanding into the decisions that shape your life.",
    cta: "self",
    sections: [
      {
        body: [
          "We spend much of our lives trying to understand other people, while often spending surprisingly little structured time understanding ourselves.",
          "Even our closest relationships have limits. Friends, family members, partners, and colleagues have their own lives, pressures, perceptions, and experiences. They see parts of us, but no other person experiences our thoughts, fears, aspirations, memories, conflicts, and changing priorities exactly as we do.",
          "Yet understanding ourselves isn't easy either. We cannot simply step outside ourselves and observe our lives objectively. InwardWise Self is designed to help.",
        ],
      },
      {
        heading: "An AI-supported journey inward",
        body: [
          "Rather than using AI primarily to search the outside world, InwardWise Self uses it to help you explore your inner world.",
          "Over time, you provide information about yourself across five dimensions developed by InwardWise. These dimensions draw upon the founder's broader study of scientific literature, psychology, philosophy, human behavior, and observational approaches. The methodology is an integrated framework rather than one derived from a single research paper or school of thought.",
          "As you build your InwardWise Self, AI can use what you have shared to help you recognize patterns, examine conflicting objectives, question assumptions, and explore how different aspects of who you are may be influencing the choices you make.",
          "The objective isn't for AI to define you. It is to help you understand yourself.",
        ],
      },
      {
        heading: "A living representation of your inner self",
        body: [
          "Most digital profiles represent us to other people. They show where we've traveled, what we've accomplished, who we know, what we like, and what we want the outside world to see. InwardWise Self turns that idea inward.",
          "Think of it as a private profile of your inner world, one designed not for followers, likes, or social projection, but for reflection and personal development.",
          "As your experiences, priorities, relationships, environment, and stage of life change, your understanding of yourself can evolve with them. InwardWise Self is intended to develop alongside you rather than permanently defining you based on who you were at one moment in time.",
        ],
      },
      {
        heading: "Understand before you change",
        body: [
          "Human beings continuously adapt to their environments and experiences. Personal development can therefore begin with a deceptively simple question: what exactly about myself am I trying to develop, and why?",
          "Before trying to become a \u201cbetter version\u201d of yourself, InwardWise Self can help you explore what better actually means to you. Is the change driven by your own values and objectives, or by comparison, social expectations, fear, status, past experiences, or someone else's definition of success?",
          "The goal isn't endless self-improvement or becoming someone else. It is developing enough self-awareness to recognize what serves you, what may be holding you back, what you want to preserve, and where adaptation may help you live more consistently with your deeper objectives.",
        ],
      },
      {
        heading: "From self-knowledge to better decisions",
        body: [
          "When facing an important question, InwardWise Self can examine the situation in the context of what you have previously shared about yourself. It can help surface relevant patterns, preferences, fears, motivations, experiences, and potential biases that you may want to consider.",
          "That understanding can then work alongside InwardWise Decision, where you can examine the objective itself, challenge assumptions, consider alternatives and consequences, and make a more deliberate decision.",
          "And because personal well-being isn't only inward-facing, InwardWise Connect can help translate greater self-understanding into meaningful connections with other people and communities.",
        ],
      },
    ],
    cycle:
      "Know yourself → Understand your patterns → Question your assumptions → Adapt where needed → Decide with greater clarity → Connect more meaningfully → Keep learning about yourself",
    closing: "You don't need AI to tell you who you are. Use AI to help you discover it for yourself.",
    disclaimer:
      "InwardWise supports self-reflection, personal development, and decision-making. It is not intended to diagnose psychological conditions or replace professional medical or mental health care.",
  },
  {
    slug: "individual-wellbeing",
    audience: "individual",
    name: "Individual Wellbeing",
    blurb:
      "Create moments of calm, reflection, and reinforcement that are personal to you.",
    tagline: "Create moments of calm, reflection, and reinforcement that are personal to you.",
    cta: "calm",
    sections: [
      {
        body: [
          "Individual wellbeing involves both mind and body. Our thoughts can influence how we experience stress, relationships, setbacks, and everyday life, while our physical state can influence our emotions, attention, and ability to think clearly.",
          "Yet modern life gives us remarkably little time to become quiet enough to observe what is happening within us.",
          "Practices such as meditation, reflection, breathing exercises, gratitude, and intentional reminders can create that space. Rather than continuously reacting to the outside world, they give us an opportunity to observe our thoughts, reduce mental noise, and deliberately reinforce perspectives and behaviors we want to carry into everyday life.",
          "But the same message isn't meaningful to everyone.",
        ],
      },
      {
        heading: "Personal, not generic",
        body: [
          "InwardWise Self helps develop a deeper understanding of you, your experiences, patterns, concerns, motivations, values, and current circumstances. That understanding can help identify the kinds of reflection and reinforcement that may be most relevant to you at a particular point in your life.",
          "InwardWise Calm turns those insights into personalized wellbeing practices. It can help create guided periods of meditation, reflection, breathing, gratitude, self-compassion, forgiveness, or other constructive reminders based on what you are experiencing and what you have learned about yourself.",
          "Rather than encountering a generic message such as \u201cbe grateful\u201d or \u201clet it go\u201d, the objective is to make reflection personally meaningful: What are you grateful for? What are you struggling to release? What are you repeatedly worrying about? What perspective do you want to remember when that situation arises again?",
        ],
      },
      {
        heading: "Repetition that adapts with you",
        body: [
          "Repetition can also help turn an occasional insight into something we remember when it matters. InwardWise Calm can therefore help reinforce constructive messages and practices over time, while adapting them as your circumstances and understanding of yourself evolve.",
          "For thousands of years, religious and contemplative traditions have used prayer, meditation, repetition, ritual, silence, gratitude, and reflection as ways of cultivating inner wellbeing. InwardWise does not seek to replace those traditions or prescribe a particular belief system. Instead, it provides a secular, AI-supported approach that can complement an individual's existing beliefs and practices.",
          "Combined with InwardWise Decision, these moments of calm and self-awareness can also serve another purpose: helping you approach important decisions with greater clarity rather than making them at the height of fear, anger, stress, or emotional reaction.",
        ],
      },
    ],
    cycle:
      "Understand yourself → Create calm → Reflect → Reinforce what matters → Decide with greater clarity → Build greater wellbeing",
    closing: "Sometimes changing your life begins by creating enough quiet to understand it.",
    disclaimer:
      "InwardWise supports reflection, wellbeing, and decision-making. It is not intended to diagnose, treat, cure, or prevent medical or mental health conditions and is not a substitute for professional medical or mental health care.",
  },
  {
    slug: "habits",
    audience: "individual",
    name: "Habits",
    blurb:
      "Structured, private, and non-judgmental support for the patterns you understand, but still find difficult to change.",
    tagline:
      "Structured, private, and non-judgmental support for the patterns you understand, but still find difficult to change.",
    cta: "self",
    sections: [
      {
        body: [
          "Most of us have behaviors, habits, fears, or impulses that repeatedly work against what we genuinely want for ourselves.",
          "We call them Habits, not because there is something inherently wrong with us, but because sometimes a part of our own behavior can conflict with our larger objectives.",
          "They may appear relatively ordinary: procrastination, avoiding difficult conversations, excessive screen time, unhealthy eating habits, impulsive spending, fear-driven decisions, or repeatedly abandoning something we intended to finish. Other challenges can be far more serious, including problematic alcohol or drug use, compulsive behaviors, or other patterns that may require professional support.",
          "What makes a habit like this particularly difficult is that knowing a behavior is harmful doesn't necessarily make it disappear. It may remain dormant for months and return during periods of stress. We may rationalize it, hide it from others, feel ashamed of it, or repeatedly promise ourselves that this time will be different.",
          "InwardWise approaches these patterns through understanding rather than judgment.",
        ],
      },
      {
        heading: "InwardWise Self",
        body: [
          "InwardWise Self helps you explore what may surround a recurring behavior. When does it happen? What emotions, environments, relationships, fears, rewards, or circumstances tend to precede it? What does the behavior provide in the short term, and what does it cost you over the longer term?",
          "The objective is not simply to label the behavior as bad. It is to understand the conflict between what you want in the moment and what you want for your life.",
        ],
      },
      {
        heading: "InwardWise Decision",
        body: [
          "InwardWise Decision can help when that conflict becomes a choice. By bringing your broader objectives, previously identified patterns, consequences, and alternatives into the decision process, it can help create greater distance between an immediate impulse and an action you may later regret.",
        ],
      },
      {
        heading: "InwardWise Calm and Connect",
        body: [
          "InwardWise Calm can support moments when stress, fear, frustration, or other emotional pressures make recurring patterns harder to manage. Personalized reflection, calming practices, and constructive reminders can help reinforce the objectives you have already established for yourself.",
          "And InwardWise Connect can help address another powerful part of change: not having to face difficult patterns entirely alone. Where appropriate, connection with people facing similar challenges can provide understanding, perspective, encouragement, and accountability.",
        ],
      },
    ],
    cycle: "Recognize → Understand → Anticipate → Pause → Choose → Reinforce → Learn",
    closing:
      "It is to help you understand what repeatedly works against you, so it has less power over the life you are trying to build.",
    disclaimer:
      "Some recurring behaviors, including substance-use disorders and other addictions, can involve serious medical or mental health risks. InwardWise can complement self-reflection and support, but it is not a substitute for diagnosis, treatment, therapy, or other professional care.",
  },
  {
    slug: "career",
    audience: "individual",
    name: "Career",
    blurb: "Don't just build a résumé. Build a working life that fits who you are.",
    tagline: "Don't just build a résumé. Build a working life that fits who you are.",
    cta: "decision",
    sections: [
      {
        body: [
          "A career is much more than a sequence of jobs, promotions, salaries, and titles. It can occupy an enormous portion of adult life and influence where you live, who you meet, your financial security, your family, your health, your identity, and how you spend many thousands of hours of your life.",
          "Yet many career decisions are made primarily using external definitions of success: compensation, prestige, job title, promotions, employer reputation, educational credentials, or what family and society consider a successful profession. Those things can matter. But they don't necessarily tell you whether a career fits you.",
          "Your natural abilities, interests, personality, motivations, desired lifestyle, tolerance for risk, financial needs, relationships, ambitions, and definition of accomplishment all influence whether a career that looks successful from the outside feels fulfilling from the inside.",
        ],
      },
      {
        heading: "Self-knowledge at the decision points",
        body: [
          "InwardWise Self helps you develop a deeper and evolving understanding of those dimensions. Over time, it can help you explore your strengths, motivations, interests, fears, recurring patterns, priorities, and aspirations, and recognize how they change as you move through different stages of life.",
          "InwardWise Decision can bring what you've learned about yourself into questions such as: Should I accept this promotion? Change careers? Start a company? Pursue another degree? Relocate? Take more risk? Choose greater compensation or greater freedom? Stay and develop, or recognize that it is time to move on?",
          "Instead of immediately answering the question in front of you, InwardWise helps you examine the larger objective behind it: what are you actually trying to achieve through your career?",
          "InwardWise Connect can complement that process by helping you build relationships with people who share professional interests, experiences, or career challenges. And InwardWise Calm can help during periods of career uncertainty, rejection, workplace stress, or transition, where emotional pressure can interfere with clear thinking.",
          "A successful career isn't necessarily one that continuously moves upward. Different stages of life may call for growth, learning, leadership, entrepreneurship, financial security, flexibility, contribution, family time, or something entirely different.",
        ],
      },
    ],
    cycle:
      "Know yourself → Define what success means to you → Explore your options → Make deliberate decisions → Adapt as you change → Build a fulfilling working life",
    closing: "Your career is part of your life. Design it accordingly.",
  },
  {
    slug: "family",
    audience: "individual",
    name: "Family",
    blurb: "When the relationship matters deeply, the decision deserves deeper thought.",
    tagline: "When the relationship matters deeply, the decision deserves deeper thought.",
    cta: "decision",
    sections: [
      {
        body: [
          "Families are among our greatest sources of connection, identity, and support. They can also produce some of our most emotionally difficult decisions.",
          "Every family develops its own personalities, expectations, traditions, roles, and power dynamics. Some people may be dominant and outspoken, while others accommodate, withdraw, or avoid conflict. Over many years, these patterns can become so familiar that we may not recognize how strongly they influence our behavior and decisions.",
          "Add love, loyalty, obligation, disappointment, fear, anger, guilt, and memories from the past, and making an objective family decision becomes extraordinarily difficult. The stakes can also be high. Decisions involving spouses, children, parents, siblings, and extended family can affect relationships for years. Some words, actions, and decisions cannot easily be reversed.",
        ],
      },
      {
        heading: "Start inward, then decide",
        body: [
          "InwardWise Self helps you begin by looking inward. What are you actually feeling? Why does this particular situation affect you so strongly? Are you responding to what is happening today, or to years of accumulated experiences? Are love, guilt, obligation, fear, ego, resentment, cultural expectations, or family conditioning influencing what you believe you must do?",
          "InwardWise Decision then helps you examine the decision itself. Rather than moving directly from emotion to action, it helps separate the situation from the underlying objective, consider the needs of the people involved, question assumptions, examine alternatives, and think about longer-term consequences.",
          "InwardWise Calm can provide personalized reflection and calming practices when emotions are making it particularly difficult to think clearly or communicate constructively. And InwardWise Connect can help reduce the isolation that sometimes accompanies difficult family circumstances by creating opportunities for appropriate connection with others navigating similar life experiences.",
          "The objective isn't for AI to tell you how to manage your family. It is to help you understand yourself, your relationships, your objectives, and the consequences of your choices before making decisions that may affect the people who matter most.",
        ],
      },
    ],
    cycle:
      "Understand yourself → Understand the relationship → Separate emotion from objective → Consider consequences → Decide with greater clarity",
    closing: "When you can't undo a decision easily, take the time to understand why you're making it.",
  },
  {
    slug: "relationships",
    audience: "individual",
    name: "Relationships",
    blurb: "When emotions are strongest, the decisions you make can matter the most.",
    tagline: "When emotions are strongest, the decisions you make can matter the most.",
    cta: "decision",
    sections: [
      {
        body: [
          "Relationships can be among the most meaningful parts of our lives, and among the most emotionally difficult to navigate when things begin to go wrong.",
          "Disagreement can become resentment. Resentment can change communication. A single event can bring years of unresolved experiences back into the present. Fear of losing the relationship can compete with anger, disappointment, loneliness, or the desire to leave it.",
          "During these periods, it can become difficult to separate what happened, how you feel about it, what you want from the other person, and what you actually want for the relationship.",
          "InwardWise is not designed to replace marriage counselors, couples therapists, or mental health professionals. Instead, it can provide a private space for self-reflection and structured thinking, particularly during periods when you are trying to understand yourself, the relationship, and the decisions in front of you.",
        ],
      },
      {
        heading: "Understand, calm, then decide",
        body: [
          "InwardWise Self helps you look inward before focusing entirely on the other person. Why does a particular behavior affect you so strongly? What expectations are you bringing into the relationship? Are past experiences influencing today's reactions? What do you need from the relationship, and what might the other person need from you?",
          "InwardWise Calm can help when emotions become overwhelming. Personalized reflection, calming practices, and constructive reminders can create some distance between an emotional reaction and the action that follows it.",
          "Then InwardWise Decision helps you think through consequential choices more deliberately. Rather than immediately asking \u201cShould I stay or leave?\u201d or \u201cWho is right?\u201d, it helps examine the deeper questions: What is my real objective? What outcomes could I accept? What assumptions am I making? What am I afraid of? What depends on the other person changing? What are the consequences of each path?",
          "InwardWise Connect can also help reduce the isolation that often accompanies relationship difficulties by creating opportunities, where appropriate, to connect with others navigating similar life experiences.",
        ],
      },
    ],
    cycle:
      "Understand yourself → Calm the emotion → Understand the relationship → Clarify what you want → Consider the consequences → Decide with greater clarity",
    closing:
      "Before deciding the future of a relationship, understand what is happening within you and between you.",
    disclaimer:
      "InwardWise supports self-reflection, wellbeing, connection, and structured decision-making. It is not couples therapy or mental health treatment and is not a substitute for qualified professional care. Situations involving abuse, threats, or immediate safety concerns require appropriate professional or emergency support.",
  },
  {
    slug: "organizational-change",
    audience: "corporate",
    name: "Organizational & Systems Change",
    blurb:
      "Changing an organization requires more than changing its structure. Understand the forces that keep the existing system in place.",
    tagline:
      "Changing an organization requires more than changing its structure. You have to understand the forces that keep the existing system in place.",
    cta: "decision",
    sections: [
      {
        body: [
          "Much of modern life operates through large systems, companies, governments, institutions, universities, healthcare organizations, nonprofits, and other complex organizational structures. Creating meaningful change within these systems can be extraordinarily difficult.",
          "The larger the organization, the more interconnected its decisions become. A change intended to solve one problem can create several others. People adapt to new rules, incentives produce unexpected behavior, established interests resist disruption, and informal influence can sometimes matter more than the organizational chart.",
          "Successful transformation therefore requires more than a new strategy. It requires understanding what the organization is trying to accomplish, what currently prevents it from doing so, and what forces will determine whether change actually takes hold.",
        ],
      },
      {
        heading: "Clarity of objective",
        body: [
          "Before redesigning the organization, clarify its underlying purpose. What is the organization actually trying to accomplish, not simply what does it currently do? InwardWise Decision helps leaders question existing assumptions, distinguish inherited practices from true objectives, and define the broader boundary within which change needs to occur.",
        ],
      },
      {
        heading: "Foresight",
        body: [
          "Large-system decisions create consequences that may emerge months or years later. Leaders need to consider not only the immediate result but also second- and third-order effects: What else changes if we do this? Who adapts? What new incentives are created? What unintended consequences could follow? InwardWise Decision can help structure this analysis before the organization commits itself to a difficult-to-reverse path.",
        ],
      },
      {
        heading: "Money flows",
        body: [
          "Budgets reveal priorities. Compensation creates incentives. Investment decisions determine what grows and what disappears. Understanding where money originates, where it moves, who controls it, and what behaviors it rewards can reveal how an organization actually functions, sometimes more clearly than its stated strategy.",
        ],
      },
      {
        heading: "Power flows",
        body: [
          "Power isn't always visible on an organizational chart. Decision rights, information access, relationships, expertise, reputation, gatekeepers, political influence, and informal networks can all determine whether change succeeds or quietly stalls.",
          "InwardWise Self adds another dimension by helping decision-makers examine how their own ambition, status, fear, loyalty, ego, attachment to previous decisions, or desire to preserve influence may affect their judgment.",
        ],
      },
      {
        heading: "Human behavior",
        body: [
          "Organizations ultimately consist of people. Psychology, social behavior, identity, group dynamics, incentives, trust, fear, and resistance to change can matter as much as organizational structure. A theoretically perfect transformation can fail if the people expected to implement it cannot understand, accept, or sustain it.",
          "InwardWise Connect can help bring perspectives across organizational boundaries into the process, allowing leaders to hear experiences and viewpoints that may otherwise remain separated by hierarchy, function, or status.",
        ],
      },
      {
        heading: "From organizational change to systems change",
        body: [
          "Organizations that attempt transformation without examining objectives, money, power, incentives, and human behavior together can end up changing their language while preserving the system that created the original problem.",
          "First, understand the situation. Then clarify the true objective, challenge assumptions and biases, examine alternative outcomes, broaden the objective, and define a sufficiently wide decision boundary. Only then work inward toward implementation.",
        ],
      },
    ],
    cycle:
      "Clarify the objective → Understand the system → Map money and power → Anticipate consequences → Understand human behavior → Define the boundary → Execute change",
    closing:
      "Don't just redesign the organization. Understand the system that makes it behave the way it does.",
  },
  {
    slug: "health-wellness-research",
    audience: "corporate",
    name: "Health & Wellness Research",
    blurb:
      "Medical knowledge keeps advancing. Staying informed about what may matter to you shouldn't have to become a full-time job.",
    tagline:
      "Medical knowledge keeps advancing. Staying informed about what may matter to you shouldn't have to become a full-time job.",
    cta: "decision",
    sections: [
      {
        body: [
          "Health and wellness research evolves continuously. New studies, treatment approaches, prevention strategies, lifestyle research, and clinical guidance are published across countless medical specialties and scientific sources.",
          "For an individual trying to manage their health, simply keeping up can be overwhelming. More information doesn't automatically create better understanding, and research that matters greatly to one person may have little relevance to another.",
          "InwardWise is designed to help make that information more personal, organized, and useful. Based on the health interests and information you choose to provide, AI-supported tools can help identify and organize research that may be relevant to you, so you can discover developments worth discussing with your healthcare professionals.",
        ],
      },
      {
        heading: "From information to habits",
        body: [
          "InwardWise Connect can help deliver curated research, educational information, and wellness content around health topics and communities that are relevant to you. It can also create opportunities for connection with others who share similar wellness interests or life experiences.",
          "But knowing what is healthy and consistently doing it are very different challenges. InwardWise Self can help you explore the personal patterns that influence your wellbeing. What makes it difficult to exercise consistently? What environments affect your eating habits? How does stress influence your routines? What motivates you, and what repeatedly gets in the way?",
          "InwardWise Calm and Mantra can help reinforce the healthy intentions you establish for yourself through personalized reminders, reflection, encouragement, and wellbeing practices. Diet, physical activity, sleep routines, stress management, and other healthy habits often depend not on hearing something once, but on remembering what matters when everyday life gets in the way.",
          "And when health-related choices involve competing priorities, uncertainty, or important consequences, InwardWise Decision can help you organize the questions, objectives, alternatives, assumptions, and trade-offs you may want to consider and discuss with qualified healthcare professionals.",
        ],
      },
    ],
    cycle:
      "Stay informed → Understand yourself → Ask better questions → Build healthier habits → Reinforce them → Adapt as your needs change",
    closing:
      "The objective isn't for AI to become your doctor. It is to help you become a more informed, self-aware, and engaged participant in your own health and wellbeing.",
    disclaimer:
      "InwardWise provides educational information, self-reflection, and decision-support tools. It does not diagnose conditions, prescribe treatments, provide individualized medical advice, or replace physicians or other qualified healthcare professionals. Health decisions should be made in consultation with appropriate healthcare providers.",
  },
  {
    slug: "political-decisions",
    audience: "corporate",
    name: "Political Decisions",
    blurb: "Before choosing a side, understand the problem you are actually trying to solve.",
    tagline: "Before choosing a side, understand the problem you are actually trying to solve.",
    cta: "decision",
    sections: [
      {
        body: [
          "Political issues can quickly become questions of identity. People naturally hold different values, experiences, priorities, and beliefs, producing a broad spectrum of opinions about how society should address its problems.",
          "Having different opinions isn't necessarily the problem. The difficulty begins when defending the position becomes more important than understanding the objective behind it.",
          "Political systems organize competing viewpoints into parties, ideologies, platforms, and positions. These structures are necessary for collective decision-making, but they can also encourage us to begin with \u201cWhich side am I on?\u201d rather than \u201cWhat problem are we trying to solve?\u201d",
        ],
      },
      {
        heading: "From position to objective",
        body: [
          "InwardWise Self helps you examine the person behind your political opinions. Which beliefs come from your own experiences and values? Which may have been influenced by family, community, social environment, media, political identity, fear, or loyalty to a group? What evidence would genuinely cause you to reconsider a position? The purpose isn't to remove your values or beliefs. It is to understand what is influencing them.",
          "InwardWise Decision then helps shift the analysis from position to objective: What is the underlying problem? Who is affected? What outcome are we actually trying to achieve? What competing objectives need to be considered? What assumptions does each proposed solution make? What are the likely benefits, costs, unintended consequences, and trade-offs?",
          "Different people may still reach different conclusions. But now the disagreement can become a discussion about objectives, evidence, priorities, trade-offs, and solutions rather than simply opposing political identities.",
          "If we temporarily remove the political label, what problem are we actually trying to solve?",
        ],
      },
    ],
    cycle:
      "Position → Question → Understand the bias → Define the problem → Clarify the objective → Examine trade-offs → Explore solutions",
    closing: "Problems don't belong to political parties. Solutions begin by understanding the problem.",
  },
  {
    slug: "justice-rehabilitation",
    audience: "corporate",
    name: "Justice & Rehabilitation Support",
    blurb:
      "Accountability addresses what happened. Lasting change requires understanding why, and what happens next.",
    tagline:
      "Accountability addresses what happened. Lasting change requires understanding why, and what happens next.",
    cta: "decision",
    sections: [
      {
        body: [
          "The justice system must protect society, establish accountability, and respond appropriately when laws are violated. But for many individuals, particularly in situations where incarceration is not required or following release, accountability alone may not address the personal and environmental factors that contributed to their behavior.",
          "A more lasting question is: what can help this person make different decisions in the future?",
          "People arrive in the justice system through very different circumstances. Family environment, relationships, financial pressures, substance use, impulsivity, anger, fear, social influences, previous experiences, and patterns of decision-making can all play different roles for different individuals. A standardized program may address the offense. InwardWise can help explore the individual behind it.",
        ],
      },
      {
        heading: "Support that continues",
        body: [
          "InwardWise Self can provide a structured, private environment for individuals to develop greater self-awareness over time. What situations repeatedly create problems? What triggers certain behaviors? What personal patterns, relationships, environments, or assumptions contribute to poor choices? What needs to change, and what strengths can help make that change sustainable?",
          "InwardWise Decision can help translate that self-awareness into future choices. Before repeating a consequential behavior, individuals can be guided to slow down, examine their objective, recognize familiar patterns, consider alternatives, and think through consequences for themselves, their families, victims, and the broader community.",
          "InwardWise Calm can complement this process with personalized reflection and emotional-regulation practices when anger, fear, stress, frustration, or impulsive reactions interfere with clearer thinking.",
          "InwardWise Connect can help address the social dimension of successful reintegration. Where appropriate and carefully administered, supportive relationships, mentors, peers, community resources, and constructive social environments can help individuals build connections that reinforce positive change.",
          "With appropriate consent, privacy protections, professional oversight, and safeguards, support could extend beyond a short intervention or program period, helping individuals continue reflecting on their progress, challenges, decisions, and goals as they return to everyday life.",
        ],
      },
    ],
    cycle:
      "Accountability → Self-understanding → Reflection → Better choices → Support → Reintegration → Continued growth",
    closing: "Justice responds to the past. Rehabilitation should also prepare a person for the future.",
    disclaimer:
      "InwardWise is designed to support self-reflection and structured decision-making. It is not legal advice, psychotherapy, clinical treatment, risk assessment, or a substitute for qualified legal, correctional, medical, or mental health professionals.",
  },
  {
    slug: "special-interest-groups",
    audience: "individual",
    name: "Special Interest Groups",
    blurb:
      "Belonging isn't simply about meeting more people. It's about finding where, and how, you meaningfully connect.",
    tagline:
      "Belonging isn't simply about meeting more people. It's about finding where, and how, you meaningfully connect.",
    cta: "self",
    sections: [
      {
        body: [
          "Human beings have a fundamental need for connection and belonging. But belonging doesn't come through a single path. We connect with the world through people, shared interests, ideas, activities, professions, accomplishments, communities, causes, and experiences that matter to us.",
          "Someone can have a large professional network and still feel disconnected. Another person may find a deep sense of belonging among a small group of people brought together by one shared passion.",
          "InwardWise approaches belonging from both directions: understanding what meaningful connection looks like for you, and then helping create opportunities to experience it.",
        ],
      },
      {
        heading: "Human leadership, AI-supported connection",
        body: [
          "InwardWise Self helps you explore your own paths to connection. What interests energize you? What kinds of people and environments make you feel comfortable and engaged? Do you connect through intellectual discussion, shared activities, professional interests, service, creativity, accomplishment, learning, or simply spending time with people who understand something important about your life?",
          "InwardWise Connect helps turn that self-understanding outward by creating opportunities to connect with people and communities around those interests. Through InwardWise Connect Special Interest Groups, members can participate in communities organized around shared interests, experiences, professions, activities, ideas, or life pursuits. Groups can interact digitally and, where appropriate, meet in person.",
          "Each group is supported by a Group Chair who helps build the community, organize activities, develop agendas, and foster meaningful participation. InwardWise AI can complement the Chair by helping understand members' interests, experiences, participation, and sense of connection, providing insights that can help the community evolve around the people it serves.",
          "Individual groups may have different membership fees based on the nature of the community, its activities, resources, and leadership. Rather than forcing every community into the same structure or price, each group can be designed around the experience and value it seeks to create for its members.",
        ],
      },
    ],
    cycle:
      "Discover yourself → Find your interests → Meet your community → Participate → Contribute → Belong",
    closing: "Don't just build a network. Find where you belong.",
  },
  {
    slug: "business-decisions",
    audience: "corporate",
    name: "Business Decisions",
    blurb: "The best business decision isn't always the one that produces the most growth.",
    tagline: "The best business decision isn't always the one that produces the most growth.",
    cta: "decision",
    sections: [
      {
        body: [
          "Business leaders make consequential decisions with an unavoidable disadvantage: they are deciding today about a future they cannot fully predict. Markets change, competitors respond, technologies emerge, customers behave differently than expected, and information is almost always incomplete.",
          "There is another, less obvious challenge. Business culture frequently treats growth, scale, market share, valuation, and winning as unquestioned objectives. Competition can make business resemble a sport in which continuing to win becomes the goal simply because the scoreboard exists.",
          "But a business is part of a larger system, and the people making its decisions have lives beyond the business. More growth may require more capital, greater risk, additional employees, longer working hours, increased complexity, or sacrifices elsewhere in life. A profitable, sustainable business that provides value to customers, employees, owners, and society may sometimes be a better outcome than pursuing growth indefinitely.",
        ],
      },
      {
        heading: "Question the objective, not just the numbers",
        body: [
          "InwardWise Decision helps leaders slow down before consequential decisions and ask deeper questions: What are we actually trying to achieve? Why is growth the objective? What assumptions are we making about the future? What happens if those assumptions are wrong? What alternatives are we overlooking? What would sustainable success look like?",
          "InwardWise Self examines another variable that conventional business analysis can overlook, the decision-maker. Ambition, ego, fear of failure, competitive pressure, attachment to previous decisions, social definitions of success, and the desire for recognition can quietly influence what appears to be an objective business decision.",
          "InwardWise Connect can broaden that perspective by connecting leaders with others facing similar decisions and exposing them to experiences beyond their immediate organizational environment.",
          "Together, InwardWise helps leaders examine the forecast, the assumptions, the objective, and the person making the decision before committing to a path.",
        ],
      },
    ],
    closing: "Question the assumptions. Understand the objective. Consider the whole system. Then decide.",
  },
  {
    slug: "ethics-management",
    audience: "corporate",
    name: "Ethics Management",
    blurb: "Ethical decisions become harder when the forces influencing the decision are difficult to see.",
    tagline: "Ethical decisions become harder when the forces influencing the decision are difficult to see.",
    cta: "decision",
    sections: [
      {
        body: [
          "Board members, executives, physicians, engineers, lawyers, entrepreneurs, and other professionals operate within ethical and professional boundaries. Yet ethics can sometimes be experienced as a set of rules imposed from the outside rather than as an essential part of good decision-making.",
          "The most difficult ethical questions are rarely the obvious ones. Financial conflicts can sometimes be identified because money is measurable. But power, influence, status, loyalty, ambition, reputation, organizational pressure, and fear of losing one's position can influence decisions just as strongly, and are much harder to recognize and measure.",
          "Ethical decision-making therefore requires more than asking, \u201cAm I following the rules?\u201d It can require asking deeper questions: Why am I making this decision? Who benefits? What is influencing me? What assumptions am I accepting because everyone around me accepts them? Would I make the same decision if money, power, status, or recognition were removed from the equation?",
        ],
      },
      {
        heading: "Seeing what influences the decision",
        body: [
          "InwardWise Self helps individuals examine the personal forces behind their decisions. Bias, ambition, fear, ego, loyalty, social conditioning, and the desire for recognition or influence can affect judgment without being consciously recognized. Greater self-awareness can help bring these hidden influences into view.",
          "InwardWise Decision helps take that awareness into the decision itself. Instead of immediately choosing an action, the platform helps clarify the underlying objective, examine competing objectives, question assumptions, consider uncomfortable outcomes, and define a broader decision boundary before evaluating solutions.",
          "InwardWise Connect can provide another important perspective: exposure to people with different experiences and viewpoints. Ethical blind spots can become difficult to recognize when everyone within the same organization, profession, or social environment shares similar assumptions.",
          "For organizations, these tools can support a culture in which ethical reflection becomes part of important decision-making, not simply something reviewed after a problem occurs.",
        ],
      },
    ],
    cycle: "Awareness → Questioning → Perspective → Clearer objectives → More thoughtful decisions",
    closing: "Ethics becomes stronger when we understand not only what we decided, but why we decided it.",
  },
  {
    slug: "sales-negotiations",
    audience: "corporate",
    name: "Business Sales & Negotiations",
    blurb: "Better negotiations begin before the conversation, and continue after it ends.",
    tagline: "Better negotiations begin before the conversation, and continue after it ends.",
    cta: "decision",
    sections: [
      {
        body: [
          "Business is a continuous series of conversations and decisions: winning customers, negotiating contracts, forming partnerships, managing vendors, resolving disagreements, setting pricing, and deciding when to compromise, persist, or walk away.",
          "Yet important negotiations can easily become influenced by pressure, fear of losing the deal, attachment to a desired outcome, assumptions about the other party, previous experiences, or the simple desire to reach an agreement quickly.",
        ],
      },
      {
        heading: "Prepare, adapt, review",
        body: [
          "InwardWise Decision helps teams prepare before important negotiations by clarifying the real objective, not simply \u201cclose the deal\u201d, but what a successful outcome actually needs to accomplish. It can help examine priorities, alternatives, trade-offs, risks, boundaries, and possible outcomes before entering the conversation.",
          "During an ongoing business relationship or negotiation, InwardWise can help analyze how new information may affect previously established objectives and strategy. Afterward, teams can examine what happened, what assumptions proved correct or incorrect, what may have been overlooked, and what should change before the next discussion.",
          "But negotiations aren't driven by facts alone. InwardWise Self adds another dimension: understanding the people making the decisions. Personal biases, fear of rejection, overconfidence, ego, past experiences, excessive optimism, or risk aversion can influence even experienced executives without being obvious at the time.",
          "At an enterprise level, combining InwardWise Decision with InwardWise Self can create a more disciplined decision environment, helping executives and teams examine both the business decision and the human factors influencing the decision.",
        ],
      },
    ],
    cycle: "Prepare → Understand → Negotiate → Evaluate → Learn → Decide better",
    closing:
      "The objective isn't simply to negotiate harder. It is to negotiate with greater clarity, knowing what you want, why you want it, where you can compromise, where you cannot, and when the best decision may be to walk away.",
  },
  {
    slug: "founders-network",
    audience: "corporate",
    name: "CEOs, Entrepreneurs & Founders Network",
    blurb: "Leadership can surround you with people while leaving you alone with your hardest decisions.",
    tagline: "Leadership can surround you with people while leaving you alone with your hardest decisions.",
    cta: "decision",
    sections: [
      {
        body: [
          "Building and leading a company can demand extraordinary persistence. Behind the ambition and excitement, however, founders and CEOs may carry fears they rarely discuss openly: What if the company fails? What if my idea isn't as good as I believe? Am I making the right decision? Should I keep going, change direction, or walk away?",
          "The founder of InwardWise experienced many of these challenges while building companies himself. Fear of failure sometimes encouraged him to pursue multiple ideas rather than narrow his focus. Creating something new was exciting; putting one product repeatedly in front of customers, and risking rejection, was much harder. Attachment to an idea could make criticism feel personal, while avoiding criticism could prevent the very customer feedback needed to improve the business.",
          "These are not simply business problems. They can become deeply personal ones. When the company becomes intertwined with your identity, rejection of the product can feel like rejection of you. Persistence can be essential to entrepreneurship, but persistence without objective feedback can also become a trap. The challenge is learning to distinguish conviction from attachment, persistence from denial, thoughtful experimentation from distraction, and a business setback from personal failure.",
        ],
      },
      {
        heading: "Where InwardWise helps",
        body: [
          "InwardWise Decision helps founders slow down consequential decisions and examine the objectives underneath them. Rather than immediately asking \u201cWhat should I do?\u201d, it helps you explore assumptions, alternatives, biases, risks, fears, and longer-term consequences before deciding. The goal isn't slower business, it is clearer thinking when the stakes are high.",
          "InwardWise Self helps you explore the person behind the company. What drives you? What are you afraid of? How do you respond to rejection? Are you pursuing another idea because it represents a better opportunity, or because it is easier than confronting the market's response to your current one?",
          "InwardWise Connect helps address another challenge of leadership: isolation. Connect with other founders, CEOs, and entrepreneurs who understand the emotional realities behind building a company, not only the successes people celebrate publicly, but also uncertainty, rejection, difficult decisions, setbacks, and starting again.",
          "And when things become overwhelming, InwardWise Calm can provide personalized techniques for managing stress and reinforcing constructive perspectives based on your situation and what you have learned about yourself.",
          "Success and failure are both part of entrepreneurship. Neither has to define who you are.",
        ],
      },
    ],
    closing: "Build the company. Understand the founder.",
    disclaimer:
      "InwardWise supports self-reflection, connection, stress management, and decision-making. It is not a substitute for professional medical, mental health, legal, financial, or business advice.",
  },
  {
    slug: "business-conflict-management",
    audience: "corporate",
    name: "Business Conflict Management",
    blurb: "Conflict doesn't have to derail your business, or your life.",
    tagline: "Conflict doesn't have to derail your business, or your life.",
    cta: "decision",
    sections: [
      {
        body: [
          "Business ownership can bring extraordinary opportunities, but it can also bring unexpected conflict. Partner disputes, employee issues, customer disagreements, financial misconduct, litigation, and other difficult situations can quickly move beyond the business and affect an owner's relationships, health, confidence, and peace of mind.",
          "For small-business owners and executives, these experiences can feel particularly isolating. You may be responsible for protecting the company, employees, customers, finances, and family while simultaneously dealing with your own anger, fear, disappointment, or sense of betrayal. Decisions made under these conditions can have consequences long after the immediate conflict has passed.",
          "The founder's own experiences with difficult business disputes helped shape the InwardWise approach. Business conflicts sometimes involve circumstances that feel deeply unfair. But while you may not be able to control another partner, employee, customer, competitor, or litigant, you can work on how clearly you understand the situation, how you respond to it, and how you make the decisions that follow.",
        ],
      },
      {
        heading: "From conflict to forward progress",
        body: [
          "InwardWise Self helps you understand how your own experiences, emotions, expectations, fears, and behavioral patterns may influence your response to a conflict. Separating the business problem from the personal reaction can help create the clarity needed to move forward.",
          "InwardWise Connect helps reduce the isolation by connecting you with people navigating similar business and life challenges. Shared experience can provide perspective and remind you that difficult business events do not have to define either your company or your life.",
          "InwardWise Calm provides personalized techniques for managing stress and reinforcing constructive perspectives during difficult periods, based on your situation and the understanding of yourself you develop within InwardWise.",
          "And when important choices have to be made, InwardWise Decision helps you step beyond the immediate conflict to examine your true objectives, assumptions, alternatives, risks, and longer-term consequences, so today's crisis doesn't become tomorrow's regretted decision.",
        ],
      },
    ],
    cycle: "Conflict → Calm → Self-awareness → Perspective → Clearer decisions → Forward progress",
    disclaimer:
      "InwardWise supports self-reflection, stress management, and decision-making. It does not provide or replace professional legal, financial, medical, or mental health advice.",
  },
  {
    slug: "stress-management",
    audience: "individual",
    name: "Stress Management",
    blurb: "Understand what creates your stress, not just how to cope with it.",
    tagline: "Understand what creates your stress, not just how to cope with it.",
    cta: "calm",
    sections: [
      {
        body: [
          "Chronic stress can affect both physical and psychological well-being. Managing stress, therefore, isn't only about finding temporary relief. It can also mean understanding the circumstances, thought patterns, relationships, expectations, and decisions that repeatedly create stress in our lives.",
          "The founder's extensive research into stress biology and its effects on the body and mind helped shape the InwardWise approach. Life itself presents us with competing demands: caring for ourselves while caring for others, pursuing achievement while seeking contentment, accumulating what we need while contributing something meaningful, and ultimately learning to let go. Finding a sustainable balance among these competing objectives can be an important part of reducing stress.",
        ],
      },
      {
        heading: "Where InwardWise helps",
        body: [
          "InwardWise Connect helps you connect with others navigating similar life challenges. Knowing that others are facing comparable experiences can provide perspective, encouragement, and a greater sense of connection.",
          "InwardWise Self goes deeper. By taking the time to build a clearer understanding of yourself, you can explore the personal factors, patterns, expectations, and circumstances that may contribute to your stress, and identify strategies for addressing them.",
          "Finally, InwardWise Decision helps you bring that self-awareness into the decisions you make. Rather than repeatedly solving the immediate problem, it helps you examine your underlying objectives, competing priorities, assumptions, and longer-term consequences so you can make decisions that better support balance and well-being.",
        ],
      },
    ],
    cycle: "Stress → Self-awareness → Connection → Clearer decisions → Greater inner balance",
    disclaimer:
      "InwardWise is intended to support self-reflection and decision-making and is not a substitute for professional medical or mental health care.",
  },
  {
    slug: "school-districts",
    audience: "corporate",
    name: "School Districts",
    blurb:
      "Education prepares students for what to learn. We can also help them learn how to understand themselves, make decisions, and navigate life.",
    tagline:
      "Education prepares students for what to learn. We can also help them learn how to understand themselves, make decisions, and navigate life.",
    cta: "decision",
    sections: [
      {
        body: [
          "School districts carry a responsibility that extends far beyond academic instruction. Students are developing their identities, relationships, interests, values, aspirations, and ways of responding to success, failure, pressure, and uncertainty, all while preparing for a future they cannot yet fully understand.",
          "Teachers, counselors, administrators, and parents work hard to support that development. But the number of students, limited time and resources, and the complexity of individual needs can make sustained, personalized reflection difficult. InwardWise can provide an additional layer of support.",
        ],
      },
      {
        heading: "Help students understand themselves",
        body: [
          "Students make increasingly consequential choices as they grow: friendships, activities, academic paths, college, career interests, relationships, habits, and responses to social pressure. Yet young people are still discovering who they are.",
          "InwardWise Self can provide an age-appropriate, structured environment for guided self-reflection. Students can explore their interests, strengths, motivations, aspirations, experiences, and patterns while learning an important lifelong skill: before deciding what you want to become, spend time understanding who you are becoming.",
        ],
      },
      {
        heading: "Teach better decision-making",
        body: [
          "Students will eventually leave school and encounter decisions for which there is no textbook answer. InwardWise Decision can help teach a structured way of approaching those situations. Instead of immediately choosing an answer, students can learn to separate the situation from the objective, question assumptions, recognize bias and fear, consider different outcomes, examine consequences, and think about longer-term objectives before acting.",
          "The objective isn't for AI to make decisions for students. It is to help students develop the ability to make thoughtful decisions for themselves.",
        ],
      },
      {
        heading: "Support wellbeing and connection",
        body: [
          "Academic pressure, friendships, family circumstances, social comparison, extracurricular commitments, uncertainty about the future, and everyday challenges can create significant stress. InwardWise Calm can provide age-appropriate reflection, mindfulness, breathing, gratitude, and other wellbeing practices designed to help students create moments of calm and perspective.",
          "InwardWise Connect can support carefully designed school communities and special-interest groups around academics, arts, science, technology, sports, service, culture, hobbies, career interests, and other constructive activities. Rather than simply helping students meet more people, the objective is to help them discover where their interests and sense of contribution can create meaningful connection.",
        ],
      },
      {
        heading: "Support educators and administrators",
        body: [
          "Schools themselves are complex organizations. Administrators make decisions involving budgets, staffing, programs, technology, curriculum, student services, community expectations, competing priorities, and limited resources.",
          "InwardWise Decision can provide a structured framework for examining important district and school-level decisions, clarifying objectives, challenging assumptions, considering stakeholder perspectives, examining trade-offs, and anticipating unintended consequences before implementation. InwardWise Self can add another dimension by helping leaders recognize how personal experiences, organizational pressures, established practices, and biases may influence decisions.",
        ],
      },
    ],
    cycle:
      "Understand yourself → Manage stress → Build meaningful connections → Learn how to think through difficult choices → Make better decisions → Adapt as life changes",
    closing: "Don't prepare students only for the next test. Help prepare them for the decisions that come after school.",
    disclaimer:
      "InwardWise is designed to support education, self-reflection, wellbeing, and structured decision-making. It does not replace teachers, parents, school counselors, psychologists, medical professionals, or other qualified professionals. School implementations involving minors should include appropriate district oversight, age-appropriate safeguards, parental or guardian involvement where required, privacy protections, and clear policies governing the use of student data and AI.",
  },
];

/** Old slugs that were renamed, so existing links keep working. */
export const AREA_ALIASES: Record<string, string> = {
  "addiction-counseling": "habits",
  "inner-enemies": "habits",
  "courts-counseling": "justice-rehabilitation",
  "marriage-counseling": "relationships",
  "family-decisions": "family",
  "medical-decisions": "health-wellness-research",
  "ethics-counseling": "ethics-management",
  "social-wellbeing": "special-interest-groups",
};

export function findArea(slug: string): Area | undefined {
  const resolved = AREA_ALIASES[slug] ?? slug;
  return AREAS.find((a) => a.slug === resolved);
}
