import React, { useState } from 'react';
import { Project } from '../types';
import { ArrowLeft, ArrowRight, X, ExternalLink, Code } from 'lucide-react';

interface ProjectShowcaseProps {
  projects: Project[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({ projects, isExpanded, onToggleExpand }) => {
  const [showAll, setShowAll] = useState(false);
  const displayProjects = isExpanded ? projects : (projects ? projects.slice(0, 2) : []);
  const hasMore = !isExpanded && projects && projects.length > 2;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {projects && projects.length > 0 ? (
        <div className={`w-full flex-1 ${isExpanded ? 'grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[500px]' : 'flex flex-col justify-center gap-4'}`}>
          {displayProjects.map((project, idx) => (
            <div key={idx} className={`bg-surface rounded-xl border border-border/40 hover:border-border transition-colors ${isExpanded ? 'p-6 flex flex-col h-full' : 'p-4 flex flex-col justify-center'}`}>
              
              {/* Header: Image + Title */}
              <div className={`flex items-center gap-3 ${isExpanded ? 'mb-4' : 'justify-center'}`}>
                {/* Image Rendering */}
                {project.projectImageBase64 && (
                  <div className={`flex-shrink-0 overflow-hidden rounded-lg border border-border/50 bg-surface-2 ${isExpanded ? 'w-16 h-16' : 'w-10 h-10'}`}>
                    <img src={project.projectImageBase64} alt={project.name} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                  </div>
                )}
                
                {/* Title */}
                <span className={`font-bold text-text block ${isExpanded ? 'text-lg text-left' : 'text-sm'}`}>
                  {project.name}
                </span>
              </div>

              {/* Expanded Description & Links */}
              {isExpanded && (
                <>
                  <p className="text-sm text-muted leading-relaxed flex-1 text-left mb-4">
                    {project.description}
                  </p>
                  <div className="flex gap-3 mt-auto">
                    {(project.url || project.projectUrl) && (
                      <a href={project.url || project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Live
                      </a>
                    )}
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold bg-surface-2 text-text hover:bg-border px-3 py-1.5 rounded-lg transition-colors">
                        <Code className="w-3.5 h-3.5" /> Repo
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border/40 hover:border-muted hover:shadow-lg transition-all duration-300 text-xs font-bold text-muted hover:text-text"
            >
              Show {projects.length - 2} More <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted text-center">No projects to showcase yet.</p>
        </div>
      )}

      {showAll && !isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={() => setShowAll(false)}>
          <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col gap-6 w-full max-w-2xl max-h-[85vh] shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAll(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-2 text-muted hover:text-text transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-text text-xl w-full text-center">All Projects</h3>
            <div className="flex flex-col gap-4 overflow-y-auto p-2 custom-scrollbar">
              {projects.map((project, idx) => (
                <div key={idx} className="bg-surface-2 rounded-xl p-4 border border-border/40 hover:border-border transition-colors text-center">
                  {project.projectImage && (
                    <div className="w-full overflow-hidden rounded-lg bg-surface h-24 mb-3">
                      <img src={project.projectImage} alt={project.name} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {project.url || project.projectUrl ? (
                    <a href={project.url || project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent hover:underline block mb-1">
                      {project.name}
                    </a>
                  ) : (
                    <span className="text-sm font-bold text-text block mb-1">
                      {project.name}
                    </span>
                  )}
                  <p className="text-xs text-muted leading-relaxed">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectShowcase;
