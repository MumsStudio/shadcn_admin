import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data'
import Request from './request'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [username, setUsername] = useState('')
  useEffect(() => {
    Request._GetAccount().then((res: any) => {
      if (res.data) {
        const user = res.data.user
        if (user && user.username) {
          setUsername(user.username)
        }
      }
    })
  }, [])
  const authStore = useAuthStore()
  const userData = {
    ...sidebarData.user,
    email: authStore.auth.user?.email || '',
    name: username,
  }
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
