/**
 * Conversational Onboarding Logic
 * 
 * Orchestrates the onboarding interview flow as defined in 
 * /directives/client_onboarding.md
 */

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatContainer = document.getElementById('chat-container');
const successModal = document.getElementById('success-modal');

// State Management
let currentStep = 0;
const onboardData = {
    client_name: "",
    company_name: "",
    vision: "",
    pain_points: [],
    current_stack: [],
    email: "",
    website: ""
};

// Interview Steps Configuration
const steps = [
    {
        id: "intro",
        message: "Welcome to AlphaReach. I'm your Automation Architect. To start, what is your name and the name of the venture we are scaling today?",
        process: (input) => {
            // Basic parsing for "Name from Company" or "Name, Company"
            const parts = input.split(/ from |, | /);
            onboardData.client_name = parts[0] || input;
            onboardData.company_name = parts.slice(1).join(' ') || "Your Venture";
            return true;
        }
    },
    {
        id: "vision",
        message: (data) => `Nice to meet you, ${data.client_name}. Briefly, what is the 'North Star' goal for ${data.company_name} in the next 12 months?`,
        process: (input) => {
            onboardData.vision = input;
            return true;
        }
    },
    {
        id: "friction",
        message: "Vision noted. If you could wave a magic wand and delete one repetitive task from your team's daily schedule, what would it be?",
        process: (input) => {
            onboardData.pain_points.push(input);
            return true;
        }
    },
    {
        id: "current_ai",
        message: "Are you currently using any AI tools (ChatGPT, Claude, etc.), and where are they falling short of your expectations?",
        process: (input) => {
            onboardData.pain_points.push(`Shortcoming: ${input}`);
            return true;
        }
    },
    {
        id: "stack",
        message: "Understood. What does your current 'Command Center' look like? (e.g., Slack, Notion, GoHighLevel, Shopify, etc.)",
        process: (input) => {
            onboardData.current_stack = input.split(/, | /);
            return true;
        }
    },
    {
        id: "handover_email",
        message: "Lastly, please provide your business email so we can send you our preliminary audit.",
        process: (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(input)) {
                onboardData.email = input;
                return true;
            }
            return "Please provide a valid email address so we can reach you.";
        }
    },
    {
        id: "handover_url",
        message: "And your website URL? Our system will run a quick infrastructure check.",
        process: (input) => {
            onboardData.website = input;
            // This is the final step
            completeOnboarding();
            return true;
        }
    }
];

// Helper: Add Message to UI
function addMessage(text, sender = 'ai') {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);

    // Smooth scroll to bottom
    setTimeout(() => {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }, 50);
}

// Helper: Show Typing Indicator
function showTyping() {
    const typing = document.createElement('div');
    typing.id = 'typing';
    typing.classList.add('typing-indicator');
    typing.textContent = "Architect is typing...";
    chatMessages.appendChild(typing);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typing;
}

// Core Logic: Handle Step
async function nextQuestion() {
    if (currentStep >= steps.length) return;

    const step = steps[currentStep];
    const typing = showTyping();

    // Simulate thinking time for "premium" feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    typing.remove();
    const msg = typeof step.message === 'function' ? step.message(onboardData) : step.message;
    addMessage(msg, 'ai');
}

// Core Logic: Process Input
function handleUserInput() {
    const input = userInput.value.trim();
    if (!input) return;

    addMessage(input, 'user');
    userInput.value = '';

    const step = steps[currentStep];
    const result = step.process(input);

    if (result === true) {
        currentStep++;
        if (currentStep < steps.length) {
            nextQuestion();
        }
    } else if (typeof result === 'string') {
        // Validation error message
        setTimeout(() => addMessage(result, 'ai'), 500);
    }
}

// Finalization: Submit to "Execution Layer"
function completeOnboarding() {
    console.log("ONBOARDING_DATA_COLLECTED:", onboardData);

    const typing = showTyping();

    // In a real app, this would be a fetch() call to a backend 
    // that triggers execution/process_onboarding.py
    setTimeout(() => {
        typing.remove();
        successModal.style.display = 'flex';
    }, 2000);
}

// Event Listeners
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});

// Initialize
window.onload = () => {
    nextQuestion();
};

