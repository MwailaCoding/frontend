import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SimpleSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SimpleSearchBar: React.FC<SimpleSearchBarProps> = ({
  onSearch,
  placeholder = 'Search for delicious food...'
}) => {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery);
    setQuery(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SimpleSearchBar; 