import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { userListSchema } from './data/schema'
// import { users } from './data/users'
import Request from './request'

export default function Users() {
  const [userList, setUserList] = useState<any>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await Request._GetUsers()
        setUserList(userListSchema.parse(data.data))
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  // Parse user list

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs
        onSuccess={() => {
          console.log('success')
          const fetchUsers = async () => {
            try {
              const data = await Request._GetUsers()
              setUserList(userListSchema.parse(data.data))
            } catch (error) {
              console.error('Error fetching users:', error)
            }
          }
          fetchUsers()
        }}
      />
    </UsersProvider>
  )
}
