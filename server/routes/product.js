const config = require('../../server/config/dev');
const express = require('express');
const router = express.Router();
const { User } = require("../models/User");

const { auth } = require("../middleware/auth");

const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')

aws.config.update({
    secretAccessKey: config.s3.userConfig.secretAccessKey,
    accessKeyId: config.s3.userConfig.accessKeyId,
    region: config.s3.region
})

const s3 = new aws.S3()
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/')
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}_${file.originalname}`)
//     },
//     fileFilter: (req, file, cb) => {
//         const ext = path.extname(file.originalname)
//         if (ext !== '.jpg' || ext !== '.png') {
//             return cb(res.status(400).end('only jpg, png are allowed'), false)
//         }
//         cb(null, true)
//     }
// })

// var upload = multer({storage: storage}).single("file")

const uploadPicture = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.s3.bucketName,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname})
          },
        key: function (req, file, cb) {
        cb(null, 'photos/' + Date.now().toString() + '.' + file.originalname.substr(file.originalname.lastIndexOf('.') + 1))
        },
        fileFilter: (req, file, cb) =>{
            const ext = path.extname(file.originalname)
            if (ext !== '.jpg' || ext !== '.png') {
                return cb(res.status(400).end('only jpg, png are allowed'), false)
            }
            cb(null, true)
        }
    })
})
//=================================
//             Product
//=================================

router.post("/uploadImage", auth, (req, res) => {
    const singleUpload = uploadPicture.single("file")
    //after getting image from client we need to save it in server
    singleUpload(req, res, function (err, some) {
        if (err) {
          res.status(422).json({
            success: false,
            message: 'error'
          })
          return null
        }
        res.status(200).json({
            success: true,
            image: req.file.location
        })
      })

})

module.exports = router;
