// Enums for specific input types and actions if the standalone chatbot needs them.
// Kept minimal for a generic chatbot.

export enum QuestionInputType { // Example, might not be directly used if chatbot is very generic
  TEXTAREA = 'textarea',
  TABLE_LIKE = 'table_like', // for context passing
  // ... other types if context needs them
}

export interface Question { // Simplified for context
  question_id: string;
  question_text: string;
  guidance_text?: string;
  input_type?: QuestionInputType; // Optional for generic context
}

export enum ChatbotAction {
  // Core Chat Actions
  DRAFT_ANSWER = "Draft Answer", // If chatbot can draft for a specific context
  EXPLAIN_QUESTION = "Explain Context", // If chatbot explains a specific context/question
  EXPLAIN_DRAFT = "Explain Draft",
  IMPROVE_DRAFT = "Improve Draft",
  DEEP_DIVE = "Deep Dive on Topic",
  DEFINE_TERM = "Define Term",
  // General Utility Actions
  SUMMARIZE_CHAT = "Summarize This Chat",
  SUGGEST_USER_FOLLOWUPS = "Suggest What I Ask Next", // AI suggests questions for user to ask AI
  // Example custom actions for a generic chatbot
  GENERAL_HELP = "General Help",
  EXPLORE_EXAMPLES = "Explore Examples", // Generic examples
  DRAFT_KEY_METRICS_LIST = "Draft Key Metrics", // Generic metrics
}


export interface RichAIResponseSection {
  title?: string;
  content: string;
  isCollapsible?: boolean;
}

export interface RichAIActionableItem {
  text: string;
  action: string; // Generic action string for standalone version
  actionContext: string;
}

export interface RichAIResponse {
  id: string;
  primaryContent?: string;
  sections?: RichAIResponseSection[];
  actionableItems?: RichAIActionableItem[];
  suggestedFollowUpActions?: { action: string; displayText: string; context?: string }[]; // action is string
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: number;
  isMarkdown?: boolean;
  richResponse?: RichAIResponse;
}

// For ExplanationCarousel, if used by StandaloneChatbot's RichAIResponse
export interface CarouselSlide {
  title: string;
  text: string;
}

export interface CarouselExplanationPayload {
  slides: CarouselSlide[];
}
