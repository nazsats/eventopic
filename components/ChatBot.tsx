"use client";

import React, { useState, ReactNode } from "react";
import { createChatBotMessage } from "react-chatbot-kit";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import { toast } from "react-toastify";
import { FaComment } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Interface for chatbot message (replacing ChatMessage)
interface ChatBotMessage {
  message: string;
  type: string;
  widget?: string;
  loading?: boolean;
}

// Interface for form data
interface FormData {
  name: string;
  email: string;
  mobile: string;
  message: string;
  eventType: string;
  role: string;
  experience: string;
}

// Interface for actions (passed to widgets/children)
interface Actions {
  handleEnquiryStart: () => void;
  handleStaffApplication: () => void;
  handleEventTypeSelected: (eventType: string) => void;
  handleRoleSelected: (role: string) => void;
  handleBack: () => void;
  handleUserInput: (userInput: string) => void;
  handleDefault: (message: string) => void;
  handleSubmit: () => void;
}

// Interface for ActionProvider props
interface ActionProviderProps {
  createChatBotMessage: (text: string, options?: { widget?: string }) => ChatBotMessage;
  setState: (updater: (prevState: { messages: ChatBotMessage[] }) => { messages: ChatBotMessage[] }) => void;
  children: ReactNode;
  actions?: Actions; // Optional for recursion
}

// Interface for MessageParser props
interface MessageParserProps {
  children: ReactNode;
  actions: Actions;
}

