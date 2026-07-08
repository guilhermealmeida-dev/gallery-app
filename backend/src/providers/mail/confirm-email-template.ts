type ConfirmEmailTemplateProps = {
    name: string;
    confirmationUrl: string;
};

export function confirmEmailTemplate({
    name,
    confirmationUrl
}: ConfirmEmailTemplateProps): string {

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Confirmação de email</title>
            </head>

            <body>
                <h1>Olá, ${name}!</h1>

                <p>
                    Obrigado por criar sua conta.
                </p>

                <p>
                    Clique no botão abaixo para confirmar seu email:
                </p>

                <a 
                    href="${confirmationUrl}"
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#2563eb;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                    "
                >
                    Confirmar email
                </a>

                <p>
                    Se você não criou esta conta, ignore esta mensagem.
                </p>
            </body>
        </html>
    `;
}