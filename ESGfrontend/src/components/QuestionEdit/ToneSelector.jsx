import React from 'react';

const ToneSelector = ({ refineTone, setRefineTone, handleRefineDraftWithTone, currentValue, selectedTextInTextarea, isLoading }) => {
    const tones = ['concise', 'formal', 'detailed'];

    return (
        <div className="border border-blue-200 rounded-lg p-4 bg-white">
            <button
                onClick={handleRefineDraftWithTone}
                disabled={isLoading || (!currentValue?.trim() && !selectedTextInTextarea)}
                className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all disabled:opacity-50 mb-3 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Refine draft with selected tone"
            >
                Refine Draft with Tone
            </button>
            <div className="flex space-x-2">
                {tones.map(tone => (
                    <button
                        key={tone}
                        onClick={() => setRefineTone(tone)}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all border border-blue-200 ${refineTone === tone
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        aria-label={`Set tone to ${tone}`}
                    >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ToneSelector;