// --- Workflow Templates Logic ---
const workflowData = {
    "gen_wf": {
        title: "Generative Workflow Architecture",
        desc: "Autonomous LLM chains that execute business processes from input to multi-channel export.",
        image: "images/gen_wf.png",
        steps: [
            { h: "Step 1: Data Ingestion", p: "Scraping and cleaning raw unstructured business data." },
            { h: "Step 2: Clustering", p: "LLM-driven categorization of data into actionable high-intent segments." },
            { h: "Step 3: Synthesis", p: "Generating custom assets (copy, reports, creative) based on segments." },
            { h: "Step 4: Quality Gate", p: "Self-correcting AI layer verifying output against brand guidelines." }
        ]
    },
    "models_wf": {
        title: "Proprietary Model Pipeline",
        desc: "Tailoring open-source architectures to your specific domain expertise using LoRA and fine-tuning.",
        image: "images/models_wf.png",
        steps: [
            { h: "Stage 1: Base Selection", p: "Selecting Llama 3 or Mistral based on tokens and latency needs." },
            { h: "Stage 2: Synthetic Data", p: "Generating high-quality training pairs using teacher models." },
            { h: "Stage 3: Fine-Tuning", p: "Executing Low-Rank Adaptation (LoRA) on enterprise hardware." },
            { h: "Stage 4: Deployment", p: "Quantized hosting for 10x faster inference at 90% lower cost." }
        ]
    },
    "agents_wf": {
        title: "Autonomous Agent Core",
        desc: "Sophisticated agents equipped with memory, planning, and executive tool access.",
        image: "images/agents_wf.png",
        steps: [
            { h: "Perception", p: "Agent detects triggers in Slack, Email, or CRM dashboards." },
            { h: "Reasoning", p: "Breaking down complex tasks into sub-goals using Chain-of-Thought." },
            { h: "Action", p: "Calling external APIs (Stripe, Zapier, GitHub) to execute the plan." },
            { h: "Reflection", p: "Storing the outcome in long-term vector memory for future optimization." }
        ]
    },
    "alpha_wf": {
        title: "Alpha Stack Framework",
        desc: "Our 4-layer proprietary growth stack for high-performance B2B scaling.",
        image: "images/alpha_wf.png",
        steps: [
            { h: "Layer 1: Unified Data", p: "Centralizing all business signals into a single source of truth." },
            { h: "Layer 2: Intelligence", p: "Applying AI models to predict churn and identify high-LTV leads." },
            { h: "Layer 3: Automation", p: "Hard-coding deterministic paths for routine operations." },
            { h: "Layer 4: Scaling", p: "Unlocking recursive loops that grow without increasing headcount." }
        ]
    },
    "outreach_wf": {
        title: "High-Performance Outreach",
        desc: "AI-personalized outreach that achieves 80%+ open rates and 10%+ booking rates.",
        image: "images/outreach_wf.png",
        steps: [
            { h: "Mining", p: "Identifying decision-makers using Sales Navigator and Apollo." },
            { h: "Personalization", p: "Scanning their recent posts and company news for AI-hooks." },
            { h: "Dispatch", p: "Multi-channel sequence (LinkedIn -> Email -> Twitter)." },
            { h: "Optimization", p: "A/B testing subject lines and hooks automatically via AI analysis." }
        ]
    }
};

const workflowModal = document.getElementById('workflow-modal');
const closeWorkflow = document.getElementById('close-workflow');
const bentoCards = document.querySelectorAll('.bento-card');

function openWorkflow(id) {
    const data = workflowData[id];
    if (!data) return;

    document.getElementById('workflow-img').src = data.image;
    document.getElementById('workflow-title').innerText = data.title;
    document.getElementById('workflow-desc').innerText = data.desc;
    
    const stepsContainer = document.getElementById('workflow-steps');
    stepsContainer.innerHTML = '';
    
    data.steps.forEach(step => {
        const card = document.createElement('div');
        card.className = 'step-card';
        card.innerHTML = `<h4>${step.h}</h4><p>${step.p}</p>`;
        stepsContainer.appendChild(card);
    });

    workflowModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

bentoCards.forEach(card => {
    card.addEventListener('click', () => {
        const id = card.getAttribute('data-workflow');
        if (id) openWorkflow(id);
    });
});

closeWorkflow.addEventListener('click', () => {
    workflowModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === workflowModal) {
        workflowModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

document.getElementById('modal-cta').addEventListener('click', () => {
    workflowModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('onboarding').scrollIntoView({ behavior: 'smooth' });
});
