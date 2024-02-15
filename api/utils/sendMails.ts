import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: "omar.maldo.vi@gmail.com",
    pass: "cxzk vnxm wfeh abbp",
  },
})

export const enviarMail = async (mensaje: string) => {
  return transporter.sendMail({
    from: {
      name: "Omar Maldonado",
      address: "omar.maldo.vi@gmail.com",
    },
    to: "crm.pa@dakshina.org.mx",
    subject: "error",
    text: mensaje,
  })
}
