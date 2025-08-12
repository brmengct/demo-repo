import React, { useState } from 'react';
import { Plus, Calendar, Download, ArrowLeft } from 'lucide-react';

const LogItApp = () => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [entries, setEntries] = useState({
    restaurants: [],
    music: [],
    places: [],
    films: [],
    journal: [],
    ideas: []
  });
  const [newEntry, setNewEntry] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [placeStatus, setPlaceStatus] = useState('');
  const [placeVibe, setPlaceVibe] = useState('');
  const [placeBestFor, setPlaceBestFor] = useState('');
  const [placeBudget, setPlaceBudget] = useState('');

  const categories = [
    { id: 'restaurants', emoji: '🍽️', title: 'Favorite Restaurants', color: 'bg-orange-50' },
    { id: 'music', emoji: '🎵', title: 'Music Playlists', color: 'bg-purple-50' },
    { id: 'places', emoji: '✈️', title: 'Interesting Places', color: 'bg-blue-50' },
    { id: 'films', emoji: '🎬', title: 'Film Reviews', color: 'bg-green-50' },
    { id: 'journal', emoji: '📝', title: 'Reflective Journaling', color: 'bg-yellow-50' },
    { id: 'ideas', emoji: '💡', title: 'Ideas Left Unlogged', color: 'bg-pink-50' }
  ];

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      const entry = {
        id: Date.now(),
        content: newEntry,
        rating: rating,
        notes: notes,
        date: new Date().toLocaleDateString(),
        // Place-specific fields
        status: placeStatus,
        vibe: placeVibe,
        bestFor: placeBestFor,
        budget: placeBudget
      };
      
      setEntries(prev => ({
        ...prev,
        [selectedCategory]: [...prev[selectedCategory], entry]
      }));
      
      setNewEntry('');
      setRating(0);
      setNotes('');
      setPlaceStatus('');
      setPlaceVibe('');
      setPlaceBestFor('');
      setPlaceBudget('');
      setCurrentView('main');
    }
  };

  const generateWeeklySummary = async () => {
    const allEntries = Object.entries(entries).flatMap(([category, items]) => 
      items.map(item => ({ ...item, category }))
    );
    
    if (allEntries.length === 0) {
      alert('Add some entries first to generate a summary!');
      return;
    }

    try {
      const prompt = `Based on these life log entries, provide a warm, encouraging weekly summary that helps with self-awareness and mental health. Focus on patterns, growth, and positive insights:

${JSON.stringify(allEntries, null, 2)}

Respond with a JSON object in this format:
{
  "summary": "A warm, encouraging summary of the week's activities and patterns",
  "insights": "Key insights about preferences, mood, or growth",
  "encouragement": "Positive affirmation or gentle suggestion for the coming week"
}

Your entire response MUST be valid JSON only.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const responseText = data.content[0].text;
      const cleanedResponse = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const result = JSON.parse(cleanedResponse);
      
      setCurrentView('summary');
      setWeeklySummary(result);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Unable to generate summary right now. Please try again.');
    }
  };

  const [weeklySummary, setWeeklySummary] = useState(null);

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `log-it-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (currentView === 'add') {
    const category = categories.find(c => c.id === selectedCategory);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setCurrentView('main')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">{category?.emoji}</span>
                Add to {category?.title}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedCategory === 'restaurants' ? 'Restaurant Name' :
                   selectedCategory === 'music' ? 'Song/Album/Artist' :
                   selectedCategory === 'places' ? 'Place Name' :
                   selectedCategory === 'films' ? 'Film Title' :
                   selectedCategory === 'journal' ? 'Journal Entry' :
                   'Idea/Thought'}
                </label>
                <input
                  type="text"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={selectedCategory === 'journal' ? 'Write your thoughts...' : 'Enter details...'}
                />
              </div>

              {selectedCategory !== 'journal' && selectedCategory !== 'ideas' && selectedCategory !== 'places' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedCategory === 'places' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={placeStatus}
                      onChange={(e) => setPlaceStatus(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select status...</option>
                      <option value="been-there">📍 Been There</option>
                      <option value="want-to-visit">🎯 Want to Visit</option>
                      <option value="want-to-return">🔄 Want to Return</option>
                      <option value="hidden-gem">💫 Hidden Gem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vibe</label>
                    <select
                      value={placeVibe}
                      onChange={(e) => setPlaceVibe(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select vibe...</option>
                      <option value="cozy">🏠 Cozy</option>
                      <option value="energetic">⚡ Energetic</option>
                      <option value="peaceful">🌅 Peaceful</option>
                      <option value="inspiring">✨ Inspiring</option>
                      <option value="romantic">💕 Romantic</option>
                      <option value="adventurous">🏃 Adventurous</option>
                      <option value="artistic">🎨 Artistic</option>
                      <option value="historic">🏛️ Historic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Best For</label>
                    <select
                      value={placeBestFor}
                      onChange={(e) => setPlaceBestFor(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select best for...</option>
                      <option value="solo">👤 Solo</option>
                      <option value="date-night">💑 Date Night</option>
                      <option value="friends">👥 Friends</option>
                      <option value="family">👨‍👩‍👧‍👦 Family</option>
                      <option value="work">💼 Work/Business</option>
                      <option value="groups">👫 Large Groups</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                    <select
                      value={placeBudget}
                      onChange={(e) => setPlaceBudget(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select budget...</option>
                      <option value="budget">💰 Budget</option>
                      <option value="mid-range">💰💰 Mid-range</option>
                      <option value="splurge">💰💰💰 Splurge</option>
                      <option value="free">🆓 Free</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedCategory === 'places' ? 'What made this special?' : 'Notes'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  placeholder={selectedCategory === 'places' ? 'Describe your experience or memory...' : 'Any additional thoughts or details...'}
                />
              </div>

              <button
                onClick={handleAddEntry}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'summary' && weeklySummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setCurrentView('main')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Weekly Summary
              </h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">This Week's Journey</h3>
                <p className="text-blue-700">{weeklySummary.summary}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Key Insights</h3>
                <p className="text-green-700">{weeklySummary.insights}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Looking Forward</h3>
                <p className="text-purple-700">{weeklySummary.encouragement}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Log It</h1>
            <p className="text-gray-600">Your personal life tracker</p>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className={`${category.color} rounded-2xl p-4 border border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <span className="text-xl mr-2">{category.emoji}</span>
                      {category.title}
                    </h2>
                    <div className="space-y-1">
                      {entries[category.id]?.slice(-2).map((entry) => (
                        <div key={entry.id} className="bg-gray-200 h-4 rounded-full flex items-center px-3">
                          <span className="text-xs text-gray-600 truncate">
                            {entry.content} 
                            {entry.rating && ` (${entry.rating}⭐)`}
                            {entry.status && ` ${entry.status === 'been-there' ? '📍' : 
                                                  entry.status === 'want-to-visit' ? '🎯' : 
                                                  entry.status === 'want-to-return' ? '🔄' : '💫'}`}
                            {entry.vibe && ` ${entry.vibe === 'cozy' ? '🏠' : 
                                              entry.vibe === 'energetic' ? '⚡' : 
                                              entry.vibe === 'peaceful' ? '🌅' : 
                                              entry.vibe === 'inspiring' ? '✨' : 
                                              entry.vibe === 'romantic' ? '💕' : 
                                              entry.vibe === 'adventurous' ? '🏃' : 
                                              entry.vibe === 'artistic' ? '🎨' : '🏛️'}`}
                          </span>
                        </div>
                      ))}
                      {entries[category.id]?.length === 0 && (
                        <>
                          <div className="bg-gray-200 h-4 rounded-full"></div>
                          <div className="bg-gray-200 h-4 rounded-full w-3/4"></div>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentView('add');
                    }}
                    className="ml-4 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-indigo-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Weekly Summary
                  </h2>
                  <div className="space-y-1">
                    <div className="bg-gray-200 h-3 rounded-full"></div>
                    <div className="bg-gray-200 h-3 rounded-full w-2/3"></div>
                  </div>
                </div>
                <button
                  onClick={generateWeeklySummary}
                  className="ml-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogItApp;
