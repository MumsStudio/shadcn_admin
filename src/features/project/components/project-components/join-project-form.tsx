import { showErrorData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn } from 'lucide-react'

const JoinProjectForm = ({ projectId, setProjectId, onJoinProject }: any) => {
  const handleInputChange = (e:any) => {
    setProjectId(e.target.value)
  }

  const handleJoinClick = () => {
    if (!projectId.trim()) {
      showErrorData('Please enter a project ID')
      return
    }
    onJoinProject()
  }

  return (
    <div className='mb-8'>
      <div className='mb-4'>
        <h2 className='mb-2 text-xl font-semibold'>加入项目</h2>
        <p className='text-muted-foreground mb-4 text-sm'>
          输入项目ID加入已有项目
        </p>
      </div>
      <div className='flex w-full max-w-md items-center space-x-2'>
        <Input
          type='text'
          placeholder='输入项目ID'
          value={projectId}
          onChange={handleInputChange}
        />
        <Button onClick={handleJoinClick}>
          <LogIn className='mr-2 h-4 w-4' /> 加入
        </Button>
      </div>
    </div>
  )
}

export default JoinProjectForm
