import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ExplanationCarousel = ({ payload }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = payload?.slides || [];

    if (!slides.length) {
        return <div className="text-gray-500 text-sm">No carousel content available.</div>;
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const renderText = (text) => {
        // Simple markdown-like rendering for bullet points
        return text.split('\n').map((line, index) => {
            if (line.startsWith('- ')) {
                return (
                    <li key={index} className="ml-4 list-disc">
                        {line.substring(2)}
                    </li>
                );
            }
            return <p key={index}>{line}</p>;
        });
    };

    return (
        <div className="w-full bg-gray-50 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={prevSlide}
                    className="p-2 text-gray-600 hover:text-blue-500 disabled:opacity-50"
                    disabled={slides.length <= 1}
                    aria-label="Previous slide"
                >
                    <FaChevronLeft className="w-5 h-5" />
                </button>
                <h4 className="text-lg font-semibold text-gray-800">
                    {slides[currentSlide].title}
                </h4>
                <button
                    onClick={nextSlide}
                    className="p-2 text-gray-600 hover:text-blue-500 disabled:opacity-50"
                    disabled={slides.length <= 1}
                    aria-label="Next slide"
                >
                    <FaChevronRight className="w-5 h-5" />
                </button>
            </div>
            <div className="text-sm text-gray-700">
                <ul>{renderText(slides[currentSlide].text)}</ul>
            </div>
            <div className="mt-3 text-xs text-gray-500">
                Slide {currentSlide + 1} of {slides.length}
            </div>
        </div>
    );
};

export default ExplanationCarousel;