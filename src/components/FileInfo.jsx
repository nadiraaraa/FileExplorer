import React from 'react'

const FileInfo = ({file}) => {
  return (
    <div className='border border-gray-400 p-4 w-72'>
      <div className='flex flex-col items-center justify-center'>
        <div className='square bg-white h-12 w-12 rounded-md'></div>
        <div className='title p-2 font-bold'>{file.name}</div>
      </div>
      <div>
        <div>Type: {file.extension}</div>
        <div>Size: {file.size}</div>
        <div>Path: {file.path}</div>
        <div>Created: {new Date(file.createdAt).toLocaleString()}</div>
      </div>
    </div>
  )
}

export default FileInfo;