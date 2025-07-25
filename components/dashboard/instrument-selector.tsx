'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, ChevronDown, ChevronUp, Check, Star, Coins } from 'lucide-react';

interface Instrument {
  id: string;
  name: string;
  symbol: string;
  type: string;
}

interface InstrumentSelectorProps {
  instruments: Instrument[];
  selectedInstrument: string;
  onInstrumentChange: (instrumentId: string) => void;
}

export function InstrumentSelector({ 
  instruments, 
  selectedInstrument, 
  onInstrumentChange 
}: InstrumentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('hyperliquid-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('hyperliquid-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const selectedInstrumentData = instruments.find(instrument => instrument.id === selectedInstrument);

  const filteredInstruments = useMemo(() => {
    if (!searchTerm) return instruments;
    
    return instruments.filter(instrument => 
      instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrument.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [instruments, searchTerm]);

  const favoriteInstruments = useMemo(() => {
    return instruments.filter(instrument => favorites.includes(instrument.id));
  }, [instruments, favorites]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (instrumentId: string) => {
    onInstrumentChange(instrumentId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleFavorite = (instrumentId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent dropdown from closing
    setFavorites(prev => 
      prev.includes(instrumentId) 
        ? prev.filter(id => id !== instrumentId)
        : [...prev, instrumentId]
    );
  };

  const isFavorite = (instrumentId: string) => favorites.includes(instrumentId);

  return (
    <div className="flex gap-6">
      {/* Main Dropdown */}
      <Card className="flex-1 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Filter className="h-5 w-5 text-blue-400" />
            </div>
            Trading Pairs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={dropdownRef}>
            {/* Dropdown Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <span className="text-sm font-medium">
                {selectedInstrumentData ? selectedInstrumentData.symbol : 'All Pairs'}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 max-h-60 overflow-hidden">
                {/* Search Input */}
                <div className="p-3 border-b border-gray-600">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search trading pairs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto">
                  {/* All Pairs Option */}
                  <button
                    onClick={() => handleSelect('')}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-700 transition-colors duration-200 ${
                      selectedInstrument === '' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-200'
                    }`}
                  >
                    <span className="font-medium">All Pairs</span>
                    {selectedInstrument === '' && <Check className="h-4 w-4" />}
                  </button>
                  {/* Instrument Options */}
                  {filteredInstruments.map((instrument) => (
                    <button
                      key={instrument.id}
                      onClick={() => handleSelect(instrument.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-700 transition-colors duration-200 ${
                        selectedInstrument === instrument.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-1 bg-gray-600 rounded">
                          <Coins className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">{instrument.symbol}</span>
                          <span className="text-xs text-gray-400">{instrument.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleFavorite(instrument.id, e)}
                          className={`p-1 rounded hover:bg-gray-600 transition-colors duration-200 ${
                            isFavorite(instrument.id) ? 'text-yellow-400' : 'text-gray-400'
                          }`}
                        >
                          <Star className={`h-4 w-4 ${isFavorite(instrument.id) ? 'fill-current' : ''}`} />
                        </button>
                        {selectedInstrument === instrument.id && <Check className="h-4 w-4" />}
                      </div>
                    </button>
                  ))}
                  {filteredInstruments.length === 0 && searchTerm && (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      No trading pairs found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Favorites Section */}
      {favoriteInstruments.length > 0 && (
        <Card className="w-auto bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-bold">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {favoriteInstruments.map((instrument) => (
                <button
                  key={instrument.id}
                  onClick={() => onInstrumentChange(instrument.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                    selectedInstrument === instrument.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                  }`}
                >
                  <span className="font-semibold">{instrument.symbol}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(instrument.id, e);
                    }}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 