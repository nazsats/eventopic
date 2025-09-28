
"use client";

import React, { useState, ReactNode } from "react";
import { createChatBotMessage } from "react-chatbot-kit";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import { toast } from "react-toastify";
import { FaComment } from "react-icons/fa";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface ChatBotMessage {
  message: string;
  type: string;
  widget?: string;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  mobile: string;
  message: string;
  eventType: string;
  role: string;
  experience: string;
}

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

interface ActionProviderProps {
  createChatBotMessage: (text: string, options?: { widget?: string }) => ChatBotMessage;
  setState: (updater: (prevState: { messages: ChatBotMessage[] }) => { messages: ChatBotMessage[] }) => void;
  children: ReactNode;
}

interface MessageParserProps {
  children: ReactNode;
  actions: Actions;
}

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring" as const, stiffness: 80 } },
  hover: {
    scale: 1.1,
    y: -5,
    boxShadow: "0 8px 24px rgba(0, 196, 180, 0.4)",
    backgroundColor: "var(--teal-accent)",
    borderColor: "var(--teal-accent)",
    transition: { duration: 0.3 },
  },
};

const containerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.2 } },
};

const ActionProvider: React.FC<ActionProviderProps> = ({ createChatBotMessage, setState, children }) => {
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

  const updateChatbotState = (message: ChatBotMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  const handleEnquiryStart = () => {
    setIsClientEnquiry(true);
    setCurrentStep(0);
    updateChatbotState(createChatBotMessage("Great! Let's start your enquiry. What's your full name?", { widget: "formStep" }));
  };

  const handleStaffApplication = () => {
    setIsClientEnquiry(false);
    setCurrentStep(0);
    updateChatbotState(createChatBotMessage("Awesome! Let's start your staff application. What's your full name?", { widget: "formStep" }));
  };

  const handleEventTypeSelected = (eventType: string) => {
    setFormData((prev) => ({ ...prev, eventType }));
    setCurrentStep((prev) => prev + 1);
    updateChatbotState(createChatBotMessage("Tell us about your event or any specific requirements.", { widget: "formStep" }));
  };

  const handleRoleSelected = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
    setCurrentStep((prev) => prev + 1);
    updateChatbotState(createChatBotMessage("Describe your relevant experience (optional).", { widget: "formStep" }));
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      const step = isClientEnquiry ? ["name", "email", "mobile", "eventType", "message"][currentStep - 1] : ["name", "email", "mobile", "role", "experience"][currentStep - 1];
      const prompts: { [key: string]: string } = {
        name: "What's your full name?",
        email: "What's your email address?",
        mobile: "Please provide your Dubai mobile number (05xxxxxxxx).",
        eventType: "Please select an event type:",
        role: "Please select a role:",
      };
      updateChatbotState(createChatBotMessage(prompts[step], { widget: step === "eventType" ? "eventTypeSelector" : step === "role" ? "roleSelector" : "formStep" }));
    }
  };

  const handleUserInput = (userInput: string) => {
    const step = isClientEnquiry ? ["name", "email", "mobile", "eventType", "message"][currentStep] : ["name", "email", "mobile", "role", "experience"][currentStep];
    setFormData((prev) => ({ ...prev, [step]: userInput }));

    if (step === "mobile" && !/^05\d{8}$/.test(userInput)) {
      updateChatbotState(createChatBotMessage("Please enter a valid Dubai mobile number (05xxxxxxxx). Try again.", { widget: "formStep" }));
      return;
    }

    if (currentStep < (isClientEnquiry ? 4 : 4)) {
      setCurrentStep((prev) => prev + 1);
      const nextStep = isClientEnquiry ? ["name", "email", "mobile", "eventType", "message"][currentStep + 1] : ["name", "email", "mobile", "role", "experience"][currentStep + 1];
      const prompts: { [key: string]: string } = {
        email: "What's your email address?",
        mobile: "Please provide your Dubai mobile number (05xxxxxxxx).",
        message: "Tell us about your event or any specific requirements.",
        experience: "Describe your relevant experience (optional).",
      };
      updateChatbotState(createChatBotMessage(prompts[nextStep] || "Next field?", { widget: nextStep === "eventType" ? "eventTypeSelector" : nextStep === "role" ? "roleSelector" : "formStep" }));
    } else {
      handleSubmit();
    }
  };

  const handleDefault = (message: string) => {
    const lowerMessage = message.toLowerCase();
    let botMessage: ChatBotMessage;
    if (lowerMessage.includes("budget")) {
      botMessage = createChatBotMessage("Could you share your approximate budget? This helps us tailor our recommendations!", {});
    } else if (lowerMessage.includes("date") || lowerMessage.includes("when")) {
      botMessage = createChatBotMessage("When are you planning your event? Share a date or timeframe, and I'll note it.", {});
    } else {
      botMessage = createChatBotMessage("I didn't quite catch that. Type 'enquiry' for event planning, 'job' for staff opportunities, or ask about 'budget' or 'date'.", {});
    }
    updateChatbotState(botMessage);
  };

  const handleSubmit = async () => {
    const requiredFields = isClientEnquiry ? ["name", "email", "mobile", "eventType", "message"] : ["name", "email", "mobile", "role"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof FormData]);
    if (missingFields.length > 0) {
      updateChatbotState(createChatBotMessage(`Please provide: ${missingFields.join(", ")}. Type 'back' to revise or continue.`, { widget: "formStep" }));
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
        toast.success(`${isClientEnquiry ? "Enquiry" : "Application"} submitted! We'll contact you soon.`);
        updateChatbotState(createChatBotMessage(`Thank you! Your ${isClientEnquiry ? "enquiry" : "application"} has been submitted. We'll reach out soon.`, {}));
        setFormData({ name: "", email: "", mobile: "", message: "", eventType: "", role: "", experience: "" });
        setCurrentStep(0);
      } else {
        updateChatbotState(createChatBotMessage(`Sorry, submission failed. Please try the ${isClientEnquiry ? "contact" : "staff"} form on our website.`, {}));
      }
    } catch (error) {
      console.error("Submission error:", error);
      updateChatbotState(createChatBotMessage("Error submitting. Please check your connection and try again.", {}));
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ actions: Actions }>, {
            actions: {
              handleEnquiryStart,
              handleStaffApplication,
              handleEventTypeSelected,
              handleRoleSelected,
              handleBack,
              handleUserInput,
              handleDefault,
              handleSubmit,
            },
          });
        }
        return child;
      })}
    </div>
  );
};

