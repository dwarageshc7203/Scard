import React from 'react';

interface ProblemsSolvedProps {
  problems: Record<string, number>;
}

const ProblemsSolved: React.FC<ProblemsSolvedProps> = ({ problems }) => {
  const platforms = Object.entries(problems || {});
  
  return (
    <div className="bg-surface/50 backdrop-blur-md rounded-2xl border border-border/40 p-6 flex flex-col min-h-[300px] shadow-sm">
      <h3 className="text-sm font-bold text-text mb-4">Problems Solved</h3>
      {platforms.length > 0 ? (
        <div className="flex-1 grid grid-cols-2 gap-4">
          {platforms.map(([platform, count], idx) => (
            <div key={idx} className="bg-surface rounded-xl p-4 border border-border/40 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-text mb-1">{count}</span>
              <span className="text-xs font-medium text-muted uppercase tracking-wider">{platform}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted text-center">No problems logged yet.</p>
        </div>
      )}
    </div>
  );
};

export default ProblemsSolved;
