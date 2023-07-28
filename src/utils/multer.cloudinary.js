import multer from 'multer'


export const fileValidation = {
    image: ['image/png' , 'image/jpeg' , 'image/gif'],
    file: ['application/pdf' , 'application/msword'],
}

export function uploadFile( customValidation = []){


    const storage = multer.diskStorage({})

    const fileFilter = (req,file,cb) =>{
        if(customValidation.includes(file.mimetype)){
         
            cb(null,true)
        } else {
            cb(new Error('In-valid file format' , {cause:400}) , false)
        }
    }
    const upload = multer({ fileFilter , storage })
    return upload
}