const MessageParser: React.FC<MessageParserProps> = ({ children, actions }) => {
  const parse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("back")) {
      actions.handleBack();
    } else if (lowerMessage.includes("enquiry") || lowerMessage.includes("client")) {
      actions.handleEnquiryStart();
    } else if (lowerMessage.includes("job") || lowerMessage.includes("staff")) {
      actions.handleStaffApplication();
    } else {
      actions.handleUserInput(message);
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ parse: (message: string) => void; actions: Actions }>, { parse, actions });
        }
        return child;
      })}
    </div>
  );
};

const EventTypeSelector = ({ actions }: { actions: { handleEventTypeSelected: (eventType: string) => void } }) => (
  <motion.div className="flex flex-wrap gap-3 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/30" variants={containerVariants} initial="hidden" animate="visible">
    {["Wedding", "Corporate", "Promotion", "Party", "Cultural"].map((type) => (
      <motion.button
        key={type}
        variants={buttonVariants}
        onClick={() => actions.handleEventTypeSelected(type)}
        className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
        style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
        aria-label={`Select event type: ${type}`}
      >
        {type}
        <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
      </motion.button>
    ))}
  </motion.div>
);

const RoleSelector = ({ actions }: { actions: { handleRoleSelected: (role: string) => void } }) => (
  <motion.div className="flex flex-wrap gap-3 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/30" variants={containerVariants} initial="hidden" animate="visible">
    {["Promoter", "Waitress", "Usher", "Volunteer", "Model"].map((role) => (
      <motion.button
        key={role}
        variants={buttonVariants}
        onClick={() => actions.handleRoleSelected(role.toLowerCase())}
        className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
        style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
        aria-label={`Select role: ${role}`}
      >
        {role}
        <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
      </motion.button>
    ))}
  </motion.div>
);

const ChatBotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50" aria-live="polite">
      <style jsx>{`
        .react-chatbot-kit-chat-bot-message {
          color: var(--white) !important;
        }
        .react-chatbot-kit-chat-btn {
          color: var(--white) !important;
        }
      `}</style>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-icon"
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
            style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
            aria-label="Open chatbot"
          >
            <FaComment size={24} />
            <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
          </motion.button>
        )}
        {isOpen && (
          <motion.div
            key="chatbot"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring" as const, stiffness: 100 }}
            className="w-full max-w-[90vw] sm:max-w-xs md:max-w-sm lg:max-w-md h-[70vh] sm:h-[80vh] bg-[var(--primary)]/80 rounded-2xl shadow-2xl overflow-hidden border border-[var(--light)]/30 backdrop-blur-sm"
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
                    backgroundColor: "var(--teal-accent)",
                  },
                },
                state: {
                  formData: {
                    name: "",
                    email: "",
                    mobile: "",
                    message: "",
                    eventType: "",
                    role: "",
                    experience: "",
                  },
                  currentStep: 0,
                  isClientEnquiry: true,
                },
                widgets: [
                  {
                    widgetName: "eventTypeSelector",
                    widgetFunc: (props: { actions: { handleEventTypeSelected: (eventType: string) => void } }) => <EventTypeSelector actions={props.actions} />,
                    props: {},
                    mapStateToProps: [],
                  },
                  {
                    widgetName: "roleSelector",
                    widgetFunc: (props: { actions: { handleRoleSelected: (role: string) => void } }) => <RoleSelector actions={props.actions} />,
                    props: {},
                    mapStateToProps: [],
                  },
                  {
                    widgetName: "formStep",
                    widgetFunc: (props: { state: { formData: FormData; currentStep: number; isClientEnquiry: boolean } }) => {
                      const steps = props.state.isClientEnquiry ? ["name", "email", "mobile", "eventType", "message"] : ["name", "email", "mobile", "role", "experience"];
                      const step = steps[props.state.currentStep];
                      const prompts: { [key: string]: string } = {
                        name: "What's your full name?",
                        email: "What's your email address?",
                        mobile: "Please provide your Dubai mobile number (05xxxxxxxx).",
                        message: "Tell us about your event or any specific requirements.",
                        experience: "Describe your relevant experience (optional).",
                      };
                      if (step === "eventType") return <EventTypeSelector actions={{ handleEventTypeSelected: (eventType: string) => (props.state.formData.eventType = eventType) }} />;
                      if (step === "role") return <RoleSelector actions={{ handleRoleSelected: (role: string) => (props.state.formData.role = role) }} />;
                      return (
                        <div className="p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/30">
                          <p className="text-lg font-body text-[var(--text-body)]">{prompts[step]}</p>
                          <input
                            type={step === "email" ? "email" : step === "mobile" ? "tel" : "text"}
                            value={props.state.formData[step as keyof FormData]}
                            onChange={(e) => (props.state.formData[step as keyof FormData] = e.target.value)}
                            className="w-full p-4 mt-2 rounded-lg text-lg font-body bg-[var(--primary)]/50 border border-[var(--light)]/30 text-[var(--text-body)] focus:ring-2 focus:ring-[var(--teal-accent)]/50 focus:outline-none transition-all duration-300"
                            placeholder={prompts[step]}
                            aria-label={prompts[step]}
                          />
                        </div>
                      );
                    },
                    props: {},
                    mapStateToProps: ["formData", "currentStep", "isClientEnquiry"],
                  },
                ],
              }}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
              headerText="Eventopic Assistant"
              placeholderText="Type your message..."
            />
            <motion.button
              variants={buttonVariants}
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group relative"
              style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
              aria-label="Close chatbot"
            >
              ×
              <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBotComponent;