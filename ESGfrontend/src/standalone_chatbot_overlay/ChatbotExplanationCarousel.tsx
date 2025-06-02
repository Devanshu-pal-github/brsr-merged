import React, { useState } from 'react';
import { CarouselExplanationPayload } from './types/ChatbotOverlayTypes'; // Specific types
import { ChevronLeftIcon, ChevronRightIcon } from './icons/CoreIcons'; // Specific icons
import { renderMarkdown } from './utils/renderMarkdown'; // Specific markdown util

interface ChatbotExplanationCarouselProps {
  payload: CarouselExplanationPayload;
}

const ChatbotExplanationCarousel: React.FC<ChatbotExplanationCarouselProps> = ({ payload }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { slides } = payload;

  if (!slides || slides.length === 0) {
    return (
      <div className="my-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
        No details to display.
      </div>
    );
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="my-2.5 relative w-full bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
      <div className="p-4 min-h-[120px] max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-500">
        {currentSlide.title && (
          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1.5 break-words">
            {renderMarkdown(currentSlide.title)}
          </h4>
        )}
        <div className="text-xs text-slate-700 dark:text-slate-200 prose prose-xs dark:prose-invert max-w-none leading-relaxed">
          {renderMarkdown(currentSlide.text)}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
          <button
            onClick={goToPrevious}
            className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-slate-600 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <div className="flex space-x-1.5">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === slideIndex ? 'bg-blue-600 dark:bg-blue-400 scale-110' : 'bg-slate-300 dark:bg-slate-500 hover:bg-slate-400 dark:hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              />
            ))}
          </div>
          <button
            onClick={goToNext}
            className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-slate-600 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center py-1 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
        Slide {currentIndex + 1} of {slides.length}
      </div>
    </div>
  );
};

export default ChatbotExplanationCarousel;
