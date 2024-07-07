const validateEmail = (email)=>{
    const string = "@gmail.com";
    return email.includes(string)
}

export {validateEmail}