// 引入 axios
import axios from '@/api/base';


export default {
  /**获取所有用户 */
  _GetUsers: (data: any = {}) => {
    return axios({
      method: 'get',
      url: '/users',
      param: data,
    })
  },
  // /更新用户信息
  _UpdateUser: (id: any, data: any) => {
    return axios({
      method: 'put',
      url: `/users/${id}`,
      data: data,
    })
  },
  // /删除用户
  _DeleteUser: (id: any) => {
    return axios({
      method: 'delete',
      url: `/users/${id}`,
    })
  },
  // 新增用户
  _AddUser: (data: any) => {
    return axios({
      method: 'post',
      url: '/users/create',
      data: data,
    })
  }
}