// 获取最后编辑时间
export const formatLastEditedTime = (timestamp: string) => {
  const now = new Date()
  const editedTime = new Date(timestamp)
  const diffInMs = now.getTime() - editedTime.getTime()
  const diffInSec = Math.floor(diffInMs / 1000)
  const diffInMin = Math.floor(diffInSec / 60)
  const diffInHrs = Math.floor(diffInMin / 60)
  const diffInDays = Math.floor(diffInHrs / 24)

  if (diffInDays > 0) {
    return editedTime.toLocaleString()
  } else if (diffInHrs > 0) {
    return `${diffInHrs}小时前`
  } else if (diffInMin > 0) {
    return `${diffInMin}分钟前`
  } else {
    return `${diffInSec}秒前`
  }
}