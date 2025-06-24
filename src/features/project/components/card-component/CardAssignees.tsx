export const CardAssignees = ({ card }: { card: any }) => {
  return (
    <div>
      <h3 className='mb-2 text-sm font-medium'>负责人</h3>
      <p className='text-muted-foreground'>{card.assignedTo}</p>
    </div>
  )
}
