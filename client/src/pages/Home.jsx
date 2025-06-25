import React from 'react'
import { useState } from 'react'
import Folder from '../components/Folder'
import FileInfo from '../components/FileInfo'

const Home = () => {
    const homeDir = '.';
    const [folderTree, setFolderTree] = useState([homeDir]);
    const [openFile, setOpenFile] = useState(null);
    const [isPulse, setPulse] = useState(false);

    const handleBack = () => {
        if(openFile){setOpenFile(null);}
        else if (folderTree.length > 1){
            setFolderTree((prevTree) => prevTree.slice(0, prevTree.length - 1));
        }
        setPulse(true);
    } 

    return (
        <div className='Home h-screen w-screen flex flex-col'>
            <div className='Header flex p-3 gap-x-4 bg-gray-700 w-full items-center'>
                <div onClick={handleBack} className='bg-gray-600 p-2 rounded-md'>Back</div>
                <div>{folderTree[folderTree.length-1] + (openFile ? '/' + openFile.name : '') }</div> 
            </div>
            <div className='overflow-x-hidden h-full'>
                <div className='Folders h-full overflow-x-auto'>
                    <div className='flex h-full'>
                        {folderTree.map((item, idx) => (
                            <div key={idx}>
                                <Folder dir={item} setFolderTree={setFolderTree} setOpenFile={setOpenFile} setPulse={setPulse} isPulse={idx==folderTree.length-1 ? isPulse : false}/>
                            </div>
                        ))}
                        {openFile ? <FileInfo file={openFile} path={folderTree[folderTree.length-1]} /> : null}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Home