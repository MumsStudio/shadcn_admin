import { toast } from 'sonner';


export function showSubmittedData(
  data: unknown,
  title: string = 'You submitted the following values:'
) {
  toast.message(title, {
    description: (
      // w-[340px]
      <pre className='mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  })
}

// 异常消息通知
export function showErrorData(
  data: any,
  title: string = 'something went wrong',
  duration: number = 3000
) {
  toast.error(title, {
    description: (
      // w-[340px]
      <span>{data}</span>
    ),
    duration,
  })
}
// 成功消息通知
export function showSuccessData(
  data: any,
  title: string = 'successfully',
  duration: number = 3000
) {
  toast.success(title, {
    description: (
      // w-[340px]
      <span>{data}</span>
    ),
    duration,
  })
}