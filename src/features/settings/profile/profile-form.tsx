import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import {
  showErrorData,
  showSubmittedData,
  showSuccessData,
} from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Request from './request'

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: 'Please enter a valid URL.' }),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  bio: '',
  // urls: [{ value: 'https://shadcn.com' }],
}

export default function ProfileForm() {
  const authStore = useAuthStore()
  const [emailname, setEmailname] = useState('')
  useEffect(() => {
    async function fetchData() {
      try {
        const accountRes = await Request._GetAccount()
        if (accountRes.data) {
          console.log(accountRes.data)
          const person = accountRes.data.user.person || {}
          if (person && person.name) {
            setEmailname(person.name)
          }

          const profileRes = await Request._GetProfile()
          console.log(profileRes.data, 'profileRes.data')
          if (profileRes.data) {
            const profileData = {
              ...profileRes.data,
              email:
                profileRes.data.email ||
                (emailname ? `${emailname}@example.com` : ''),
              urls:
                profileRes.data.urls.length > 0
                  ? profileRes.data.urls.map((item: any) => ({
                      value: item,
                  })):[]
            }
            form.reset(profileData)
          }
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    }
    fetchData()
  }, [authStore.auth.user?.email])
  const updateProfile = (data: any) => {
    if (!data.urls) {
      data = {
        ...data,
        urls: [],
      }
    }
    data.urls = data.urls.map((item: any) => item.value)
    console.log(data, 'data')

    Request._UpdateProfile(data).then((res: any) => {
      if (res) {
        showSuccessData('updated successfully')
      } else {
        showErrorData('updated failed')
      }
    })
  }
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => updateProfile(data))}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='shadcn' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym. You can only change this once every 30 days.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={emailname === ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a verified email to display' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={`${emailname}@example.com`}>
                    {emailname}@example.com
                  </SelectItem>
                  <SelectItem value={`${emailname}@google.com`}>
                    {emailname}@google.com
                  </SelectItem>
                  <SelectItem value={`${emailname}@support.com`}>
                    {emailname}@support.com
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                You can manage verified email addresses in your{' '}
                <Link to='/settings/account'>Settings/Account</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us a little bit about yourself'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can <span>@mention</span> other users and organizations to
                link to them.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={index}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    URLs
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    Add links to your website, blog, or social media profiles.
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            Add URL
          </Button>
        </div>
        <Button type='submit'>Update profile</Button>
      </form>
    </Form>
  )
}
