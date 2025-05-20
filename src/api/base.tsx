import axios from 'axios';
import debounce from '@/utils/debounce';
import { ErrorMessages } from '@/utils/errCode';
import { showErrorData } from '@/utils/show-submitted-data';


// import { useAuthStore } from '@/stores/authStore'

// const authStore = useAuthStore()
const axiosServe: any = axios.create({
  timeout: 60000,
  baseURL: 'http://127.0.0.1:7382',
})

// 请求拦截
axiosServe.interceptors.request.use(
  (config: any) => {
    setCancelToken(config)
    setHeader(config)
    console.log('——————— 请求 ———————')
    if (config.params && Object.keys(config.params).length) {
      console.log(config.params)
    } else if (config.data && Object.keys(config.data).length) {
      console.log(config.data)
    }
    return config
  },
  (err: any) => {
    return Promise.reject(err)
  }
)

// 响应拦截
axiosServe.interceptors.response.use(
  async (response: any) => {
    const newresponse = Object.assign({}, response)
    console.log('——————— 响应 ———————')
    console.log(newresponse.data)

    return newresponse
  },
  (err: any) => {
    const errorCode = err.status
    let errorMessage = ErrorMessages[errorCode].message || 'unknown error'
    debounce(() => showErrorData(errorMessage), 300)()

    return Promise.reject(err)
  }
)

// 设置中断请求
const setCancelToken = (config: any) => {
  config.cancelToken = new axios.CancelToken((e: any) => {
    const { url, requestData } = config
    // 在这里阻止重复请求，上个请求未完成时，相同的请求不会再次执行
    if (!url) {
      e(`重复请求中断：${config.url}`)
    }
  })
}
const setHeader = (config: any) => {
  const cookies = document.cookie.split('; ').reduce((prev: any, current) => {
    const [name, value] = current.split('=')
    prev[name] = value
    return prev
  }, {})
  const token = decodeURIComponent(cookies['shadcn'])
  if (token) {
    if (!config.headers) {
      config.headers = {}
    }
    config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`
  }
  return config
}
export default axiosServe