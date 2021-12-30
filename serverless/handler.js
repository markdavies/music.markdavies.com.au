// handler.js

const aws = require('aws-sdk')
const ses = new aws.SES()
const myEmail = process.env.EMAIL
const myDomain = process.env.DOMAIN

function generateResponse (code, response) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(response)
  }
}

function generateError (code, response) {
  console.log(err)
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(response)
  }
}

function generateEmailParams (body) {

  const { first_name, last_name, email, phone_number, number_guests, stayed_before, dates_interested } = JSON.parse(body);

  if (!(first_name && last_name && email && phone_number && number_guests && stayed_before && dates_interested)) {
    throw new Error('Missing parameters!')
  }

  return {
    Source: myEmail,
    Destination: { ToAddresses: [myEmail] },
    Message: {
      Body: {
        Text: { 
          Charset: 'UTF-8',
          Data: `First Name: ${first_name}\nFirst Name: ${last_name}\nEmail: ${email}\nPhone Number: ${phone_number}\nNumber of Guests: ${number_guests}\nStayed Before: ${stayed_before}\nDates Interested In: ${dates_interested}` 
        }
      },
      Subject: { 
        Charset: 'UTF-8',
        Data: "New enquiry on banksiabeachhouse.com"
      }
    },
    Source: "info@banksiabeachhouse.com"
  }
}

module.exports.send = async (event) => {
  try {
    const emailParams = generateEmailParams(event.body)
    const data = await ses.sendEmail(emailParams).promise()
    return generateResponse(200, {success: true})
  } catch (err) {
    return generateError(500, {success: false, err: err.message})
  }
}