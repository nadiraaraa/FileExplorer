import React, { useEffect, useRef } from 'react';
import { useState } from 'react'
import { useFolder, useCreateFolder, useDeleteItem } from '../pages/fetchAPI';

const Folder = ({ dir, setFolderTree, setOpenFile, setPulse, isPulse }) => {
  const [sortOption, setSortOption] = useState('name');
  const { data: folderContent, isLoading, error, refetch } = useFolder(dir, sortOption);
  const createFolderMutation = useCreateFolder(dir);
  const deleteItemMutation = useDeleteItem(dir);
  
  const [focusItem, setFocusItem] = useState(null);
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [errorMsg, setErrorMsg] = useState("")
  const inputRef = useRef(null);

  useEffect(() => {
    if (isPulse) {
      const timer = setTimeout(() => {
        setPulse(false);
        setFocusItem(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isPulse]);

  const addFolder = () => {
    setAddingFolder(true);
    setNewFolderName("New Folder");
  }

  const saveFolder = async () => {
    if (newFolderName.trim()) {

      const nameExists = folderContent.some(item => item.name === newFolderName);
      setErrorMsg("Folder name already exists");

      if (nameExists) {
        setErrorMsg("Folder name already exists");
        return;
      }

      try {
        const res = await createFolderMutation.mutateAsync({ path: dir, name: newFolderName });

        if (res?.status === 201) {
          setAddingFolder(false);
          setErrorMsg('');
        } else {
          setErrorMsg("Failed to create folder");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to create folder");
      }

    } else {
      setErrorMsg("Folder name cannot be empty");
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    refetch();
  };

  const openItem = (item, idx) => {
    if (item.type === "folder") {
      setFolderTree((prevTree) => {
        const depth = dir.split('/').length;
        const newTree = [...prevTree.slice(0, depth), dir + '/' + item.name];
        return newTree;
      });
      setOpenFile(null);
    } else {
      setFolderTree((prevTree) => {
        const depth = dir.split('/').length;
        const newTree = [...prevTree.slice(0, depth)];
        return newTree;
      });
      setOpenFile(item);
    }
    setFocusItem(item.name);
  }

  const handleDelete = async (item) => {
    try {
      const res = await deleteItemMutation.mutateAsync(dir + '/' + item.name);

      if (res?.status === 200) {
        if (focusItem === item.name) {
          setFocusItem(null);
          setFolderTree(prevTree => {
            const depth = dir.split('/').length;
            return [...prevTree.slice(0, depth)];
          });
        }
      } else {
        console.error("Failed to delete item:");
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Something went wrong...</div>
  }
  return (
    <div className={`border border-gray-400 h-full w-72 overflow-y-hidden `}>
      {/* ${currentFocus.pulse && ' animate-pulse'} */}
      <div className='Header flex justify-between w-full p-2 bg-gray-600'>
        <div>{dir == '.' ? 'Root' : dir.split('/').pop()}</div>
        <div>
          <label htmlFor='sort'>Sort by</label>
          <select
            id='sort-options'
            value={sortOption}
            onChange={handleSortChange}
            className=''
          >
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>
      <div className='p-4 h-full overflow-y-auto'>
        <ul>
          {folderContent.map(((item, idx) => (
            <li key={idx}
              onDoubleClick={e => openItem(item, idx)}
              className={`hover:bg-sky-700 flex gap-x-2 px-2 items-center rounded-md 
                ${item.name === focusItem ? 'bg-blue-600' : item.name === focusItem ? 'bg-gray-500' : ''} 
                ${isPulse && item.name === focusItem && ' animate-pulse'}
                `}
            >
              <div className={`h-4 w-4 rounded-sm ' ${item.type === "folder" ? 'bg-blue-400' : 'bg-white'}`}></div>
              <div className='flex justify-between items-center w-full'>
                <div>{item.name}</div>
                <div className='bg-gray-600 px-1 text-sm h-4 rounded-sm' onClick={() => handleDelete(item)}>Del</div>
              </div>
            </li>
          )))}
          <li key={"add-folder"} onDoubleClick={e => addFolder()}
            className={`hover:bg-sky-700 flex gap-x-2 px-2 items-center rounded-md`}
          >
            <div className={`h-4 w-4 rounded-sm bg-blue-800 self-start mt-1 flex items-center justify-center`}> + </div>
            {addingFolder ? (
              <div>
                <input
                  ref={inputRef}
                  type="text"
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    setErrorMsg('');
                  }}
                  onBlur={saveFolder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveFolder();
                    if (e.key === 'Escape') { setAddingFolder(false); setErrorMsg(''); };
                  }}
                  className={` ${errorMsg ? 'border border-red-500' : 'border border-gray-300'}`}
                />
                {errorMsg && (
                  <span className="text-red-500 text-sm mt-1">{errorMsg}</span>
                )}
              </div>

            )
              :
              <div>Add Folder</div>
            }
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Folder;