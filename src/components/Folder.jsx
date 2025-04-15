import React from 'react';
import { useState } from 'react'

const Folder = ({ dir, files, focusItem, currentFocus, openItem }) => {
  const [sortOption, setSortOption] = useState('');
  const dirPaths = dir.split('/');
  const dirDepth = dirPaths.length;
  const title = dirPaths[dirDepth - 1];

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const sortFiles = () => {
    switch (sortOption) {
      case 'name':
        return [...files].sort((a, b) => a.name.localeCompare(b.name));
      case 'size':
        return [...files].sort((a, b) => a.size - b.size);
      case 'date':
        return [...files].sort((a, b) => a.createdAt - b.createdAt);
      default:
        return files;
    }
  };

  return (
    <div className='border border-gray-400 h-full w-72 overflow-y-hidden'>
      <div className='Header flex justify-between w-full p-2 bg-gray-600'>
        <div>{dir == '.' ? 'Root' : title}</div>
        <div>
          {/* <label htmlFor='sort'>Sort by</label> */}
          <select
            id='sort-options'
            value={sortOption}
            onChange={handleSortChange}
            className=''
          >
            <option value="">Sort by</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>
      <div className='p-4 h-full overflow-y-auto'>
        <ul>
          {sortFiles(files).map((item => (
            <li key={item.path}
              onDoubleClick={e => openItem(item, dirDepth)}
              className={`hover:bg-sky-700 flex gap-x-2 px-2 items-center rounded-md ${item == currentFocus ? 'bg-blue-600' : item==focusItem ? 'bg-gray-500' : ''}`}
            >
              <div className={`h-4 w-4 rounded-sm ' ${item.isDirectory ? 'bg-blue-400' : 'bg-white'}`}></div>
              <div>{item.name}</div>
            </li>
          )))}
        </ul>
      </div>
    </div>
  )
}

export default Folder;