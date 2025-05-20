// 引入 axios
import axios from '@/api/base';


export default {
  // 获取通知设置
  _GetNotifications: () => {
    return axios({
      method: 'get',
      url: `/notifications`,
    })
  },
  /**更新通知设置 */
  _UpdateNotifications: (data: any) => {
    return axios({
      method: 'post',
      url: `/notifications`,
      data,
    })
  },
}