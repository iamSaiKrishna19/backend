import { v2 as cloudinary } from 'cloudinary';


// Configuration
cloudinary.config({ 
    cloud_name: "learningbackendsai", 
    api_key: "753579358564272", 
    api_secret: "F0KcWWvm1-LpZUYo020sdi1m9tA" 
});

const image = "public/temp/gta_6_muscle_car_video_game-wallpaper-1920x1080.jpg"
// const response = await cloudinary.uploader.upload(image)
// console.log(response)
const obj = "czuvq1fr9apaeovto8rz"
await cloudinary.uploader.destroy(obj)
