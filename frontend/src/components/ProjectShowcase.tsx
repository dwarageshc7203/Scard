import React from 'react';
import { Project } from '../types';

interface ProjectShowcaseProps {
  projects: Project[];
}

const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({ projects }) => {
  return (
    <div className="bg-surface/50 backdrop-blur-md rounded-2xl border border-border/40 p-6 flex flex-col min-h-[300px] shadow-sm">
      <h3 className="text-sm font-bold text-text mb-4">Project Showcase</h3>
      {projects && projects.length > 0 ? (
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {projects.map((project, idx) => (
            <div key={idx} className="bg-surface rounded-xl p-4 border border-border/40 hover:border-border transition-colors">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent hover:underline block mb-1">
                  {project.name}
                </a>
              ) : (
                <span className="text-sm font-bold text-text block mb-1">
                  {project.name}
                </span>
              )}
              <p className="text-xs text-muted leading-relaxed line-clamp-3">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted text-center">No projects to showcase yet.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectShowcase;
