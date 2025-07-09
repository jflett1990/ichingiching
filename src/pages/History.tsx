import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useAppState, usePremiumFeatures } from '../store/AppStateProvider';
import LiquidGlassCard from '../components/ui/LiquidGlassCard';
import { LoadingScreen } from '../components/ui/LoadingScreen';

interface FilterState {
  searchTerm: string;
  timeRange: 'all' | '7d' | '30d' | '90d' | '1y';
  hexagrams: number[];
  tags: string[];
  favorites: boolean;
  sortBy: 'date' | 'hexagram' | 'question';
  sortOrder: 'asc' | 'desc';
}

const HistoryPage: React.FC = () => {
  const { currentTheme } = useTheme();
  const { user, readings, updateReading, deleteReading, trackEvent } = useAppState();
  const premiumFeatures = usePremiumFeatures();
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    timeRange: 'all',
    hexagrams: [],
    tags: [],
    favorites: false,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [selectedReadings, setSelectedReadings] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPatterns, setShowPatterns] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort readings
  const filteredReadings = useMemo(() => {
    let filtered = readings;

    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(reading => 
        reading.question.toLowerCase().includes(searchLower) ||
        reading.interpretation.toLowerCase().includes(searchLower) ||
        reading.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const timeMs = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000,
      };
      const cutoff = new Date(now.getTime() - timeMs[filters.timeRange]);
      filtered = filtered.filter(reading => new Date(reading.timestamp) >= cutoff);
    }

    // Hexagram filter
    if (filters.hexagrams.length > 0) {
      filtered = filtered.filter(reading => 
        filters.hexagrams.includes(reading.hexagram.primaryNumber)
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(reading =>
        filters.tags.some(tag => reading.tags.includes(tag))
      );
    }

    // Favorites filter
    if (filters.favorites) {
      filtered = filtered.filter(reading => reading.favorite);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'hexagram':
          comparison = a.hexagram.primaryNumber - b.hexagram.primaryNumber;
          break;
        case 'question':
          comparison = a.question.localeCompare(b.question);
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [readings, filters]);

  // Pattern analysis (Premium feature)
  const patterns = useMemo(() => {
    if (!premiumFeatures.isPremium || !showPatterns) return null;

    const hexagramFrequency = readings.reduce((acc, reading) => {
      acc[reading.hexagram.primaryNumber] = (acc[reading.hexagram.primaryNumber] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const tagFrequency = readings.reduce((acc, reading) => {
      reading.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const timePatterns = readings.reduce((acc, reading) => {
      const hour = new Date(reading.timestamp).getHours();
      const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      hexagramFrequency,
      tagFrequency,
      timePatterns,
      totalReadings: readings.length,
      favoriteCount: readings.filter(r => r.favorite).length,
    };
  }, [readings, premiumFeatures.isPremium, showPatterns]);

  // Available tags from all readings
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    readings.forEach(reading => {
      reading.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [readings]);

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedReadings.size === 0) return;
    
    setIsLoading(true);
    try {
      for (const id of selectedReadings) {
        await deleteReading(id);
      }
      setSelectedReadings(new Set());
      trackEvent('bulk_delete', { count: selectedReadings.size });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkToggleFavorite = async () => {
    if (selectedReadings.size === 0) return;
    
    setIsLoading(true);
    try {
      for (const id of selectedReadings) {
        const reading = readings.find(r => r.id === id);
        if (reading) {
          await updateReading(id, { favorite: !reading.favorite });
        }
      }
      setSelectedReadings(new Set());
      trackEvent('bulk_favorite', { count: selectedReadings.size });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReadingSelection = (id: string) => {
    const newSelection = new Set(selectedReadings);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedReadings(newSelection);
  };

  if (isLoading) {
    return <LoadingScreen theme={currentTheme} message="Processing..." />;
  }

  if (readings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LiquidGlassCard size="lg" className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">No Readings Yet</h2>
          <p className="opacity-80 mb-6">
            Your divination history will appear here after you complete your first reading.
          </p>
          <Link to="/divination" className="btn-premium">
            Start Your First Reading
          </Link>
        </LiquidGlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <LiquidGlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 
                  className="text-3xl font-bold gradient-text mb-2"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  Reading History
                </h1>
                <p className="opacity-80">
                  {readings.length} total readings • {filteredReadings.length} shown
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {premiumFeatures.isPremium && (
                  <button
                    onClick={() => setShowPatterns(!showPatterns)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      showPatterns ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10'
                    }`}
                  >
                    📊 {showPatterns ? 'Hide' : 'Show'} Patterns
                  </button>
                )}
                
                <Link to="/divination" className="btn-premium">
                  ✨ New Reading
                </Link>
              </div>
            </div>

            {/* Search and Filters */}
            <SearchAndFilters
              filters={filters}
              setFilters={setFilters}
              availableTags={availableTags}
              theme={currentTheme}
              isPremium={premiumFeatures.isPremium}
            />
          </LiquidGlassCard>
        </div>

        {/* Pattern Analysis (Premium) */}
        {showPatterns && patterns && (
          <div className="mb-8">
            <PatternAnalysis patterns={patterns} theme={currentTheme} />
          </div>
        )}

        {/* Bulk Actions */}
        {selectedReadings.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <LiquidGlassCard className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {selectedReadings.size} reading{selectedReadings.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkToggleFavorite}
                    className="px-4 py-2 text-sm rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                  >
                    ⭐ Toggle Favorites
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 text-sm rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => setSelectedReadings(new Set())}
                    className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* View Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'grid' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10'
              }`}
            >
              List
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-1 rounded bg-white/10 text-sm"
            >
              <option value="date">Date</option>
              <option value="hexagram">Hexagram</option>
              <option value="question">Question</option>
            </select>
            <button
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="px-2 py-1 rounded bg-white/10 text-sm hover:bg-white/20"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Readings Display */}
        <AnimatePresence mode="wait">
          {filteredReadings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LiquidGlassCard className="p-8 text-center">
                <span className="text-4xl mb-4 block">🔍</span>
                <h3 className="text-xl font-semibold mb-2">No readings found</h3>
                <p className="opacity-80">Try adjusting your search criteria or filters.</p>
              </LiquidGlassCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {viewMode === 'grid' ? (
                <ReadingGrid
                  readings={filteredReadings}
                  selectedReadings={selectedReadings}
                  onToggleSelection={toggleReadingSelection}
                  onUpdateReading={updateReading}
                  theme={currentTheme}
                />
              ) : (
                <ReadingList
                  readings={filteredReadings}
                  selectedReadings={selectedReadings}
                  onToggleSelection={toggleReadingSelection}
                  onUpdateReading={updateReading}
                  theme={currentTheme}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Search and Filters Component
const SearchAndFilters: React.FC<{
  filters: FilterState;
  setFilters: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
  availableTags: string[];
  theme: any;
  isPremium: boolean;
}> = ({ filters, setFilters, availableTags, theme, isPremium }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      {/* Basic Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search questions, interpretations, or tags..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filters.timeRange}
          onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {showAdvanced ? 'Less' : 'More'} Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag)
                          ? prev.tags.filter(t => t !== tag)
                          : [...prev.tags, tag]
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="favorites"
              checked={filters.favorites}
              onChange={(e) => setFilters(prev => ({ ...prev, favorites: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="favorites" className="text-sm">Show only favorites</label>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              onClick={() => setFilters({
                searchTerm: '',
                timeRange: 'all',
                hexagrams: [],
                tags: [],
                favorites: false,
                sortBy: 'date',
                sortOrder: 'desc',
              })}
              className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20"
            >
              Clear All Filters
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Pattern Analysis Component (Premium)
const PatternAnalysis: React.FC<{ patterns: any; theme: any }> = ({ patterns, theme }) => (
  <LiquidGlassCard className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <span className="text-yellow-400">✨</span>
      <h3 className="text-xl font-semibold">Pattern Analysis</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Stats */}
      <div className="space-y-3">
        <h4 className="font-medium">Overview</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm opacity-70">Total Readings</span>
            <span className="font-semibold">{patterns.totalReadings}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm opacity-70">Favorites</span>
            <span className="font-semibold">{patterns.favoriteCount}</span>
          </div>
        </div>
      </div>

      {/* Top Hexagrams */}
      <div className="space-y-3">
        <h4 className="font-medium">Frequent Hexagrams</h4>
        <div className="space-y-2">
          {Object.entries(patterns.hexagramFrequency)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([hexagram, count]) => (
              <div key={hexagram} className="flex justify-between">
                <span className="text-sm opacity-70">#{hexagram}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Time Patterns */}
      <div className="space-y-3">
        <h4 className="font-medium">Time Patterns</h4>
        <div className="space-y-2">
          {Object.entries(patterns.timePatterns)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .map(([time, count]) => (
              <div key={time} className="flex justify-between">
                <span className="text-sm opacity-70 capitalize">{time}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Top Tags */}
      <div className="space-y-3">
        <h4 className="font-medium">Common Tags</h4>
        <div className="space-y-2">
          {Object.entries(patterns.tagFrequency)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([tag, count]) => (
              <div key={tag} className="flex justify-between">
                <span className="text-sm opacity-70">{tag}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  </LiquidGlassCard>
);

// Reading Grid Component
const ReadingGrid: React.FC<{
  readings: any[];
  selectedReadings: Set<string>;
  onToggleSelection: (id: string) => void;
  onUpdateReading: (id: string, updates: any) => void;
  theme: any;
}> = ({ readings, selectedReadings, onToggleSelection, onUpdateReading, theme }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {readings.map(reading => (
      <ReadingCard
        key={reading.id}
        reading={reading}
        isSelected={selectedReadings.has(reading.id)}
        onToggleSelection={() => onToggleSelection(reading.id)}
        onUpdateReading={onUpdateReading}
        theme={theme}
      />
    ))}
  </div>
);

// Reading List Component
const ReadingList: React.FC<{
  readings: any[];
  selectedReadings: Set<string>;
  onToggleSelection: (id: string) => void;
  onUpdateReading: (id: string, updates: any) => void;
  theme: any;
}> = ({ readings, selectedReadings, onToggleSelection, onUpdateReading, theme }) => (
  <div className="space-y-4">
    {readings.map(reading => (
      <ReadingListItem
        key={reading.id}
        reading={reading}
        isSelected={selectedReadings.has(reading.id)}
        onToggleSelection={() => onToggleSelection(reading.id)}
        onUpdateReading={onUpdateReading}
        theme={theme}
      />
    ))}
  </div>
);

// Reading Card Component
const ReadingCard: React.FC<{
  reading: any;
  isSelected: boolean;
  onToggleSelection: () => void;
  onUpdateReading: (id: string, updates: any) => void;
  theme: any;
}> = ({ reading, isSelected, onToggleSelection, onUpdateReading, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="relative"
  >
    <LiquidGlassCard 
      className={`p-6 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onToggleSelection}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold mb-2 line-clamp-2">{reading.question}</h3>
          <p className="text-sm opacity-70">
            {new Date(reading.timestamp).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-400">
            #{reading.hexagram.primaryNumber}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateReading(reading.id, { favorite: !reading.favorite });
            }}
            className={`p-1 rounded transition-colors ${
              reading.favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
            }`}
          >
            ⭐
          </button>
        </div>
      </div>
      
      <p className="text-sm opacity-80 line-clamp-3 mb-4">
        {reading.interpretation}
      </p>
      
      {reading.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {reading.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-white/10"
            >
              {tag}
            </span>
          ))}
          {reading.tags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-white/10">
              +{reading.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </LiquidGlassCard>
  </motion.div>
);

// Reading List Item Component
const ReadingListItem: React.FC<{
  reading: any;
  isSelected: boolean;
  onToggleSelection: () => void;
  onUpdateReading: (id: string, updates: any) => void;
  theme: any;
}> = ({ reading, isSelected, onToggleSelection, onUpdateReading, theme }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ scale: 1.01 }}
  >
    <LiquidGlassCard 
      className={`p-4 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onToggleSelection}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-blue-400 min-w-0">
              #{reading.hexagram.primaryNumber}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{reading.question}</h3>
              <p className="text-sm opacity-70">
                {new Date(reading.timestamp).toLocaleDateString()} • 
                {reading.interpretation.slice(0, 100)}...
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {reading.tags.length > 0 && (
            <div className="flex gap-1">
              {reading.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateReading(reading.id, { favorite: !reading.favorite });
            }}
            className={`p-1 rounded transition-colors ${
              reading.favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
            }`}
          >
            ⭐
          </button>
        </div>
      </div>
    </LiquidGlassCard>
  </motion.div>
);

export default HistoryPage;