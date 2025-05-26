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
  // 获取文档详情
  _GetDocumentDetail: (id: any) => {
    return axios({
      method: 'get',
      url: `/cloud-document/${id}`,
    })
  },
  // 更新文档详情
   _UpdateDocumentDetail: (id: any,data: any) => {
    return axios({
      method: 'patch',
      url: `/cloud-document/${id}`,
      data: data,
    })
  },
  // 创建文档详情
   _CreateDocumentDetail: (id: any) => {
    return axios({
      method: 'post',
      url: `/cloud-document/${id}`,
    })
  },
  // 获取文档历史记录
   _GetDocumentHistory: (id: any) => {
    return axios({
      method: 'get',
      url: `/cloud-document/${id}/history`,
    })
  },
  // 设置文档权限
   _SetDocumentPermission: (id: any) => {
    return axios({
      method: 'post',
      url: `/document/${id}/permissions`,
    })
  }
}