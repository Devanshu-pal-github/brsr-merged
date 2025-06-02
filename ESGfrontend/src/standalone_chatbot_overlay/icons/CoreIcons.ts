import React from 'react';

interface IconProps {
  className?: string;
}

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className || "w-6 h-6"
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L15.404 12.813a4.5 4.5 0 00-3.09 3.09L11.25 18.75l.813-2.846a4.5 4.5 0 003.09-3.09L18.75 12l-2.846-.813a4.5 4.5 0 00-3.09-3.09L11.25 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L18.25 12z"
    })
  )
);

export const XIcon: React.FC<IconProps> = ({ className }) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className || "w-6 h-6"
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M6 18L18 6M6 6l12 12"
    })
  )
);

export const ChatBubbleLeftEllipsisIcon: React.FC<IconProps> = ({ className }) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className || "w-6 h-6"
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.861 8.25-8.625 8.25C11.024 20.25 9.83 19.816 8.813 19.125l-4.35 1.45a.75.75 0 01-.957-.957l1.45-4.35A8.193 8.193 0 013 12.375C3 7.819 6.861 4.125 11.625 4.125S20.25 7.819 20.25 12.375H21z"
    })
  )
);

export const PaperAirplaneIcon: React.FC<IconProps> = ({ className }) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className || "w-6 h-6"
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    })
  )
);

export const ClipboardDocumentIcon: React.FC<IconProps> = ({ className }) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className || "w-6 h-6"
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"
    })
  )
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className }) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className || "w-6 h-6"
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M15.75 19.5L8.25 12l7.5-7.5"
    })
  )
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: className || "w-6 h-6"
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M8.25 4.5l7.5 7.5-7.5 7.5"
    })
  )
);
// Add other icons if ChatbotOverlay comes to use them, e.g. LightBulbIcon, QuestionMarkCircleIcon if proactive chits were part of it.
// For now, keeping it minimal to the direct needs of ChatbotOverlay and ExplanationCarousel.
