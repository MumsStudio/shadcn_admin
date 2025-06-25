import { Button } from '@/components/ui/button'

export function PathNavigator({
  currentPath,
  documents,
  setCurrentPath,
  setCurrentDocuments,
}: {
  currentPath: any[]
  documents: any[]
  setCurrentPath: (path: any[]) => void
  setCurrentDocuments: (docs: any[]) => void
}) {
  return (
    <div className='ml-4 flex items-center gap-1 text-sm'>
      {currentPath.length > 0 && (
        <>
          <span
            className='cursor-pointer hover:text-blue-500'
            onClick={() => {
              setCurrentPath([])
              setCurrentDocuments(documents)
            }}
          >
            根目录
          </span>
          {currentPath.map((folder, index) => (
            <span key={folder.id}>
              <span className='mx-1'>/</span>
              <span
                className='cursor-pointer hover:text-blue-500'
                onClick={() => {
                  setCurrentPath(currentPath.slice(0, index + 1))
                  setCurrentDocuments(
                    index === 0
                      ? documents.find((d) => d.id === folder.id)?.children ||
                          []
                      : currentPath[index - 1].children?.find(
                          (d: any) => d.id === folder.id
                        )?.children || []
                  )
                }}
              >
                {folder.name}
              </span>
            </span>
          ))}
        </>
      )}
    </div>
  )
}
