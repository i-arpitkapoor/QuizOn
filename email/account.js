const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendEmail = (email, name, questions) => {
    var text = `Hi, ${name}
    
    `
    questions.forEach((question) => {
        text += `Q. ${question.q}
        A. ${question.a}
        
        `
    })

    sgMail.send({
        to: email,
        from: 'kapoor.arpit@live.com',
        subject: 'Quiz App',
        text: text
    })
}

module.exports = {
    sendEmail
}