import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentActionDialog } from '../option';


export function ActionBar({
  isDialogOpen,
  setIsDialogOpen,
  documents,
  selectedDocument,
  getDocuments,
  setSelectedDocument,
}: {
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  documents: any[]
  selectedDocument: string | null
  getDocuments: () => void
  setSelectedDocument: (id: string | null) => void
}) {
  return (
    <div className='flex items-center gap-2'>
      <Button
        size='lg'
        className='border-gray-400 text-[1rem]'
        variant='outline'
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus size={30} className='mr-1 border-gray-400' />
        新建
      </Button>

      <DocumentActionDialog
        open={isDialogOpen}
        documents={documents}
        onOpenChange={setIsDialogOpen}
        onClose={() => {
          const firstFolder = documents.find((doc) => doc.type === 'folder')
          if (firstFolder) {
            setSelectedDocument(firstFolder.id)
          }
        }}
        onSuccess={getDocuments}
        parentId={selectedDocument ?? undefined}
      />
      <Button
        size='lg'
        variant='outline'
        className='border-gray-400 text-[1rem]'
      >
        <Upload size={24} className='mr-1' />
        上传
      </Button>
      <Button
        size='lg'
        variant='outline'
        className='border-gray-400 text-[1rem]'
      >
        模板库
      </Button>
    </div>
  )
}