// Functional ActionProvider
const ActionProvider: React.FC<ActionProviderProps> = ({ createChatBotMessage, setState, children, actions = {} }) => {
  // Internal state for form logic
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile: "",
    message: "",
    eventType: "",
    role: "",
    experience: "",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isClientEnquiry, setIsClientEnquiry] = useState(true);
  const steps = ["name", "email", "mobile", "eventType", "message"];
  const staffSteps = ["name", "email", "mobile", "role", "experience"];

  const updateChatbotState = (message: ChatBotMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  const handleEnquiryStart = () => {
    setIsClientEnquiry(true);
    setCurrentStep(0);
    const botMessage = createChatBotMessage(
      "Great! Let's start your enquiry. What's your full name?",
      {}
    );
    updateChatbotState(botMessage);
  };

  const handleStaffApplication = () => {
    setIsClientEnquiry(false);
    setCurrentStep(0);
    const botMessage = createChatBotMessage(
      "Awesome! Let's start your staff application. What's your full name?",
      {}
    );
    updateChatbotState(botMessage);
  };

  const handleEventTypeSelection = () => {
    const botMessage = createChatBotMessage("Please select an event type:", {
      widget: "eventTypeSelector",
    });
    updateChatbotState(botMessage);
  };

  const handleRoleSelection = () => {
    const botMessage = createChatBotMessage("Please select a role:", {
      widget: "roleSelector",
    });
    updateChatbotState(botMessage);
  };

  const handleDefault = (message: string) => {
    const lowerMessage = message.toLowerCase();
    let botMessage: ChatBotMessage;
    if (lowerMessage.includes("budget")) {
      botMessage = createChatBotMessage(
        "Could you share your approximate budget? This helps us tailor our recommendations!",
        {}
      );
    } else if (lowerMessage.includes("date") || lowerMessage.includes("when")) {
      botMessage = createChatBotMessage(
        "When are you planning your event? Share a date or timeframe, and I'll note it.",
        {}
      );
    } else {
      botMessage = createChatBotMessage(
        `I didn't quite catch that. Type 'enquiry' for event planning, 'job' for staff opportunities, or ask about 'budget' or 'date'.`,
        {}
      );
    }
    updateChatbotState(botMessage);
  };

  const handleUserInput = (userInput: string) => {
    const step = isClientEnquiry ? steps[currentStep] : staffSteps[currentStep];
    setFormData((prev) => ({ ...prev, [step]: userInput }));

    if (step === "mobile" && !/^05\d{8}$/.test(userInput)) {
      const botMessage = createChatBotMessage(
        "Please enter a valid Dubai mobile number (05xxxxxxxx). Try again.",
        {}
      );
      updateChatbotState(botMessage);
      return;
    }

    if (currentStep < (isClientEnquiry ? steps.length : staffSteps.length) - 1) {
      setCurrentStep((prev) => prev + 1);
      const nextStep = isClientEnquiry
        ? steps[currentStep + 1]
        : staffSteps[currentStep + 1];
      if (nextStep === "eventType") {
        handleEventTypeSelection();
      } else if (nextStep === "role") {
        handleRoleSelection();
      } else {
        const prompts: { [key: string]: string } = {
          email: "What's your email address?",
          mobile: "Please provide your Dubai mobile number (05xxxxxxxx).",
          message: "Tell us about your event or any specific requirements.",
          experience: "Describe your relevant experience (optional).",
        };
        const botMessage = createChatBotMessage(
          prompts[nextStep] || "Next field?",
          {}
        );
        updateChatbotState(botMessage);
      }
    } else {
      handleSubmit();
    }
  };

  const handleEventTypeSelected = (eventType: string) => {
    setFormData((prev) => ({ ...prev, eventType }));
    setCurrentStep((prev) => prev + 1);
    const botMessage = createChatBotMessage(
      "Tell us about your event or any specific requirements.",
      {}
    );
    updateChatbotState(botMessage);
  };

  const handleRoleSelected = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
    setCurrentStep((prev) => prev + 1);
    const botMessage = createChatBotMessage(
      "Describe your relevant experience (optional).",
      {}
    );
    updateChatbotState(botMessage);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      const step = isClientEnquiry
        ? steps[currentStep - 1]
        : staffSteps[currentStep - 1];
      const prompts: { [key: string]: string } = {
        name: "What's your full name?",
        email: "What's your email address?",
        mobile: "Please provide your Dubai mobile number (05xxxxxxxx).",
        eventType: "Please select an event type:",
        role: "Please select a role:",
        message: "Tell us about your event or any specific requirements.",
        experience: "Describe your relevant experience (optional).",
      };
      let botMessage: ChatBotMessage;
      if (step === "eventType" || step === "role") {
        botMessage = createChatBotMessage(prompts[step], {
          widget: step === "eventType" ? "eventTypeSelector" : "roleSelector",
        });
      } else {
        botMessage = createChatBotMessage(prompts[step], {});
      }
      updateChatbotState(botMessage);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = isClientEnquiry
      ? ["name", "email", "mobile", "eventType", "message"]
      : ["name", "email", "mobile", "role"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof FormData]
    );

    if (missingFields.length > 0) {
      const botMessage = createChatBotMessage(
        `Please provide: ${missingFields.join(
          ", "
        )}. Type 'back' to revise or continue.`,
        {}
      );
      updateChatbotState(botMessage);
      return;
    }

    const endpoint = isClientEnquiry ? "/api/submit-client" : "/api/submit-staff";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "chatbot" }),
      });
      if (response.ok) {
        toast.success(
          `${isClientEnquiry ? "Enquiry" : "Application"} submitted! We'll contact you soon.`
        );
        const botMessage = createChatBotMessage(
          `Thank you! Your ${
            isClientEnquiry ? "enquiry" : "application"
          } has been submitted. We'll reach out soon.`,
          {}
        );
        updateChatbotState(botMessage);
        setFormData({
          name: "",
          email: "",
          mobile: "",
          message: "",
          eventType: "",
          role: "",
          experience: "",
        });
        setCurrentStep(0);
      } else {
        const botMessage = createChatBotMessage(
          `Sorry, submission failed. Please try the ${
            isClientEnquiry ? "contact" : "staff"
          } form on our website.`,
          {}
        );
        updateChatbotState(botMessage);
      }
    } catch (err) {
      // Log the error for debugging (or remove if not needed)
      console.error("Submission error:", err);
      const botMessage = createChatBotMessage(
        "Error submitting. Please check your connection and try again.",
        {}
      );
      updateChatbotState(botMessage);
    }
  };

  // Combine internal actions with any passed actions
  const allActions: Actions = {
    handleEnquiryStart,
    handleStaffApplication,
    handleEventTypeSelected,
    handleRoleSelected,
    handleBack,
    handleUserInput,
    handleDefault,
    handleSubmit,
    ...actions,
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ actions: Actions }>, {
            actions: allActions,
          });
        }
        return child;
      })}
    </div>
  );
};

