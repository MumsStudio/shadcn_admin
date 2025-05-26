// 引入 axios
import axios from '@/api/base';


export default {
  /**获取白板 */
  _GetWhiteboard: (data: any = {}) => {
    return axios({
      method: 'get',
      url: '/whiteboard',
      param: data,
    })
  },
  // /更新白板
  _UpdateWhiteboard: (id: any, data: any) => {
    return axios({
      method: 'post',
      url: `/whiteboard/${id}`,
      data: data,
    })
  },
  // /删除白板
  _DeleteWhiteboard: (id: any) => {
    return axios({
      method: 'delete',
      url: `/whiteboard/${id}`,
    })
  },
  // 新增白板
  _AddWhiteboard: (data: any) => {
    return axios({
      method: 'post',
      url: '/whiteboard',
      data: data,
    })
  },
  // 获取白板详情
  _GetWhiteboardDetail: (id: any) => {
    return axios({
      method: 'get',
      url: `/whiteboard/${id}`,
    })
  },
  // 更新白板详情
  _UpdateWhiteboardDetail: (id: any, data: any) => {
    return axios({
      method: 'patch',
      url: `/whiteboard/${id}`,
      data: data,
    })
  },
  // 获取白板历史记录
  _GetWhiteboardHistory: (id: any) => {
    return axios({
      method: 'get',
      url: `/whiteboard/${id}/history`,
    })
  },
  // 设置白板权限
  _SetWhiteboardPermission: (id: any) => {
    return axios({
      method: 'post',
      url: `/whiteboard/${id}/permissions`,
    })
  }
}