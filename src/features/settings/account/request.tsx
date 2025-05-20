// 引入 axios
import axios from '@/api/base';


export default {
  /**更新账户配置 */
  _UpdateAccount: (data: any) => {
    return axios({
      method: 'post',
      url: '/users/person',
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