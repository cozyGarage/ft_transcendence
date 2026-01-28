import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { playerApi } from '@/api/player';
import { Avatar, Spinner } from '@/components/ui';
import type { Player } from '@/types';

interface SearchBarProps {
  onClose: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const searchPlayers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const players = await playerApi.searchPlayers(query);
        setResults(players);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchPlayers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectPlayer = (username: string) => {
    setShowResults(false);
    onClose();
    navigate(`/profile/${username}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          placeholder="Search players..."
          className="w-full pl-10 pr-10 py-2 bg-dark-100 border border-primary rounded-lg 
                     text-white placeholder-gray-500 outline-none"
        />
        <button
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Results Dropdown */}
      {showResults && (query.length >= 2 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-50 border border-dark-200 
                        rounded-lg shadow-lg overflow-hidden z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((player) => (
                <li key={player.id}>
                  <button
                    onClick={() => handleSelectPlayer(player.user.username)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-dark-100 
                               transition-colors text-left"
                  >
                    <Avatar
                      src={player.user.avatar}
                      alt={player.user.username}
                      size="sm"
                      league={player.stats.league}
                    />
                    <div>
                      <p className="text-white font-medium">{player.user.username}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {player.stats.league} • Rank #{player.stats.rank}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No players found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
