// 引入 axios
import axios from '@/api/base';


export default {
  /**创建项目*/
  _CreateProject: (data: any = {}) => {
    return axios({
      method: 'post',
      url: '/projects',
      data,
    })
  },
  // /查询当前用户加入的项目
  _GetProjects: () => {
    return axios({
      method: 'get',
      url: `/projects`,
    })
  },
  // 查询单个项目详情
  _GetProjectDetail: (id: any) => {
    return axios({
      method: 'get',
      url: `/projects/${id}`,
    })
  },
  // 删除项目
  _DeleteProject: (id: any) => {
    return axios({
      method: 'delete',
      url: `/projects/${id}`,
    })
  },
  // 编辑项目
  _UpdateProject: (id: any, data: any) => {
    return axios({
      method: 'patch',
      url: `/projects/${id}`,
      data: data,
    })
  },
  /**获取所有用户 */
  _GetUsers: (data: any = {}) => {
    return axios({
      method: 'get',
      url: '/users',
      param: data,
    })
  },
  // 添加项目成员
  _AddProjectMember: (id: any, data: any) => {
    return axios({
      method: 'post',
      url: `/projects/${id}/members`,
      data: data,
    })
  },
  // 编辑项目成员
  _EditProjectMember: (projectId: any, data: any, id: any) => {
    return axios({
      method: 'put',
      url: `/projects/${projectId}/members/${id}`,
      data: data,
    })
  },
  // 删除项目成员
  _DeleteProjectMember: (projectId: any, id: any) => {
    return axios({
      method: 'delete',
      url: `/projects/${projectId}/members/${id}`,
    })
  },
  // 新增项目团队
  _AddProjectTeam: (projectId: any, data: any) => {
    return axios({
      method: 'post',
      url: `/projects/${projectId}/teams`,
      data: data,
    })
  },
  //  编辑项目团队
  _UpdateProjectTeam: (projectId: any, data: any, id: any) => {
    return axios({
      method: 'put',
      url: `/projects/${projectId}/teams/${id}`,
      data: data,
    })
  },
  // 删除项目团队
  _DeleteProjectTeam: (projectId: any, id: any) => {
    return axios({
      method: 'delete',
      url: `/projects/${projectId}/teams/${id}`,
    })
  },
  // 获取小组列表信息
  _GetTeamlists: (projectId: any, id: any) => {
    return axios({
      method: 'get',
      url: `/projects/${projectId}/teams/${id}`,
    })
  },
  // 创建列表
  _CreateList: (projectTeamId: any, data: any) => {
    return axios({
      method: 'post',
      url: `/projects/${projectTeamId}/lists`,
      data: data,
    })
  },
  // 删除列表
  _DeleteList: (projectTeamId: any, id: any) => {
    return axios({
      method: 'delete',
      url: `/projects/${projectTeamId}/lists/${id}`,
    })
  },
  // 编辑列表
  _UpdateList: (projectTeamId: any, data: any, id: any) => {
    return axios({
      method: 'put',
      url: `/projects/${projectTeamId}/lists/${id}`,
      data: data,
    })
  },
}