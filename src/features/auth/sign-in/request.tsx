// 引入 axios
import axios from '@/api/base'

export default {
  /**登录 */
  _Login: (data: any) => {
    return axios({
      method: 'post',
      url: '/auth/login',
      data,
    })
  },
}
