import nodemailer from "nodemailer";
import { ENVIROMENTS } from "../../env-config.ts";
import { Email } from "../../types/mail.ts";

const transporter = nodemailer.createTransport(
    {
        host: ENVIROMENTS.mail.host,
        port: ENVIROMENTS.mail.port,
        secure: ENVIROMENTS.mail.secure,
        auth: {
            user: ENVIROMENTS.mail.auth.user,
            pass: ENVIROMENTS.mail.auth.pass
        }
    }
);

export async function verfyMail() {
    try {
        await transporter.verify();
        console.log("Servidor de email funcionando...");
    } catch (error) {
        console.error("Verificação falhou:", error);
    }
}

export async function sendEmail(props: Email) {
    try {
        await transporter.sendMail({
            from: ENVIROMENTS.mail.auth.user,
            to: props.to,
            subject: props.subject,
            text: props.text,
            html: props.html
        });
    } catch (error) {
        console.error("Erro ao enviar email:", error);
    }
}