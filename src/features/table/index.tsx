import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { showErrorData, showSuccessData } from '@/utils/show-submitted-data';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { CreateTableDialog } from './components/dialog'
import Request from './request';


export default function Table() {
  const [tables, setTables] = useState<any[]>([
    // {
    //   id: '1',
    //   name: '项目规划',
    //   createdAt: '2023-05-15T10:30:00Z',
    //   updatedAt: '2023-05-20T14:15:00Z',
    // },
    // {
    //   id: '2',
    //   name: '产品设计',
    //   createdAt: '2023-06-02T09:45:00Z',
    //   updatedAt: '2023-06-10T16:20:00Z',
    // },
    // {
    //   id: '3',
    //   name: '开发任务',
    //   createdAt: '2023-06-15T13:00:00Z',
    //   updatedAt: '2023-06-18T11:30:00Z',
    // },
  ])
  useEffect(() => {
    getTables()
  }, [])
  const getTables = async () => {
    Request._GetTable().then((res: any) => {
      if (res.data) {
        setTables(res.data)
      }
    })
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const createNewTable = async (name: string) => {
    try {
      await Request._AddTable({ name: name }).then((res: any) => {
        if (res.data) {
          showSuccessData('create success')
        }
      })
      getTables()
    } catch (error) {
      showErrorData(`Error creating table: ${error}`)
      console.error('Error creating table:', error)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' /> New Table
            </Button>
            <CreateTableDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onSubmit={createNewTable}
            />
          </>
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tables</h2>
            <p className='text-muted-foreground'>
              Here's a list of your tables!
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={tables} columns={columns({ getTables })} />
        </div>
      </Main>
    </>
  )
}