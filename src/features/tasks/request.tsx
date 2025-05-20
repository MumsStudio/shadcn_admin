// 引入 axios
import axios from '@/api/base';


export default {
  /**获取任务列表 */
  _GetTasks: () => {
    return axios({
      method: 'get',
      url: `/tasks`,
    })
  },
  // /更新任务
  _UpdateTasks: (id: any, data: any) => {
    return axios({
      method: 'put',
      url: `/tasks/${id}`,
      data: data,
    })
  },
  // /删除任务
  _DeleteTasks: (id: any) => {
    return axios({
      method: 'delete',
      url: `/tasks/${id}`,
    })
  },
  // 新增任务
  _AddTasks: (data: any) => {
    return axios({
      method: 'post',
      url: '/tasks/create',
      data: data,
    })
  },
  // 导入任务
  _ImportTasks: (data: any) => {
    const formData = new FormData();
    formData.append('file', data); // 假设 data 是文件对象，或者你可以根据需要进行转换
    return axios({
      method: 'post',
      url: '/tasks/import',
      data: formData,
    })
  },
}