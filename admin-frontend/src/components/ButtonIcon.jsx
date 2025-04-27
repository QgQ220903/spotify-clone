import React from 'react'

const ButtonIcon = ({handleEvent, children}) => {
  return (
    <>
        <button onClick={handleEvent} className='capitalize btn-primary flex gap-1 select-none'> {children} </button>
    </>
  )
}

export default ButtonIcon