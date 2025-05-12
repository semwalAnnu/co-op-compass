'use client';

import { useState } from 'react';

interface UrlInputProps {
  onAddApplication: (jobTitle: string, company: string, url: string) => void;
}

export default function UrlInput({ onAddApplication }: UrlInputProps) {
    const [url, setUrl] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            onAddApplication(data.jobTitle, data.company, url);
            setUrl('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000); // Hide after 3 seconds
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="space-y-2">
            {success && (
                <div className="flex items-center text-sm text-green-400 mb-2 animate-fade-in">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Posting Added
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste job posting URL here..."
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                    Add
                </button>
            </form>
        </div>
    );
}