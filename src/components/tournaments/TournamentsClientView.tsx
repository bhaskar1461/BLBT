// src/components/tournaments/TournamentsClientView.tsx
'use client';

import React, { useState } from 'react';
import { TournamentCard } from './TournamentCard';
import { JoinTournamentModal } from './JoinTournamentModal';
import type { Tournament } from '@/lib/tournamentService';

interface TournamentsClientViewProps {
  tournaments: Tournament[];
}

export const TournamentsClientView: React.FC<TournamentsClientViewProps> = ({ tournaments }) => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const handleOpenJoin = (tournamentId: string) => {
    const t = tournaments.find((item) => item.id === tournamentId);
    if (t) {
      setSelectedTournament(t);
      setIsModalOpen(true);
    }
  };

  const handleRegisteredSuccess = () => {
    if (selectedTournament) {
      setRegisteredIds((prev) => [...prev, selectedTournament.id]);
    }
  };

  const activeTournaments = tournaments.filter((t) => t.status === 'active');
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming');
  const completedTournaments = tournaments.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-10">
      {/* Active Competitions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-bull animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-tight">Active Tournaments</h2>
          </div>
          <span className="text-xs text-muted font-mono">{activeTournaments.length} in progress</span>
        </div>

        {activeTournaments.length === 0 ? (
          <div className="p-8 text-center bg-panel border border-subtle rounded-xl text-muted text-xs">
            No active tournaments at this moment. Check upcoming events below.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeTournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onJoin={handleOpenJoin}
                isRegistered={registeredIds.includes(t.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Tournaments */}
      {upcomingTournaments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Upcoming Sprints</h2>
            </div>
            <span className="text-xs text-muted font-mono">
              {upcomingTournaments.length} open for pre-registration
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingTournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onJoin={handleOpenJoin}
                isRegistered={registeredIds.includes(t.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Tournaments */}
      {completedTournaments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-400">Completed & Archived</h2>
            <span className="text-xs text-faint font-mono">Ledger verified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-75">
            {completedTournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </section>
      )}

      {/* Join Modal */}
      {selectedTournament && (
        <JoinTournamentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tournament={selectedTournament}
          onRegisteredSuccess={handleRegisteredSuccess}
        />
      )}
    </div>
  );
};
