import React from 'react'
import { useState, useEffect } from 'react'
import Folder from '../components/Folder'
import FileInfo from '../components/FileInfo'

const Home = () => {
    const homeDir = '.';
    const [folderTree, setFolderTree] = useState([{ dir: homeDir, isDir: true, files: [], focus: null}]);
    const [currentFocus, setCurrentFocus] = useState({file: null, pulse: false});

    useEffect(() => {
        const fetchFiles = async (directory) => {
            try {
                const fileList = await window.electron.getFiles(directory); 
                setFolderTree((prevTree) => {
                    const updatedTree = [...prevTree];
                    updatedTree[updatedTree.length - 1].files = fileList; 
                    return updatedTree;
                });
            } catch (error) {
                console.error('Failed to fetch files:', error);
            }
        };

        if (folderTree[folderTree.length-1].isDir && folderTree[folderTree.length-1].files.length == 0){
            const lastDirectory = folderTree[folderTree.length - 1].dir;
            fetchFiles(lastDirectory);
        }
    }, [folderTree]); 

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentFocus({ file: null, pulse: false });
        }, 2000);
    
        return () => clearTimeout(timer);
    }, [currentFocus.pulse]);

    const openItem = (item, depth) => {
        setFolderTree((prevTree) => {
            const newTree = [
                    ...prevTree.slice(0, depth),
                    {
                    dir: './' + item.path,
                    isDir: item.isDirectory,
                    ...(item.isDirectory
                        ? { files: [] }
                        : { info: item })
                    }
                ];
            newTree[depth-1].focus = item;
            return newTree;
        });
        setCurrentFocus(prevFocus => ({...prevFocus, file: item}));
    }

    const handleBack = () => {
        if (folderTree.length > 1){
            setFolderTree((prevTree) => prevTree.slice(0, prevTree.length - 1));
            if (currentFocus.file){
                setCurrentFocus(prevFocus => ({...prevFocus, pulse: true}));
            }
        }
    } 

    return (
        <div className='Home h-screen w-screen flex flex-col'>
            <div className='Header flex p-3 gap-x-4 bg-gray-700 w-full items-center'>
                <div onClick={handleBack} className='bg-gray-600 p-2 rounded-md'>Back</div>
                <div>Documents</div>
            </div>
            <div className='overflow-x-hidden h-full'>
                <div className='Folders h-full overflow-x-auto'>
                    <div className='flex h-full'>
                        {folderTree.map((item, index) => (
                            item.isDir ? (
                                <div key={index}>
                                    <Folder dir={item.dir} files={item.files} focusItem={item.focus} currentFocus={currentFocus} openItem={openItem}/>
                                </div>
                            ) : (
                                <div key={index}>
                                    <FileInfo file={item.info} />
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Home