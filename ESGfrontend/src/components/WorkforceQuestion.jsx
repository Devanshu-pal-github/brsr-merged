import React from 'react';
import QuestionItem from './QuestionItem';
import { useState } from "react";
import { ChevronDown, ChevronUp, User } from "lucide-react";

const WorkforceQuestion = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {children}
    </div>
  );
};

export default WorkforceQuestion;