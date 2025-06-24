export const CardDescription = ({ card }: { card: any }) => {
  return (
    <div>
      <h3 className='mb-2 text-sm font-medium'>任务描述</h3>
      <p className='text-muted-foreground'>{card.description}</p>
    </div>
  )
}
