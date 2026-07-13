interface ForgotPasswordTemplateProps {
    name: string;
    token: string;
    resetPasswordUrl: string;
}

export function forgotPasswordTemplate({
    name,
    token,
    resetPasswordUrl,
}: ForgotPasswordTemplateProps): string {

    const url = `${resetPasswordUrl}?token=${token}`;

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Recuperação de senha</title>
            </head>

            <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
                <div style="
                    max-width:600px;
                    margin:auto;
                    background:white;
                    padding:30px;
                    border-radius:8px;
                ">
                    <h2>Olá, ${name}!</h2>

                    <p>
                        Recebemos uma solicitação para redefinir sua senha.
                    </p>

                    <p>
                        Clique no botão abaixo para criar uma nova senha:
                    </p>

                    <a href="${url}"
                       style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#2563eb;
                            color:white;
                            text-decoration:none;
                            border-radius:6px;
                       ">
                        Recuperar senha
                    </a>

                    <p>
                        Caso você não tenha solicitado essa alteração,
                        ignore este email.
                    </p>

                    <p>
                        Este link possui validade limitada por segurança.
                    </p>

                    <hr>

                    <small>
                        Este é um email automático, não responda.
                    </small>
                </div>
            </body>
        </html>
    `;
}