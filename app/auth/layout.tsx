import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-300 to-gray-100 min-h-screen overflow-auto'>
        {children}
    </div>
  )
}


export default AuthLayout