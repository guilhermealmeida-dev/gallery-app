type WelcomeTemplateProps = {
    name: string;
    loginUrl: string;
};

export function welcomeTemplate({
    name,
    loginUrl
}: WelcomeTemplateProps): string {

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bem-vindo!</title>
            </head>

            <body style="
                margin:0;
                padding:0;
                background:#f5f5f5;
                font-family:Arial, Helvetica, sans-serif;
            ">
                <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="background:#f5f5f5;padding:40px 0;"
                >
                    <tr>
                        <td align="center">
                            <table
                                role="presentation"
                                width="420"
                                cellpadding="0"
                                cellspacing="0"
                                style="
                                    background:#ffffff;
                                    border-radius:12px;
                                    padding:40px;
                                    text-align:center;
                                    box-shadow:0 10px 30px rgba(0,0,0,.1);
                                "
                            >
                                <tr>
                                    <td style="font-size:64px;">
                                        🎉
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <h1 style="
                                            margin:20px 0 10px;
                                            color:#111827;
                                            font-size:28px;
                                        ">
                                            Bem-vindo, ${name}!
                                        </h1>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        color:#6b7280;
                                        font-size:16px;
                                        line-height:24px;
                                    ">
                                        Sua conta foi criada com sucesso e já está pronta para uso.
                                        Clique no botão abaixo para acessar a plataforma.
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-top:32px;">
                                        <a
                                            href="${loginUrl}"
                                            style="
                                                display:inline-block;
                                                background:#2563eb;
                                                color:#ffffff;
                                                text-decoration:none;
                                                padding:14px 28px;
                                                border-radius:8px;
                                                font-weight:bold;
                                            "
                                        >
                                            Acessar plataforma
                                        </a>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding-top:32px;
                                        color:#9ca3af;
                                        font-size:14px;
                                    ">
                                        Se o botão não funcionar, copie e cole o link abaixo em seu navegador:
                                        <br><br>
                                        <a
                                            href="${loginUrl}"
                                            style="color:#2563eb;word-break:break-all;"
                                        >
                                            ${loginUrl}
                                        </a>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `;
}