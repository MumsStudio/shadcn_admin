import { FileText, Folder, Plus, Upload } from 'lucide-react'
export const documentTypes = [
  {
    label: 'folder',
    value: 'folder',
    icon: Folder,
  },
  {
    label: 'file',
    value: 'file',
    icon: FileText,
  },
] as const