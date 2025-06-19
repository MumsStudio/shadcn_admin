import { EditorContent } from '@tiptap/react';
import { useEditorContext } from '../EditorContext'
import EditorToolbar from './EditorToolbar';
import CommentsPanel from './CommentsPanel';


const EditorContentArea = () => {
  const { editor } = useEditorContext()

  return (
    <div className='ml-64 flex flex-1 justify-center p-4'>
      <div className='h-full w-full max-w-4xl overflow-auto p-4'>
        {editor && (
          <>
            <EditorToolbar />
            <EditorContent editor={editor} />
            <CommentsPanel />
          </>
        )}
      </div>
    </div>
  )
}

export default EditorContentArea