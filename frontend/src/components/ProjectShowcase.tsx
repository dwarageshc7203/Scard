import React from "react"
import { Project } from "../types"
import { ArrowRight, ExternalLink, Code, Briefcase } from "lucide-react"
import Image from "./ui/Image"

interface ProjectShowcaseProps {
  projects: Project[]
  isExpanded?: boolean
  onToggleExpand?: () => void
}

const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({
  projects,
  isExpanded,
  onToggleExpand,
}) => {
  const displayProjects = isExpanded
    ? projects
    : projects
      ? projects.slice(0, 2)
      : []
  const hasMore = !isExpanded && projects && projects.length > 2

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {projects && projects.length > 0 ? (
        <div
          className={`w-full flex-1 ${
            isExpanded
              ? "grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[500px] max-w-4xl mx-auto p-4"
              : "flex flex-col justify-center gap-4"
          }`}
        >
          {displayProjects.map((project, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (!isExpanded && onToggleExpand) onToggleExpand()
              }}
              className={`bg-surface rounded-xl border border-transparent hover:border-border transition-colors cursor-pointer ${
                isExpanded
                  ? "p-6 flex flex-col h-full"
                  : "p-3 flex flex-row items-center justify-start gap-4"
              }`}
            >
              {/* Header: Image + Title */}
              <div
                className={`flex items-center gap-3 ${
                  isExpanded ? "mb-4" : ""
                }`}
              >
                {/* Image Rendering */}
                {project.projectImageBase64 && (
                  <div
                    className={`flex-shrink-0 overflow-hidden rounded-lg border border-border/50 bg-surface-2 ${
                      isExpanded ? "w-16 h-16" : "w-12 h-12"
                    }`}
                  >
                    <Image
                      src={project.projectImageBase64}
                      alt={project.name}
                      className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}

                {/* Title and Description in normal view */}
                {!isExpanded && (
                  <div className="flex flex-col flex-1 text-left">
                    <span className="text-text block text-sm">
                      {project.name}
                    </span>
                    <span className="text-muted text-xs line-clamp-1 mt-0.5">
                      {project.description || "No description provided."}
                    </span>
                  </div>
                )}

                {/* Title only in expanded view (it has its own description area below) */}
                {isExpanded && (
                  <span className="text-text block text-lg text-left">
                    {project.name}
                  </span>
                )}
              </div>

              {/* Expanded Description & Links */}
              {isExpanded && (
                <>
                  <p className="text-sm text-muted leading-relaxed flex-1 text-left mb-4">
                    {project.description}
                  </p>
                  <div className="flex gap-3 mt-auto">
                    {(project.url || project.projectUrl) && (
                      <a
                        href={project.url || project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Live
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-surface-2 text-text hover:bg-border px-3 py-1.5 rounded-lg transition-colors"
                      >
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
              onClick={() => {
                if (onToggleExpand) onToggleExpand()
              }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border/40 hover:border-muted hover:shadow-lg transition-all duration-300 text-xs text-muted hover:text-text"
            >
              Show {projects.length - 2} More{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center h-full text-center ${isExpanded ? 'p-8 mt-8' : 'p-6'} bg-surface-2/30 rounded-xl border border-dashed border-border/50 w-full`}>
          <div className={`${isExpanded ? 'w-16 h-16 mb-4' : 'w-10 h-10 mb-3'} rounded-full bg-surface-2 flex items-center justify-center border border-border/50`}>
            <Briefcase className={`${isExpanded ? 'w-8 h-8 opacity-50' : 'w-5 h-5'} text-muted-foreground`} />
          </div>
          <h3 className={`${isExpanded ? 'text-lg mb-2' : 'text-sm'} font-medium text-text`}>No Projects Yet</h3>
          <p className={`${isExpanded ? 'text-sm max-w-sm' : 'text-xs max-w-[200px] mt-1'} text-muted`}>
            Add some projects to your profile to showcase your work and attract more viewers.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProjectShowcase
