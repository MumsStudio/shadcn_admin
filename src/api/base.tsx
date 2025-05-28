import axios from 'axios';
import debounce from '@/utils/debounce';
import { ErrorMessages } from '@/utils/errCode';
import { showErrorData } from '@/utils/show-submitted-data';


// import { useAuthStore } from '@/stores/authStore'

// const authStore = useAuthStore()
const axiosServe: any = axios.create({
  timeout: 60000,
  baseURL: import.meta.env.VITE_API_URL,
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
    console.log(err)
    const errMsg = ErrorMessages[errorCode] || []
    let errorMessage = errMsg.message || 'unknown error'
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
  // 排除登录注册接口
  if (
    config.url &&
    (config.url.includes('/auth/register') ||
      config.url.includes('/auth/login'))
  ) {
    return config
  }

  const cookies = document.cookie.split('; ').reduce((prev: any, current) => {
    const [name, value] = current.split('=')
    prev[name] = value
    return prev
  }, {})
  const token = decodeURIComponent(cookies['shadcn'])
  if (token && token !== 'undefined') {
    if (!config.headers) {
      config.headers = {}
    }
    config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`
  } else {
    showErrorData('登录已过期，请重新登录')
    setTimeout(() => {
      window.location.href = '/sign-in'
    }, 1000)
  }
  return config
}
export default axiosServe