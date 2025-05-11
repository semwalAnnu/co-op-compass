'use client';

import { useState } from 'react';

export default function UrlInput() {
    const [url, setUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Add API call to process URL
        console.log('Submitted URL:', url);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="flex gap-2">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste job posting URL here..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                    Add
                </button>
            </div>
        </form>
    );
}