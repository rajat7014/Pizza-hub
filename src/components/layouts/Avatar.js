export default function Avatar({ user, onClick }) {
  const firstLetter =
    user?.name?.charAt(0).toUpperCase() ??
    user?.email?.charAt(0).toUpperCase() ??
    'U'

  return (
    <div
      onClick={onClick}
      className='w-9 h-9 mr-4 flex items-center justify-center rounded-full bg-white text-purple-500 font-bold cursor-pointer hover:opacity-100'
    >
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt='avatar'
          className='w-full h-full rounded-full'
        />
      ) : (
        firstLetter
      )}
    </div>
  )
}
