// 引入 axios
import axios from '@/api/base';


export default {
  /**获取表格*/
  _GetTable: (data: any = {}) => {
    return axios({
      method: 'get',
      url: '/table',
      param: data,
    })
  },
  // /删除表格
  _DeleteTable: (id: any) => {
    return axios({
      method: 'delete',
      url: `/table/${id}`,
    })
  },
  // 新增表格
  _AddTable: (data: any) => {
    return axios({
      method: 'post',
      url: '/table',
      data: data,
    })
  },
  // 获取表格详情
  _GetTableDetail: (id: any) => {
    return axios({
      method: 'get',
      url: `/table/${id}`,
    })
  },
  // 更新表格详情
  _UpdateTableDetail: (id: any, data: any) => {
    return axios({
      method: 'patch',
      url: `/table/${id}`,
      data: data,
    })
  },
  // 获取表格历史记录
  _GetTableHistory: (id: any) => {
    return axios({
      method: 'get',
      url: `/table/${id}/history`,
    })
  },
  // 设置表格权限
  _SetTablePermission: (id: any) => {
    return axios({
      method: 'post',
      url: `/table/${id}/permissions`,
    })
  }
}