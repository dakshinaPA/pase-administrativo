import nodemailer from "nodemailer"

export const enviarMail = async (mensaje: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: "omar.maldo.vi@gmail.com",
        pass: "cxzk vnxm wfeh abbp",
      },
    })

    return transporter.sendMail({
      from: {
        name: "Omar Maldonado",
        address: "omar.maldo.vi@gmail.com",
      },
      to: "crm.pa@dakshina.org.mx",
      subject: "error",
      text: mensaje,
    })
  } catch (error) {
    console.log(error)
    return(error)
  }
}
