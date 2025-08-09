import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Clock } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search for delicious food...',
  suggestions = [],
  recentSearches = []
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Memoize filtered suggestions to prevent unnecessary re-renders
  const filteredSuggestions = useMemo(() => {
    if (query.length > 0) {
      return suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
    }
    return [];
  }, [query]); // Removed suggestions dependency to prevent infinite re-renders

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery);
    setQuery(searchQuery);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    onSearch('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (query.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Recent Searches
              </h4>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {filteredSuggestions.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggestions</h4>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="font-medium">
                    {suggestion.substring(0, query.length)}
                  </span>
                  {suggestion.substring(query.length)}
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length > 0 && filteredSuggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p>No suggestions found</p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-2 text-green-600 hover:text-green-700 font-medium"
              >
                Search for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;