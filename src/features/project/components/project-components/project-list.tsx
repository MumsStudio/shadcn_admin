import ProjectCard from './project-card'

const ProjectList = ({
  projects,
  onCopyId,
  onExitProject,
  onEnterProject,
}: any) => {
  return (
    <div className='my-8'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>已加入项目</h2>
          <p className='text-muted-foreground text-sm'>
            共 {projects.length} 个项目
          </p>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project: any) => (
          <ProjectCard
            key={project.id}
            project={project}
            onCopyId={onCopyId}
            onExitProject={onExitProject}
            onEnterProject={onEnterProject}
          />
        ))}
      </div>
    </div>
  )
}

export default ProjectList
