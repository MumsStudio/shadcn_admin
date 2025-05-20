// 引入 axios
import axios from '@/api/base';


export default {
  /**获取文档 */
  _GetDocument: (data: any = {}) => {
    return axios({
      method: 'get',
      url: '/documents',
      param: data,
    })
  },
  // /更新文档
  _UpdateDocument: (id: any, data: any) => {
    return axios({
      method: 'post',
      url: `/documents/${id}`,
      data: data,
    })
  },
  // /删除文档
  _DeleteDocument: (id: any) => {
    return axios({
      method: 'delete',
      url: `/documents/${id}`,
    })
  },
  // 新增文档
  _AddDocument: (data: any) => {
    return axios({
      method: 'post',
      url: '/documents',
      data: data,
    })
  },
}