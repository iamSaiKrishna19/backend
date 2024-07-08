// import { v2 as cloudinary } from 'cloudinary';


// // Configuration
// cloudinary.config({ 
//     cloud_name: "learningbackendsai", 
//     api_key: "753579358564272", 
//     api_secret: "F0KcWWvm1-LpZUYo020sdi1m9tA" 
// });

// const image = "public/temp/gta_6_muscle_car_video_game-wallpaper-1920x1080.jpg"
// // const response = await cloudinary.uploader.upload(image)
// // console.log(response)
// const obj = "czuvq1fr9apaeovto8rz"
// await cloudinary.uploader.destroy(obj)


let mailTransporter =
    nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: 'saipubg832@gmail.com',
                pass: 'Sai'
            }
        }
    );
    console.log(mailTransporter);
    
    // let mailDetails = {
    //     from: 'saipubg832@gmail.com',
    //     to: 'saikrishnavaijwade@gmail.com',
    //     subject: 'Test mail',
    //     text: 'Node.js testing mail for GeeksforGeeks'
    // };
     
    // mailTransporter
    //     .sendMail(mailDetails,
    //         function (err, data) {
    //             if (err) {
    //                 console.log('Error Occurs',err);
    //             } else {
    //                 console.log('Email sent successfully');
    //             }
    //         });