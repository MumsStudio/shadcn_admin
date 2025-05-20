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
  // 保存用户对话
  _SaveUserChat: (data: any) => {
    return axios({
      method: 'post',
      url: 'messages/save',
      data: data,
    })
  },
  // 查询用户对话
  _GetUserChat: (user1: any, user2: any) => {
    return axios({
      method: 'get',
      url: `/messages/between/${user1}/${user2}`,
    })
  },
  // 获取该用户所有消息列表
  _GetChatList: (user: any) => {
    return axios({
      method: 'get',
      url: `/messages/latest/${user}`,
    })
  },
  // 获取单个用户信息
  _GetUserInfo: (user: any) => {
    return axios({
      method: 'post',
      url: `/users`,
      data: { email: user },
    })
  },
}