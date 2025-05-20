// 引入 axios
import axios from '@/api/base';


export default {
  /**获取该用户 */
  _GetProfile: () => {
    return axios({
      method: 'get',
      url: `/profile`,
    })
  },
  /**更新该用户 */
  _UpdateProfile: (data: any) => {
    return axios({
      method: 'post',
      url: `/profile`,
      data,
    })
  },
    /**获取账户配置*/
  _GetAccount: () => {
    return axios({
      method: 'get',
      url: `/users/person`,
    })
  }
}