// Functional MessageParser
const MessageParser: React.FC<MessageParserProps> = ({ children, actions }) => {
  const parse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("back")) {
      actions.handleBack();
    } else if (lowerMessage.includes("enquiry") || lowerMessage.includes("client")) {
      actions.handleEnquiryStart();
    } else if (lowerMessage.includes("job") || lowerMessage.includes("staff")) {
      actions.handleStaffApplication();
    } else if (actions.handleUserInput) {
      actions.handleUserInput(message);
    } else {
      actions.handleDefault(message);
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ parse: (message: string) => void; actions: Actions }>, {
            parse,
            actions,
          });
        }
        return child;
      })}
    </div>
  );
};

const EventTypeSelector = ({ actions }: { actions: Actions }) => (
  <div className="flex flex-wrap gap-2 p-2">
    {["Wedding", "Corporate", "Promotion", "Party", "Cultural"].map((type) => (
      <button
        key={type}
        onClick={() => actions.handleEventTypeSelected(type)}
        className="px-3 py-1 rounded-full text-sm font-semibold hover:bg-[var(--color-accent)] hover:text-[var(--white)] transition-colors duration-200"
        style={{ backgroundColor: "var(--accent)", color: "var(--white)" }}
      >
        {type}
      </button>
    ))}
  </div>
);

const RoleSelector = ({ actions }: { actions: Actions }) => (
  <div className="flex flex-wrap gap-2 p-2">
    {["Promoter", "Waitress", "Usher", "Volunteer", "Model"].map((role) => (
      <button
        key={role}
        onClick={() => actions.handleRoleSelected(role.toLowerCase())}
        className="px-3 py-1 rounded-full text-sm font-semibold hover:bg-[var(--color-accent)] hover:text-[var(--white)] transition-colors duration-200"
        style={{ backgroundColor: "var(--accent)", color: "var(--white)" }}
      >
        {role}
      </button>
    ))}
  </div>
);

const ChatBotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(true)}
            className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all bg-[var(--accent)] text-[var(--white)] hover:bg-[var(--color-accent)] animate-pulse"
          >
            <FaComment size={24} />
          </motion.button>
        )}
        {isOpen && (
          <motion.div
            key="chatbot"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
            className="w-full max-w-[90vw] sm:max-w-xs md:max-w-sm lg:max-w-md h-[18rem] sm:h-[24rem] md:h-[28rem] bg-[var(--secondary)] rounded-xl shadow-xl overflow-hidden"
            style={{ backgroundColor: "var(--secondary)" }}
          >
            <Chatbot
              config={{
                initialMessages: [
                  createChatBotMessage(
                    "Hello! I'm Eventopic's Assistant. Type 'enquiry' for event planning, 'job' for staff opportunities, or ask about 'budget' or 'date'.",
                    {}
                  ),
                ],
                botName: "Eventopic Bot",
                customStyles: {
                  botMessageBox: {
                    backgroundColor: "var(--accent)",
                  },
                  chatButton: {
                    backgroundColor: "var(--accent)",
                  },
                },
                widgets: [
                  {
                    widgetName: "eventTypeSelector",
                    widgetFunc: (props: { actions: Actions }) => (
                      <EventTypeSelector actions={props.actions} />
                    ),
                    props: {},
                    mapStateToProps: [],
                  },
                  {
                    widgetName: "roleSelector",
                    widgetFunc: (props: { actions: Actions }) => (
                      <RoleSelector actions={props.actions} />
                    ),
                    props: {},
                    mapStateToProps: [],
                  },
                ],
              }}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBotComponent;