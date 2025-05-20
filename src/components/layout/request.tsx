// 引入 axios
import axios from '@/api/base';


export default {
  /**获取用户 */
  _GetAccount: () => {
    return axios({
      method: 'get',
      url: `/users/person`,
    })
  },
}