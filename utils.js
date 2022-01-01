import fs from 'fs'
const fsPromises = fs.promises;

const getDirectories = async source => {
    let res = await fsPromises.readdir(source, { withFileTypes: true })
    return res.filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
}


export { getDirectories }