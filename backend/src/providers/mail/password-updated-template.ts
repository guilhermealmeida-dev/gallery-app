interface PasswordUpdatedTemplateProps {
    name: string;
    loginUrl: string;
}

export function passwordUpdatedTemplate({
    name,
    loginUrl
}: PasswordUpdatedTemplateProps): string {

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Senha atualizada</title>
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
                        Sua senha foi atualizada com sucesso.
                    </p>

                    <p>
                        Agora você pode acessar sua conta normalmente.
                    </p>

                    <a href="${loginUrl}"
                       style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#16a34a;
                            color:white;
                            text-decoration:none;
                            border-radius:6px;
                       ">
                        Acessar conta
                    </a>

                    <p>
                        Se você não realizou essa alteração,
                        entre em contato com o suporte imediatamente.
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