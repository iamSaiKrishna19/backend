import otpgenrator from "otp-generator"

const generateOTP = ()=>{
    return otpgenrator.generate(6,
        { upperCaseAlphabets: false, 
          specialChars: false,
          lowerCaseAlphabets : false
        });
        
}


export {generateOTP}
