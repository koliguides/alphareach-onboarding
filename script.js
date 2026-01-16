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
