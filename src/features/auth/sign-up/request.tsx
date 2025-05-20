// 引入 axios
import axios from '@/api/base';


export default {
  /**注册 */
  _Register: (data: any) => {
    return axios({
      method: 'post',
      url: '/auth/register',
      data,
    })
  },
}